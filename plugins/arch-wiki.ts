// Author: C0rn3j
// Description:
//   Searches for an article on the Arch Wiki and links it
//   Example: /wiki installation guide
//   Result: Arch Wiki: Installation guide (https://wiki.archlinux.org/index.php?title=Installation%20guide)

'use strict'
const { Composer } = require('telegraf')
const axios = require('axios')

const BASE_URL = 'https://wiki.archlinux.org/'
const API_URL = BASE_URL + 'api.php'

module.exports = Composer.command('wiki', async (ctx) => {
	const query = ctx.message.text.split('/wiki ')[1]
	if (!query) {
		const username = ctx.message.from.username || "Unknown user"
		const userId = ctx.message.from.id
		const sentMessage = await ctx.reply(`${username}[${userId}]: Please provide a keyword to search on Arch Wiki.`)
		setTimeout(() => ctx.deleteMessage(sentMessage.message_id), 30000)
		return
	}

	try {
		const { data } = await axios.get(API_URL, {
			params: {
				action: 'query',
				list: 'search',
				srsearch: query,
				format: 'json'
			}
		})

		const searchResults = data.query.search

		if (!searchResults.length) {
			const sentMessage = await ctx.reply('No relevant articles found on Arch Wiki.')
			setTimeout(() => ctx.deleteMessage(sentMessage.message_id), 30000)
			return
		}

		// Construct a URL for the first search result
		const pageTitle = searchResults[0].title
		const pageURL = `${BASE_URL}index.php?title=${encodeURIComponent(pageTitle)}`
		const hyperlinkMessage = `<a href="${pageURL}">Arch Wiki: ${pageTitle}</a>`

		// Check if it was a reply to someone else and act accordingly
		if (ctx.message.reply_to_message) {
			ctx.reply(hyperlinkMessage, {
				reply_to_message_id: ctx.message.reply_to_message.message_id,
				parse_mode: 'HTML'
			})
		} else {
			ctx.reply(hyperlinkMessage, {
				parse_mode: 'HTML'
			})
		}

	} catch (error) {
		console.error(error)
		const sentMessage = await ctx.reply('Error fetching data from Arch Wiki.')
		setTimeout(() => ctx.deleteMessage(sentMessage.message_id), 30000)
	}
})
