import { randomInt } from 'crypto';
import { readFile, readdir } from 'fs/promises';
import { extname, parse, resolve } from 'path';
import type { AnimationSettings } from './animation';

export type CaptchaSettings = AnimationSettings & {
	mode?: 'live' | 'pregenerated';
	directory?: string;
};

export type CaptchaMedia = {
	code: string;
	animation: Buffer;
	filename: string;
};

export const createCaptcha = async (settings: CaptchaSettings = {}): Promise<CaptchaMedia> => {
	const mode = settings.mode ?? 'live';
	if (mode === 'live') {
		// Pre-generated mode never imports Canvas or starts FFmpeg.
		const { createAnimation, createCode } = await import('./animation');
		const code = createCode();
		return { code, animation: await createAnimation(code, settings), filename: 'captcha.mp4' };
	}
	if (mode !== 'pregenerated') throw new Error(`Unknown CAPTCHA mode: ${mode}`);
	if (!settings.directory) throw new Error('CAPTCHA pregenerated mode requires a directory');
	const directory = resolve(settings.directory);
	const entries = (await readdir(directory, { withFileTypes: true })).filter((entry) =>
		entry.isFile() && ['.mp4', '.gif'].includes(extname(entry.name).toLowerCase()) &&
		parse(entry.name).name.trim().length > 0
	);
	if (!entries.length) throw new Error(`No CAPTCHA .mp4 or .gif files found in ${directory}`);
	const file = entries[randomInt(entries.length)].name;
	return {
		code: parse(file).name,
		animation: await readFile(resolve(directory, file)),
		// Never upload the original name: it contains the expected answer.
		filename: `captcha${extname(file).toLowerCase()}`,
	};
};
