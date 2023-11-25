// Source: https://t.me/c/1302052473/7544
// Author: C0rn3j
// Description:
//   Deletes stickers and gifs sent to configured groups
//   This is useful when one wants to ban stickers & GIFs but not other things bundled under them, like inline messages
//   Configure `config.pluginSettings.deleteStickersAndGIFs.groups[]` in bot config file to enable this
import { Composer } from 'telegraf';
import { config } from "../utils/config"

if (!config.pluginSettings?.deleteStickersAndGIFs?.groups) {
	console.log("Delete plugin enabled but not configured!")
}

const groups = config.pluginSettings?.deleteStickersAndGIFs?.groups;

module.exports = Composer.on('message', (ctx, next) => {
	if (groups.length === 0) {
		console.log("Delete plugin enabled but no groups are configured!")
		return
	}
	if (groups.includes(ctx.chat.id) && ctx.from.status !== 'admin') {
		if (ctx.message.sticker || ctx.message.animation) {
			ctx.deleteMessage();
		}
	}
	next();
});
