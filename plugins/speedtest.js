/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: speedtest. you need the speedtest-cli command installed.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");
const exec = require('child_process').exec;

module.exports = Composer.command('speedtest', async (ctx) => {
	if (ctx.from.id !== 147394605) return null;
	const message = await ctx.reply('Speedtest is being evaluated...');
	exec('speedtest-cli', (error, stdout, stderr) => {
		if (error) {
			console.error(`exec error: ${error}`);
			return;
		}
		ctx.telegram.editMessageText(ctx.chat.id, message.message_id, null, stdout);
	});
});

