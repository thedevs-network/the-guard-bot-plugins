// Source: https://github.com/thedevs-network/the-guard-bot/issues/83#issuecomment-409486247
// Author: trgwii
// Description:
//   Add a /delete command
//   Note that /del is already a native command

'use strict';
import { Composer } from 'telegraf';

module.exports = Composer.command('delete', (ctx, next) =>
	ctx.from.status === 'admin'
		? ctx.message.reply_to_message
			? ctx.deleteMessage(ctx.message.reply_to_message.message_id)
			: ctx.reply('Reply to a message to delete it')
		: ctx.reply('Admin only'));
