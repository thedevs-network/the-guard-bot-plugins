'use strict';
const { Composer } = require('telegraf');

module.exports = Composer.mount('contact', (ctx, next) => {
	if (ctx.from.status !== 'admin' && ctx.message.contact) {
		return Promise.all([
			ctx.ban({
				admin: ctx.botInfo,
				reason: 'Sharing contact.',
				userToBan: ctx.from,
			}),
			ctx.deleteMessage(),
		]);
	}
	return next();
});