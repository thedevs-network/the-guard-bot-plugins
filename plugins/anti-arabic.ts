// Source: https://gist.github.com/MKRhere/b6403db5ca37b9c23b2f703877954751
// Author: MKRhere
// Description:
//   Bans users that send many Arabic/Persian characters in a message.
//   Requires Telegraf 4.11+ filters
//   Based on https://gist.github.com/poeti8/966ccef35d61ad2735dc0120ce3e8760

import { Composer, Context } from "telegraf";
import { message } from "telegraf/filters";
import type { Message, MessageEntity, User } from "telegraf/types";

interface From extends User {
	status: "member" | "admin" | "banned";
}

interface TheGuardContext extends Context {
	ban(this: TheGuardContext, options: { admin: User; reason: string; userToBan: User }): Promise<Message>;
	from: From;
}

type LinkEntity = MessageEntity.TextLinkMessageEntity;
const isLink = (entity: MessageEntity): entity is LinkEntity => entity.type === "url";

const getText = (ctx: TheGuardContext) => {
	// prettier-ignore
	const entities =
		ctx.has(message("entities")) ? ctx.message.entities :
		ctx.has(message("caption_entities")) ? ctx.message.caption_entities : [];

	// prettier-ignore
	const text =
		ctx.has(message("text")) ? ctx.message.text :
		ctx.has(message("caption")) ? ctx.message.caption : "";

	let ret = "";
	let next = 0;

	for (const url of entities.filter(isLink)) {
		// remove URLs since they can count up character count without being sandland characters
		ret += text.slice(next, url.offset);
		next = url.offset + url.length;
	}

	ret += text.slice(next);

	return ret.replace(/\s/g, "");
};

const isNonAdmin = (ctx: TheGuardContext) => !ctx.state.isMaster && ctx.from?.status !== "admin";

// Text utils
const isSandland = (c: string) =>
	(c >= "\u0600" && c <= "\u06FF") || // Arabic
	(c >= "\uFB50" && c <= "\uFDFD") || // Arabic Presentation Forms-A
	(c >= "\uFE70" && c <= "\uFEFF"); // Arabic Presentation Forms-B

const sandlandAmount = (s: string) => s.split("").filter(isSandland).length;

const ALWAYS_BAN_BELOW = 6;
const SMOOTH_DECAY_FROM = 50;
const MAX_CHARS = 4096;
const FIVE_PERCENT = 0.05;
const FIFTY_PERCENT = 0.5;

// interpolate a number x from interval [a, b] to [p, q]
const lerp = (a: number, b: number, p: number, q: number) => (x: number) => ((b - x) / (b - a)) * (q - p) + p;

// Decay constant, adjusted to aim for 5% at 4096 chars
const k = -Math.log(FIVE_PERCENT * 2) / MAX_CHARS;
// Initial percentage adjusted to be 50% at n = 50
const A = FIFTY_PERCENT / Math.exp(-k * SMOOTH_DECAY_FROM);
// Exponential decay
const decay = (n: number) => A * Math.exp(-k * n);

const l = lerp(ALWAYS_BAN_BELOW, SMOOTH_DECAY_FROM, 0.5, 1);

// prettier-ignore
const isBannable = (len: number) =>
	len < 3 ? Infinity // don't ban for 1-2 Persian characters
	: len <= ALWAYS_BAN_BELOW ? len // only ban if all characters are Persian
	: Math.floor(
		(len <= SMOOTH_DECAY_FROM ? l(len) // interpolate from 100% to 50% based on length
			// smoothly decay to target% until max length
			: decay(len)) * len
	);

const shouldBan = (text: string) => sandlandAmount(text) >= isBannable(text.length);

export = Composer.optional<TheGuardContext>(
	ctx => ctx.has("message") && isNonAdmin(ctx) && shouldBan(getText(ctx)),
	async ctx => {
		await ctx.deleteMessage();
		await ctx.ban({
			admin: ctx.botInfo,
			reason: "Persian/Arabic text",
			userToBan: ctx.from,
		});
	},
);
