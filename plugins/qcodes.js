/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: Look up a Q-Code for HAM radio. Dictionary compiled by Mrs Feathers.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");
const qcodes = require('./qcodes.json');

module.exports = Composer.command('qcode', (ctx) => {
  const input = ctx.message.text.split(' ');
  const command = input[1];

  if (command && qcodes[command.toUpperCase()]) {
    ctx.reply(`Meaning of ${command.toUpperCase()}: ${qcodes[command.toUpperCase()]}`);
  } else {
    ctx.reply('Usage: /qcode [QCODE] to look up a qcode');
  }
});


