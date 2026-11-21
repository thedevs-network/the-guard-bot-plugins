/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: Super quick dice roller.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");

module.exports = Composer.command('roll', (ctx, next) => {
  const command = ctx.message.text.trim().split(' ');
  if (command.length !== 2 || !/^(\d+)d(\d+)$/.test(command[1])) {
    return ctx.reply('Invalid command. Use /roll NdM, where N is the number of dice and M is the number of sides.');
  }
  const [dice, sides] = command[1].split('d').map(Number);
  if (dice > 10) {
    return ctx.reply('Cannot roll more than 10 dice at once.');
  }
  let result = 0;
  let rolls = [];
  for (let i = 0; i < dice; i++) {
    let roll = Math.floor(Math.random() * sides) + 1;
    rolls.push(roll);
    result += roll;
  }
  return ctx.reply(`You rolled ${rolls.join(' + ')} for a total of ${result}`);
});



