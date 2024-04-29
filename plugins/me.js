/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: Super basic roleplay command
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");

module.exports = Composer.command('me', async (ctx) => {
	const text = ctx.message.text.split(' ').slice(1).join(' ');
	if (ctx.message.reply_to_message) {
		await ctx.reply(`*${ctx.from.first_name} ${text}*`, { parse_mode: 'Markdown', reply_to_message_id: ctx.message.reply_to_message.message_id });
	} else {
		await ctx.reply(`*${ctx.from.first_name} ${text}*`, { parse_mode: 'Markdown' });
	}
});
