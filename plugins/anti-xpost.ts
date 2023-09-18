// Source: https://gist.github.com/poeti8/c3057f973466676ca8dbbb1183cd0624
// Author: poeti8
// Description:
//   Removes same messages sent by user across one or multiple groups.

import ms = require("millisecond");
import R = require("ramda");
import type { ExtendedContext } from "../typings/context";

const messages = new Set<string>();
const strip = R.omit([
	"message_id",
	"date",
	"chat",
	"reply_to_message",
	"media_group_id",
]);

setInterval(() => messages.clear(), ms("1h"));

export = (ctx: ExtendedContext, next: () => Promise<void>) => {
	if (
		ctx.from?.status === "admin" ||
		ctx.updateType !== "message" ||
		!ctx.chat?.type.endsWith("group") ||
		(ctx.updateSubTypes[0]?.includes("_") &&
			ctx.updateSubTypes[0] !== "video_note") ||
		ctx.message?.text?.length < 20
	) {
		return next();
	}

	const cooked = JSON.stringify(strip(ctx.message));

	if (messages.has(cooked)) {
		return ctx.deleteMessage();
	}
	messages.add(cooked);
	return next();
};
