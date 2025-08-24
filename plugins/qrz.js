/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: look up someone's HAM Radio callsign.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");

module.exports = Composer.command('callsign', (ctx) => {
  const input = ctx.message.text.split(' ');
  const call = input[1];

  if (call) {
    ctx.reply(`http://qrz.com/db/${call}`);
  } else {
    ctx.reply('Usage: /callsign [CALL] to look up a callsign');
  }
});
