// Author: MKRhere
// License: MIT
// Description:
//   Bans users that forward stories to the group.

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

const story = message("story");

export = Composer.on<TheGuardContext, typeof story>(story, async ctx => {
	await ctx.deleteMessage();
	await ctx.ban({
		admin: ctx.botInfo,
		reason: "Forwarded story",
		userToBan: ctx.from,
	});
});
