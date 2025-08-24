/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: get user id from a message or reply. use -g switch for group info.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");

module.exports = Composer.command('getid', (ctx, next) => {
  const args = ctx.message.text.split(' ');
  const includeGroupInfo = args.length > 1 && (args[1] === '-g' || args[1] === '-G');

  if (ctx.from.status !== 'admin') {
    return ctx.reply('Admin only');
  }

  let userId, firstName, lastName, userName, isBot, chatId, chatName, forwardDate;

  if (ctx.message.reply_to_message && ctx.message.reply_to_message.forward_from) {
    userId = ctx.message.reply_to_message.forward_from.id;
    firstName = ctx.message.reply_to_message.forward_from.first_name;
    lastName = ctx.message.reply_to_message.forward_from.last_name;
    userName = ctx.message.reply_to_message.forward_from.username || '-No Username-';
    isBot = ctx.message.reply_to_message.forward_from.is_bot;
    if (includeGroupInfo) {
      chatId = ctx.message.reply_to_message.chat.id;
      chatName = ctx.message.reply_to_message.chat.title;
    }
    forwardDate = new Date(ctx.message.reply_to_message.forward_date * 1000).toUTCString();
  } else if (ctx.message.reply_to_message) {
    userId = ctx.message.reply_to_message.from.id;
    firstName = ctx.message.reply_to_message.from.first_name;
    lastName = ctx.message.reply_to_message.from.last_name;
    userName = ctx.message.reply_to_message.from.username || '-No Username-';
    isBot = ctx.message.reply_to_message.from.is_bot;
    if (includeGroupInfo) {
      chatId = ctx.message.reply_to_message.chat.id;
      chatName = ctx.message.reply_to_message.chat.title;
    }
  } else {
    userId = ctx.from.id;
    firstName = ctx.from.first_name;
    lastName = ctx.from.last_name;
    userName = ctx.from.username || '-No Username-';
    isBot = ctx.from.is_bot;
    if (includeGroupInfo) {
      chatId = ctx.chat.id;
      chatName = ctx.chat.title;
    }
  }

  let replyText = `👤 User Info:\n├ id: ${userId}\n├ first_name: ${firstName}\n├ last_name: ${lastName}\n├ username: ${userName}\n└ is_bot: ${isBot}`;
  if (includeGroupInfo) {
    replyText += `\n\n👥 Group Info:\n├ id: ${chatId}\n└ group_name: ${chatName}`;
  }
  if (forwardDate) {
    replyText += `\n\n⏳ Other Info:\n└forward_date: ${forwardDate}`;
  }
  return ctx.reply(replyText);
});


