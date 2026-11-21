The CAPTCHA has two configurable modes: generate Ghost Font animations live, or serve animations from a pre-generated directory. Both work offline. Answers are compared as text, with surrounding whitespace ignored; case and leading zeros matter.

Copy `captcha-ghostfont.ts` and this directory into Guard's plugins directory. Use Node.js 22 or newer. Keep `ghost-font.js`, `NotoSans-Black.ttf`, and `FONT-LICENSE.txt` alongside `animation.ts`; if compiling TypeScript to another directory, copy those assets there too.

Configure the plugin in Guard's configuration:

```js
pluginSettings: {
  captcha: {
    mode: 'live', // default; generate a random five-digit code for each challenge
    loadSystemFonts: false, // default; only load the bundled font
  },
}
```

Live mode requires `npm install @napi-rs/canvas` in the Guard project and FFmpeg with libx264 support. Chromium and Playwright are not used. Canvas loads only the bundled Noto Sans Black font by default. Set `pluginSettings.captcha.loadSystemFonts: true` to also load the host's system fonts, at the cost of higher RAM use. No environment variable is required. Restart Guard after changing this setting. Canvas font discovery is process-wide: this setting controls initialization when the CAPTCHA first loads Canvas; another plugin that loaded Canvas earlier may already have initialized it.

To serve existing files instead:

```js
pluginSettings: {
  captcha: {
    mode: 'pregenerated',
    directory: './captcha-examples', // relative to Guard's working directory, or absolute
  },
}
```

Pre-generated mode randomly chooses a regular `.mp4` or `.gif` file directly inside the directory. The filename without its final extension is the answer: `00123.mp4` expects `00123`, and `HELLO WORLD.gif` expects `HELLO WORLD`. Use animations containing the matching text. Other extensions and subdirectories are ignored. Missing, unreadable, or empty directories produce a logged error; the plugin does not fall back to live rendering. This mode only reads directory entries and the selected file: it does not import Canvas or run FFmpeg, so neither dependency is required on a serving-only host. Uploaded filenames are changed to `captcha.mp4` or `captcha.gif` to avoid exposing the answer. Files remain available for reuse.

Generate a library ahead of time on a host with Canvas and FFmpeg installed:

```sh
npx tsx plugins/captcha-ghostfont/generate.ts ./captcha-examples 10
```

This generates 10 unique five-digit animations sequentially, including possible leading zeros, and names each file after its answer. The count defaults to 100 and must be between 1 and 100000. Existing answer filenames are skipped, and existing files are never overwritten. Copy the resulting directory to the serving host and configure `mode: 'pregenerated'`. You can also supply your own matching MP4 or GIF animations with other text answers. The generator uses only the bundled font by default; append `--system-fonts` to enable system fonts for that command.

For live rendering and batch generation, `CAPTCHA_FFMPEG_PATH` optionally overrides the FFmpeg executable (default `ffmpeg`).

Generated MP4s are 480×270 at 30 fps, last 3.2 seconds, and loop in Telegram. H.264 CRF 32 and area downscaling preserve the accepted output settings; exact size varies with the random noise. Each generation renders 96 frames with native Canvas and streams raw RGBA pixels to FFmpeg. The 60-second answer timer starts after upload. An active challenge reuses its animation and answer when the same member joins another group.

The bundled renderer in `ghost-font.js` is extracted from Mixfont's Ghost Font page bundle (`ghost-font-588f49c549707d39.js`), by Eric Lu: https://www.mixfont.com/ghost-font. Only the canvas renderer is included; the site's UI and analytics are excluded. No runtime scraping or downloads occur. Noto Sans Black is distributed under the Apache License 2.0; see `FONT-LICENSE.txt`.
