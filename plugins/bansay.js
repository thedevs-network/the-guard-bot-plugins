/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: Shows a reason why a user was banned if they try to message the bot.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { getUser, verifyCaptcha } = require('../stores/user');
const { Composer } = require('telegraf');
const { logError } = require('../utils/log');
const { lrm } = require('../utils/html');
const { telegram } = require('../bot');
const { config } = require("../utils/config");

module.exports = Composer.on('message', async (ctx, next) => {
  const user = await getUser(ctx.from.id);
  if (user && user.status === 'banned') {
    return ctx.reply(`You were banned for the following reason: ${user.banReason}`);
  }
  return next();
});
