/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: restrict a specific word to a specific person. because inside jokes are fun.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");

const replies = [
  'Yauw echoes through the digital kingdom as the fox queen of IT graces us with her wisdom.',
  'The fox queen of IT has spoken. Yauw!',
  'Yauw! The digital kingdom is graced by the fox queen of IT.',
  'The fox queen of IT has made her presence known. Yauw!',
  'Yauw! The fox queen of IT has arrived.',
  'The digital kingdom is enlightened by the fox queen of IT. Yauw!',
  'Yauw! The fox queen of IT shares her wisdom.',
  'The fox queen of IT graces us with her presence. Yauw!',
  'Yauw! The fox queen of IT enlightens the digital kingdom.',
  'The fox queen of IT has spoken. Her words echo through the digital kingdom. Yauw!',
  'Yauw! The wisdom of the fox queen of IT graces us.'
];

module.exports = Composer.mount(['text', 'edited_message'], (ctx, next) => {
  const text = ctx.updateType === 'edited_message' ? ctx.editedMessage.text.toLowerCase() : ctx.message.text.toLowerCase();
  const isYauw = /^((.)* )?y.?a.?u.?w.?( (.)*)?$/i.test(text);

  if (isYauw) {
    if (ctx.from.id !== 25737932) {
      ctx.deleteMessage();
    } else {
      const replyId = ctx.updateType === 'edited_message' ? ctx.editedMessage.message_id : ctx.message.message_id;
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      ctx.reply(randomReply, { reply_to_message_id: replyId });
    }
  } else {
    next();
  }
});
