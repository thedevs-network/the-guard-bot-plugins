import { randomInt, webcrypto } from 'crypto';
import { execFile, spawn } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { runInNewContext } from 'vm';
import type { Canvas } from '@napi-rs/canvas';

let fontRegistered = false;
let canvasModule: typeof import('@napi-rs/canvas') | undefined;
let canvasUsesSystemFonts = false;

const loadCanvas = (loadSystemFonts: boolean): typeof import('@napi-rs/canvas') => {
	if (!canvasModule) {
		// Apply the plugin setting through Canvas's initialization switch, then
		// immediately restore the environment for the rest of the bot.
		const previous = process.env.DISABLE_SYSTEM_FONTS_LOAD;
		process.env.DISABLE_SYSTEM_FONTS_LOAD = loadSystemFonts ? '' : '1';
		try {
			canvasModule = require('@napi-rs/canvas') as typeof import('@napi-rs/canvas');
			canvasUsesSystemFonts = loadSystemFonts;
		} finally {
			if (previous === undefined) delete process.env.DISABLE_SYSTEM_FONTS_LOAD;
			else process.env.DISABLE_SYSTEM_FONTS_LOAD = previous;
		}
	}
	if (canvasUsesSystemFonts !== loadSystemFonts) {
		throw new Error('Restart Guard after changing captcha.loadSystemFonts');
	}
	return canvasModule;
};

type Renderer = {
	setMessage(message: string): void;
	resetMotionCycle(): void;
	draw(): void;
	advanceMotion(milliseconds: number): void;
};

export const createCode = (): string =>
	Array.from({ length: 5 }, () => String(randomInt(10))).join('');

export type AnimationSettings = {
	loadSystemFonts?: boolean;
};

const runFile = promisify(execFile);
const encoderChecks = new Map<string, Promise<void>>();

const checkEncoder = async (executable: string): Promise<void> => {
	let check = encoderChecks.get(executable);
	if (!check) {
		check = (async () => {
			let stdout: string;
			try {
				({ stdout } = await runFile(executable, ['-hide_banner', '-encoders'], { timeout: 10000 }));
			} catch (error) {
				const failure = error as NodeJS.ErrnoException;
				if (failure.code === 'ENOENT') {
					throw new Error(`FFmpeg executable "${executable}" was not found. Install FFmpeg with libx264 support before generating CAPTCHAs.`);
				}
				throw new Error(`Cannot run FFmpeg "${executable}": ${failure.message}`);
			}
			if (!/\blibx264\b/.test(stdout)) {
				throw new Error(`FFmpeg "${executable}" does not provide the required libx264 encoder.`);
			}
		})().catch((error) => {
			encoderChecks.delete(executable);
			throw error;
		});
		encoderChecks.set(executable, check);
	}
	await check;
};

export const createAnimation = async (code: string, settings: AnimationSettings = {}): Promise<Buffer> => {
	if (!/^\d{5}$/.test(code)) throw new Error('CAPTCHA must contain five digits');
	const executable = process.env.CAPTCHA_FFMPEG_PATH || 'ffmpeg';
	await checkEncoder(executable);
	const { createCanvas, GlobalFonts } = loadCanvas(settings.loadSystemFonts ?? false);
	if (!fontRegistered) {
		if (!GlobalFonts.registerFromPath(join(__dirname, 'NotoSans-Black.ttf'), 'Arial Black')) {
			throw new Error('Cannot load the bundled CAPTCHA font');
		}
		fontRegistered = true;
	}
	const source = await readFile(join(__dirname, 'ghost-font.js'), 'utf8');
	// The original renderer needs only canvas creation and random bytes. Keep its
	// browser globals local to this instance; never modify Node's global object.
	const scope = {
		document: { createElement: () => createCanvas(1280, 720) },
		crypto: webcrypto,
		GhostFontRenderer: undefined as unknown as new (canvas: Canvas) => Renderer,
	};
	runInNewContext(source, scope, { filename: 'ghost-font.js' });
	const canvas = createCanvas(1280, 720);
	const renderer = new scope.GhostFontRenderer(canvas);
	renderer.setMessage(code);
	renderer.resetMotionCycle();

	// Render at the site's resolution, then downscale to 480x270 for delivery.
	// Preserve 30 fps; Telegram loops the shorter 3.2-second clip.
	const encoder = spawn(executable, [
		'-v', 'error', '-f', 'rawvideo', '-pixel_format', 'rgba',
		'-video_size', '1280x720', '-framerate', '30', '-i', 'pipe:0',
		'-vf', 'scale=480:270:flags=area',
		'-an', '-c:v', 'libx264', '-preset', 'medium', '-crf', '32',
		'-pix_fmt', 'yuv420p', '-movflags', 'frag_keyframe+empty_moov',
		'-f', 'mp4', 'pipe:1',
	]);
	const chunks: Buffer[] = [];
	let errorOutput = '';
	let inputError: Error | undefined;
	encoder.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
	encoder.stderr.on('data', (chunk: Buffer) => { errorOutput += chunk.toString(); });
	const encoded = new Promise<Buffer>((resolve, reject) => {
		encoder.on('error', reject);
		// Wait for close so stderr and the exit status explain broken pipes.
		encoder.stdin.on('error', (error) => { inputError = error; });
		encoder.on('close', (status, signal) => status === 0 && !inputError
			? resolve(Buffer.concat(chunks))
			: reject(new Error(`CAPTCHA video encoding failed (exit ${status}, signal ${signal || 'none'}): ${errorOutput.trim() || inputError?.message || 'no error output'}`)));
	});
	// Observe failures immediately, including when FFmpeg is missing.
	encoded.catch(() => {});
	try {
		for (let frame = 0; frame < 96; frame++) {
			renderer.draw();
			// The canvas is opaque, so its premultiplied RGBA pixels can be sent
			// directly to FFmpeg without PNG encoding or base64 copies.
			const pixels = canvas.data();
			await new Promise<void>((resolve, reject) => {
				encoder.stdin.write(pixels, (error) => error ? reject(error) : resolve());
			});
			renderer.advanceMotion(1000 / 30);
		}
		encoder.stdin.end();
		return await encoded;
	} catch (error) {
		const code = (error as NodeJS.ErrnoException).code;
		if (code === 'EPIPE' || code === 'ERR_STREAM_DESTROYED') {
			// Prefer FFmpeg's diagnostic to the secondary stdin write failure.
			await encoded;
		}
		encoder.kill();
		throw error;
	}
};
