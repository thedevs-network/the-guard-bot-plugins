/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: posts a cute message and gif when you "scritch" someone. mp4 files to be used as gifs need to be put in the file ./scritches in the plugin directory.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
import { Composer } from 'telegraf';

module.exports = Composer.command('scritch', async (ctx, next) => {
  if (!ctx.message.reply_to_message) {
    await ctx.reply('Please reply to a message to use this command.');
    return;
  }
  const fs = require('fs');
  const path = require('path');
  const targetUser = ctx.message.reply_to_message.from.first_name;
  const issuingUser = ctx.from.first_name;
  const directoryPath = path.join(__dirname, './scritches');
  const files = fs.readdirSync(directoryPath);
  const randomFile = files[Math.floor(Math.random() * files.length)];
  const captions = [`\\*${issuingUser} scritches ${targetUser}\\*`, `\\*${issuingUser} gives ${targetUser} a scritch\\*`, `\\*${issuingUser} scritches softly on ${targetUser}\\*`, `\\*${issuingUser} scritches ${targetUser} cutely\\*`, `\\*${issuingUser} scritches ${targetUser} softly\\*`, `\\*${issuingUser} pets ${targetUser} soft\\*`, `\\*${issuingUser} pets ${targetUser} with gusto\\*`, `\\*${issuingUser} petpats ${targetUser}\\*`, `\\*${issuingUser} pets on a ${targetUser}\\*`];
  const randomCaption = captions[Math.floor(Math.random() * captions.length)];
  await ctx.replyWithAnimation({ source: path.join(directoryPath, randomFile) }, { caption: randomCaption, parse_mode: 'Markdown', reply_to_message_id: ctx.message.reply_to_message.message_id });
});