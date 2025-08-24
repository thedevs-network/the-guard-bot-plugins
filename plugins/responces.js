/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: respond to things with cute emoji!
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");

const triggers = {
  '\\brip\\b': '❀◟(ó ̯ ò, )',
  '\\bono\\b': '❀◟(ó ̯ ò, )',
  '\\buvu\\b': '❀◟(ó ̯ ò, )',
  '\\buwu\\b': '❀◟(ó ̯ ò, )',
  '\\boh no\\b': '❀◟(ó ̯ ò, )',
  '\\boh no.\\b': '❀◟(ó ̯ ò, )',
  '\\bo no\\b': '❀◟(ó ̯ ò, )',
  '\\bowo\\b': 'OwO',
  '\\bovo\\b': 'OwO',
  '\\bo\\b': 'OwO!',
  '\\boh shit\\b': '(╯°□°）╯︵ ┻━┻',
  '\\bfuck\\b': '(╯°□°）╯︵ ┻━┻',
  '\\bshit\\b': '(╯°□°）╯︵ ┻━┻',
  '\\bdamn\\b': '(╯°□°）╯︵ ┻━┻',
  '\\bcunt\\b': '(╯°□°）╯︵ ┻━┻',
  '\\bmotherfucker\\b': '(╯°□°）╯︵ ┻━┻',
  '\\bmuthafucka\\b': '(╯°□°）╯︵ ┻━┻',
  '\\bmuthafuck\\b': '(╯°□°）╯︵ ┻━┻',
  '\\bmuthafucker\\b': '(╯°□°）╯︵ ┻━┻'
}; // Add more triggers and responses as needed

module.exports = Composer.mount('text', (ctx, next) => {
  const disabledChats = [-1001058608471];

  if (disabledChats.includes(ctx.chat.id)) {
    return next();
  }

  for (let trigger in triggers) {
    if (new RegExp(trigger, 'i').test(ctx.message.text)) {
      ctx.reply(triggers[trigger]);
      return;
    }
  }
  next();
});
