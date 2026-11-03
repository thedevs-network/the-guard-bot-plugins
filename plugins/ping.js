/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: A Classic.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");

module.exports = Composer.command('ping', async (ctx, next) => {
  const start = new Date();
  await ctx.reply('Pong!');
  const end = new Date();
  const ms = end - start;
  await ctx.reply(`Response time: ${ms} ms`);
});