// Author: MKRhere
// License: MIT
// Description:
//   Bans users that reply to channels in the group.

import { Composer, Context } from "telegraf";
import { message } from "telegraf/filters";
import type { Message, User } from "telegraf/types";
import { config } from "../utils/config";

const excludeLinks = config.excludeLinks
	? Array.isArray(config.excludeLinks)
		? config.excludeLinks
		: [config.excludeLinks]
	: [];

interface From extends User {
	status: "member" | "admin" | "banned";
}

interface TheGuardContext extends Context {
	ban(options: { admin: User; reason: string; userToBan: User }): Promise<Message>;
	from: From;
}

const reply = message("external_reply");

export = Composer.on<TheGuardContext, typeof reply>(reply, async (ctx, next) => {
	if (config.excludeLinks === false || excludeLinks.includes("*")) return next();

	const chat = ctx.message.external_reply.chat;
	if (chat?.type !== "channel") return next();

	if (chat.username) if (excludeLinks.includes(chat.username)) return next();
	if (excludeLinks.includes(chat.id.toString())) return next();

	await ctx.deleteMessage();
	await ctx.ban({
		admin: ctx.botInfo,
		reason: "Reply to channel",
		userToBan: ctx.from,
	});
});
