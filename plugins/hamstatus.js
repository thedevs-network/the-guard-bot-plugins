/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: Show HAM radio status
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");

const axios = require('axios');
const { Readable } = require('stream');

module.exports = Composer.command('ham', async (ctx, next) => {
  const response = await axios.get('https://www.hamqsl.com/solar101vhf.php', { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  await ctx.replyWithPhoto({ source: stream });
});
