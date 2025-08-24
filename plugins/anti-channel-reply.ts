// Author: MKRhere
// License: MIT
// Description:
//   Bans users that reply to channels in the group.

import { Composer, Context } from "telegraf";
import { message } from "telegraf/filters";
import type { Message, User } from "telegraf/types";

interface From extends User {
	status: "member" | "admin" | "banned";
}

interface TheGuardContext extends Context {
	ban(options: { admin: User; reason: string; userToBan: User }): Promise<Message>;
	from: From;
}

const reply = message("external_reply");

const WHITELISTED = process.env.WHITELISTED_CHANNELS?.split(",") ?? [];

export = Composer.on<TheGuardContext, typeof reply>(reply, async (ctx, next) => {
	const chat = ctx.message.external_reply.chat;
	if (chat?.type !== "channel") return next();

	if (chat.username) if (WHITELISTED.includes(chat.username ?? "")) return next();

	await ctx.deleteMessage();
	await ctx.ban({
		admin: ctx.botInfo,
		reason: "Reply to channel",
		userToBan: ctx.from,
	});
});
