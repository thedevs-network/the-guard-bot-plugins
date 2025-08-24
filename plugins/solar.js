/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: Post telemetry data for our solar system and planet for the Space Furs Chat
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

module.exports = Composer.command('solar', async (ctx, next) => {
  const urls = ['https://www.hamqsl.com/solarsun.php', 'https://www.hamqsl.com/solarmuf.php', 'https://www.hamqsl.com/solarsystem.php'];
  for (const url of urls) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    await ctx.replyWithPhoto({ source: stream });
  }
});
