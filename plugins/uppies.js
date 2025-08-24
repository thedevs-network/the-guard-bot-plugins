/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: An admin can request adminship in the chat if they are admined by the bot and not admined in the chat.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");

module.exports = Composer.command('uppies', async (ctx) => {
	try {
		if (ctx.from.status !== 'admin') return;
		await ctx.telegram.promoteChatMember(ctx.chat.id, ctx.from.id, {
			can_change_info: false,
			can_delete_messages: true,
			can_invite_users: true,
			can_restrict_members: true,
			can_pin_messages: true,
			can_promote_members: false
		});
	} catch (error) {
		console.error(`Error promoting chat member: ${error}`);
	}
});
