// Source: https://gist.github.com/poeti8/133796200d66049c9bd58e6265a52f68
// Author: poeti8
// Description:
//   Removes same messages sent by user across one or multiple groups.

'use strict';
const Composer = require('telegraf/composer');

const blacklisted_files = [ 'apk', 'exe', 'scr', 'bat', 'cmd', 'vbs', 'pif' ];

module.exports = Composer.mount('document', (ctx, next) =>
	ctx.from.status !== 'admin' &&
		blacklisted_files.includes(
			ctx.message.document.file_name.split('.').pop())
		? Promise.all([
			ctx.ban({
				admin: ctx.botInfo,
				reason: 'Blacklisted file.',
				userToBan: ctx.from }),
			ctx.deleteMessage() ])
		: next());
