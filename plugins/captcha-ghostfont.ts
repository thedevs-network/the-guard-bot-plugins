// Source: https://github.com/thedevs-network/the-guard-bot-plugins
// Author: C0rn3j
// Description:
//   Adds a ghostfont-style captcha to the bot to kick spam bots on join.
//   New members read text revealed by moving dots in an animation.
//   Copy the captcha-ghostfont directory alongside this plugin; see captcha-ghostfont/README.md for configuration.

import { getUser, verifyCaptcha } from '../stores/user';
import { Composer } from 'telegraf';
import type { ExtendedContext } from '../typings/context';
import { logError } from '../utils/log';
import { lrm } from '../utils/html';
import { telegram } from '../bot';
import { config, getNewChatMembers } from '../utils/config';
import { createCaptcha } from './captcha-ghostfont/source';
import type { CaptchaMedia } from './captcha-ghostfont/source';

// Time to read and answer the visual challenge, in seconds
const TIME_TO_ANSWER = 60;

// How long should the user stay banned, in seconds
const BAN_DURATION = 60;

// How long after join the bot is allowed to show captcha, in seconds
// e.g. when set to 30, if bot gets the join message after 1 minute, it would ignore and not show captcha
// useful for when the bot is down and you don't want to take old joins into affect
const AFFECTIVE_JOIN_TIME = Infinity;

const catchError = (err) => logError('[captcha] ' + err.message);

type Challenge = CaptchaMedia & {
	userId: number;
	timeout: number;
	groups: { id?: number; messageId: number }[];
};

const kickOutMember = (
	challenges: Challenge[],
	currentChallenge: Challenge
): number => {
	return (setTimeout(() => {
		// Delete from active challenges
		const foundChallengeIndex = challenges.indexOf(currentChallenge);
		if (foundChallengeIndex >= 0) {
			challenges.splice(foundChallengeIndex, 1);
		}

		// Check if user is banned already
		const user = getUser({ id: currentChallenge.userId });

		// For each group:
		currentChallenge.groups.forEach((group) => {
			// Kick user
			if (group.id && !user.banned) {
				telegram
					.kickChatMember(
						group.id,
						currentChallenge.userId,
						Date.now() / 1000 + BAN_DURATION
					)
					.catch(catchError);
			}

			// Delete message
			if (group.id && group.messageId) {
				telegram.deleteMessage(group.id, group.messageId).catch(catchError);
			}
		});
	}, TIME_TO_ANSWER * 1000) as unknown) as number;
};

const activeChallenges: Challenge[] = [];

export = Composer.mount('message', async (ctx: ExtendedContext, next) => {
	// If chat is private ignore
	if (ctx.chat?.type === 'private') {
		return next();
	}

  const newChatMembers = getNewChatMembers && getNewChatMembers(ctx.message);
	const members = newChatMembers?.filter(
		(user) => user.username !== ctx.me
	);

	// If a text message
	if (!members || members.length === 0) {
		// Check if there's a challenge for this user
		const foundChallenge = activeChallenges.find(
			(activeChallenge) => activeChallenge.userId === ctx.from?.id &&
				activeChallenge.groups.some((group) => group.id === ctx.chat?.id)
		);
		if (!foundChallenge) {
			return next();
		}

		// If answer is right
		const isAnswerRight =
			ctx.message?.text?.trim() === foundChallenge.code.trim();
		if (isAnswerRight) {
			// For each challange
			// 1. Clear timeout
			clearTimeout(foundChallenge.timeout);

			// 2. Delete question
			foundChallenge.groups.forEach((group) => {
				if (group.id && group.messageId) {
					telegram.deleteMessage(group.id, group.messageId).catch(catchError);
				}
			});

			// 3. Remove user and challange from active challenges
			activeChallenges.splice(activeChallenges.indexOf(foundChallenge), 1);

			// 4. Verify user
			await verifyCaptcha({ id: ctx.from?.id }).catch(catchError);
		}

		// Delete answer
		if (ctx.message?.message_id) {
			ctx.deleteMessage(ctx.message?.message_id).catch(catchError);
		}

		return next();
	}

	// If new member
	await Promise.all(
		members.map(async (member) => {
			// If join time is old, ignore
			const shouldIgnoreJoin =
				Math.abs((ctx.message?.date || 0) - Date.now() / 1000) >
				AFFECTIVE_JOIN_TIME;

			if (shouldIgnoreJoin) return;

			// Get user and check if already is verified
			const user = await getUser({ id: member.id });
			if (user.captcha) return;

			// Check if already has shown
			const challenge = activeChallenges.find(
				(activeChallenge) => activeChallenge.userId === member.id
			) as Challenge;

			// Reuse the same code when the member joins multiple groups.
			const media = challenge || await createCaptcha(config.pluginSettings?.captcha);
			const name = member.first_name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
			const message = await ctx.replyWithAnimation(
				{ source: media.animation, filename: media.filename },
				{
					caption: `${lrm}<a href="tg://user?id=${member.id}">${name}</a> [<code>${member.id}</code>] ` +
						'see the animation and type the text revealed by the moving dots ' +
						`within ${TIME_TO_ANSWER} seconds. ` +
						`If you are visually impaired, send /staff to this bot account, and contact a listed admin directly.` +
						'Read our rules(!) right after.',
					parse_mode: 'HTML',
					disable_notification: true,
				}
			);

			const challengeGroup = {
				id: ctx.chat?.id,
				messageId: message.message_id,
			};

			// Create a channel to use when there's none
			const newChallenge: Challenge = {
				groups: [challengeGroup],
				code: media.code,
				animation: media.animation,
				filename: media.filename,
				userId: member.id,
				timeout: 0,
			};

			// Clear previous timeouts
			if (challenge) {
				clearTimeout(challenge.timeout);
			}

			// Create kick out timeout
			const timeout = kickOutMember(
				activeChallenges,
				challenge || newChallenge
			);

			if (challenge) {
				challenge.groups.push(challengeGroup);
				challenge.timeout = timeout;
			} else {
				newChallenge.timeout = timeout;
				activeChallenges.push(newChallenge);
			}
		})
	).catch(catchError);

	return next();
});
