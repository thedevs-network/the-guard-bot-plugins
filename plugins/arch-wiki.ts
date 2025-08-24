// Author: C0rn3j
// Description:
//   Searches for an article on the Arch Wiki and links it by clicking the desired inline result
//   Example: @botname installation guide
//   Result: Arch Wiki: Installation guide (https://wiki.archlinux.org/index.php?title=Installation%20guide)
//
//   https://core.telegram.org/bots/api#inline-mode
//   Make sure that /setinline is enabled in @BotFather for this plugin to

"use strict";

import { Composer } from "telegraf";
const axios = require("axios");

const BASE_URL = "https://wiki.archlinux.org/";
const API_URL = BASE_URL + "api.php";

const composer = new Composer();

composer.on("inline_query", async ctx => {
	const query = ctx.inlineQuery.query;
	if (query == "") return;

	//console.log(`${username}[${userId}]: Wiki query: ${query}`)

	try {
		const { data } = await axios.get(API_URL, {
			params: {
				action: "query",
				list: "search",
				srsearch: query,
				srenablerewrites: true,
				format: "json",
			},
		});

		const searchResults = data.query.search;

		if (!searchResults.length) {
			//			console.log("No relevant articles found on Arch Wiki.")
			return await ctx.answerInlineQuery([
				{
					type: "article",
					id: "1",
					title: "ERROR",
					description: `No relevant articles found on Arch Wiki for "${query}".`,
					input_message_content: {
						message_text: `<No results>`,
					},
				},
			]);
		}

		//		console.log(searchResults)

		const searchResults2 = searchResults.map(({ title, pageid }) => ({
			type: "article",
			id: pageid,
			title: title,
			description: "",
			input_message_content: {
				message_text: `<a href="${BASE_URL}index.php?title=${encodeURIComponent(
					title,
				)}">Arch Wiki: ${title}</a>`,
				parse_mode: "HTML",
			},
		}));
		return await ctx.answerInlineQuery(searchResults2);
	} catch (error) {
		console.error(error);
		return await ctx.answerInlineQuery([
			{
				type: "article",
				id: "1",
				title: "ERROR",
				description: `Error fetching data from Arch Wiki for "${query}".`,
				input_message_content: {
					message_text: `<No results>`,
				},
			},
		]);
	}
});

// Remember to /setinlinefeedback with @BotFather
//composer.on('chosen_inline_result', ({ chosenInlineResult }) => {
//	console.log("chosen inline result", chosenInlineResult);
//});

module.exports = composer;
