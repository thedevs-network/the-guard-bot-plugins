// Run with: npx tsx plugins/captcha-ghostfont/generate.ts <directory> [count] [--system-fonts]
import { mkdir, readdir, writeFile } from 'fs/promises';
import { join, parse, resolve } from 'path';
import { createAnimation, createCode } from './animation';

const main = async () => {
	const [directory, rawCount = '100', fontOption] = process.argv.slice(2);
	const count = Number(rawCount);
	if (!directory || !Number.isInteger(count) || count < 1 || count > 100000 || (fontOption !== undefined && fontOption !== '--system-fonts')) {
		throw new Error('Usage: generate.ts <directory> [count: 1–100000, default 100] [--system-fonts]');
	}
	const target = resolve(directory);
	await mkdir(target, { recursive: true });
	const used = new Set((await readdir(target)).map((file) => parse(file).name));
	const available = 100000 - [...used].filter((name) => /^\d{5}$/.test(name)).length;
	if (count > available) throw new Error(`Only ${available} unused five-digit codes remain`);
	for (let i = 0; i < count; i++) {
		let code: string;
		do { code = createCode(); } while (used.has(code));
		const animation = await createAnimation(code, { loadSystemFonts: fontOption === '--system-fonts' });
		await writeFile(join(target, `${code}.mp4`), animation, { flag: 'wx' });
		used.add(code);
		console.log(`${i + 1}/${count}: ${code}.mp4`);
	}
};

main().catch((error) => {
	console.error(error.message);
	process.exitCode = 1;
});
