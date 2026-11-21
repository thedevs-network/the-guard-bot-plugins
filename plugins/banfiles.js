/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: This modual warns (but doesnt ban) users who upload forbidden files.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");

const blacklisted_files = ['apk', 'exe', 'scr', 'bat', 'cmd', 'vbs', 'pif'];

module.exports = Composer.mount('document', (ctx, next) =>
        ctx.from.status !== 'admin' &&
                blacklisted_files.includes(
                        ctx.message.document.file_name.split('.').pop())
                ? Promise.all([
                        ctx.warn({
                                admin: ctx.botInfo,
                                reason: 'Blacklisted file.',
                                userToWarn: ctx.from
                        }),
                        ctx.deleteMessage()])
                : next());
