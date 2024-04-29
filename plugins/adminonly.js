/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: This example modual defines a command that is restricted to the staff.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");

const adminCommand = (...args) =>
  C.optional(
    ctx => ctx.state.isMaster || ctx.state.isAdmin,
    C.command(...args))

module.exports = adminCommand('adminonly', C.reply('Hello, This command only works for Furry Refuge staff.'));