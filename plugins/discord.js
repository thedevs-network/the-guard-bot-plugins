/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: Let people know you have a discord. could also be used for other informations.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");

module.exports = Composer.command('discord', (ctx, next) =>
  ctx.reply('Our Discord voice chat is located at http://discord.furryrefuge.com'));