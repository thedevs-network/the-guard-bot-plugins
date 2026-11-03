/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: Classic XKCD plugin
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

module.exports = Composer.command('xkcd', async (ctx, next) => {
  try {
    let comicRes;
    if (ctx.message.text.trim().toLowerCase() === '/xkcd newest') {
      comicRes = await axios.get('https://xkcd.com/info.0.json');
    } else {
      const res = await axios.get('https://xkcd.com/info.0.json');
      const maxNum = res.data.num;
      const randomNum = Math.floor(Math.random() * maxNum) + 1;
      comicRes = await axios.get(`https://xkcd.com/${randomNum}/info.0.json`);
    }
    return ctx.replyWithPhoto(comicRes.data.img, { caption: comicRes.data.title });
  } catch (err) {
    return ctx.reply(`Failed to get comic: ${err.message}`);
  }
});

