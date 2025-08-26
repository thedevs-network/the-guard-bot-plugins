// Source: https://gist.github.com/MKRhere/b6403db5ca37b9c23b2f703877954751
// Author: MKRhere
// License: MIT
// Description:
//   Bans users that send many Arabic/Persian/Chinese characters in a message.
//   Requires Telegraf 4.11+ filters
//   Based on https://gist.github.com/poeti8/966ccef35d61ad2735dc0120ce3e8760

import { Composer, type Context } from "telegraf";
import { message } from "telegraf/filters";
import type { Message, MessageEntity, User } from "telegraf/types";

interface From extends User {
	status: "member" | "admin" | "banned";
}

interface TheGuardContext extends Context {
	ban(this: TheGuardContext, options: { admin: User; reason: string; userToBan: User }): Promise<Message>;
	from: From;
}

const shouldStripEntity = (entity: MessageEntity) =>
	entity.type === "url" || entity.type === "text_link" || entity.type === "mention" || entity.type === "text_mention";

const getText = (ctx: Context) => {
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

	const links = entities.filter(shouldStripEntity);

	for (let i = 0; i < links.length; i++) {
		const link = links[i];
		if (!link) continue;
		// remove URLs since they can count up character count
		ret += text.slice(next, link.offset);
		next = link.offset + link.length;
	}

	ret += text.slice(next);

	// ignore whitespace and numbers
	return ret.replace(/\s/g, "").replace(/\d/g, "");
};

const isNonAdmin = (ctx: TheGuardContext) => !ctx.state.isMaster && ctx.from?.status !== "admin";

const EMOJI_TEST = /[\p{Emoji}\p{Extended_Pictographic}\p{Emoji_Component}]/gu;

const countEmojiCodepoints = (s: string): number => s.match(EMOJI_TEST)?.join("").length ?? 0;

type Range = [low: string, high: string];

// source: https://stackoverflow.com/a/1366113/6536268
const CJK_RANGES: Range[] = [
	["\u4E00", "\u9FFF"], //   CJK Unified Ideographs
	["\u3400", "\u4DBF"], //   CJK Unified Ideographs Extension A
	["\u{20000}", "\u{2A6DF}"], // CJK Unified Ideographs Extension B
	["\u{2A700}", "\u{2B73F}"], // CJK Unified Ideographs Extension C
	["\u{2B740}", "\u{2B81F}"], // CJK Unified Ideographs Extension D
	["\u{2B820}", "\u{2CEAF}"], // CJK Unified Ideographs Extension E
	["\u{2CEB0}", "\u{2EBEF}"], // CJK Unified Ideographs Extension F
	["\u{30000}", "\u{3134F}"], // CJK Unified Ideographs Extension G
	["\u{31350}", "\u{323AF}"], // CJK Unified Ideographs Extension H
	["\uF900", "\uFAFF"], //   CJK Compatibility Ideographs
	["\u{2F800}", "\u{2FA1F}"], // CJK Compatibility Ideographs Supplement
	["\uFF00", "\uFFEF"], // Halfwidth and Fullwidth Forms (source: https://en.wikipedia.org/wiki/Halfwidth_and_Fullwidth_Forms_(Unicode_block))
];

const ARABIC_RANGES: Range[] = [
	["\u0600", "\u06FF"], // Arabic
	["\uFB50", "\uFDFD"], // Arabic Presentation Forms-A
	["\uFE70", "\uFEFF"], // Arabic Presentation Forms-B
];

const inRange = (c: string, range: Range) => c >= range[0] && c <= range[1];

// Text utils
const isOriental = (c: string) =>
	CJK_RANGES.some(range => inRange(c, range)) || ARABIC_RANGES.some(range => inRange(c, range));

const countOffendingCodepoints = (s: string) => {
	const emoji = countEmojiCodepoints(s);
	const oriental = s.split("").filter(isOriental).length;
	if (oriental > 0) return emoji + oriental;
	else return 0;
};

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
	len < 3 ? Infinity // don't ban for 1-2 Oriental characters
	: len <= ALWAYS_BAN_BELOW ? len // only ban if all characters are Oriental
	: Math.floor(
		(len <= SMOOTH_DECAY_FROM ? l(len) // interpolate from 100% to 50% based on length
			// smoothly decay to target% until max length
			: decay(len)) * len
	);

const shouldBan = (text: string) => countOffendingCodepoints(text) >= isBannable(text.length);

export = Composer.optional<TheGuardContext>(
	ctx => ctx.has("message") && isNonAdmin(ctx) && shouldBan(getText(ctx)),
	async ctx => {
		await ctx.deleteMessage();
		await ctx.ban({
			admin: ctx.botInfo,
			reason: "Persian/Arabic/Chinese text",
			userToBan: ctx.from,
		});
	},
);
