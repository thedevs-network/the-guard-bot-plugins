// Source: https://gist.github.com/poeti8/d84dfc4538510366a2d89294ff52b4ae
// Author: poeti8
// Description:
//   Adds a simple captcha to the bot to kick spam bots on join.

import { getUser, verifyCaptcha } from '../stores/user';
import { Composer } from 'telegraf';
import type { ExtendedContext } from '../typings/context';
import { logError } from '../utils/log';
import { lrm } from '../utils/html';
import { telegram } from '../bot';
import { config } from "../utils/config"

// Time to answer the math question, in seconds
const TIME_TO_ANSWER = 60;

// How long should the user stay banned, in seconds
const BAN_DURATION = 60;

// How long after join the bot is allowed to show captcha, in seconds
// e.g. when set to 30, if bot gets the join message after 1 minute, it would ignore and not show captcha
// useful for when the bot is down and you don't want to take old joins into affect
const AFFECTIVE_JOIN_TIME = Infinity;

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
const calc = {
	'+': (a: number, b: number) => a + b,
	'-': (a: number, b: number) => a - b,
	'*': (a: number, b: number) => a * b,
};

const pick = <T>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const catchError = (err) => logError('[captcha] ' + err.message);

type Challenge = {
	userId: number;
	mathQuestion: string;
	mathAnswer: number;
	timeout: number;
	groups: { id?: number; messageId: number }[];
};

const kickOutMember = (
	challenges: Challenge[],
	currrentChallenge: Challenge
): number => {
	return (setTimeout(() => {
		// Delete from active challenges
		const foundChallengeIndex = challenges.indexOf(currrentChallenge);
		if (foundChallengeIndex >= 0) {
			challenges.splice(foundChallengeIndex, 1);
		}

		// Check if user is banned already
		const user = getUser({ id: currrentChallenge.userId });

		// For each group:
		currrentChallenge.groups.forEach((group) => {
			// Kick user
			if (group.id && !user.banned) {
				telegram
					.kickChatMember(
						group.id,
						currrentChallenge.userId,
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

const createMath = (): { answer: number; question: string } => {
	let a: number;
	let b: number;
	let op: keyof typeof calc;
	let result: number;

	do {
		a = pick(numbers);
		b = pick(numbers);

		if (config.plugins?.captcha?.negativeSubstractionCase) {
			// To avoid negative substraction case
			if (b > a) {
				const c = a
				a = b
				b = c
			}
		}
		op = pick(Object.keys(calc)) as keyof typeof calc;
		result = calc[op](a, b);
	} while (result === 0);

	return {
		answer: result,
		question: `${a} ${op} ${b}`,
	};
};

const activeChallenges: Challenge[] = [];

export = Composer.mount('message', async (ctx: ExtendedContext, next) => {
	// If chat is private ignore
	if (ctx.chat?.type === 'private') {
		return next();
	}

	const members = ctx.message?.new_chat_members?.filter(
		(user) => user.username !== ctx.me
	);

	// If a text message
	if (!members || members.length === 0) {
		// Check if there's a challenge for this user
		const foundChallenge = activeChallenges.find(
			(activeChallenge) => activeChallenge.userId === ctx.from?.id
		);
		if (!foundChallenge) {
			return next();
		}

		// If answer is right
		const isAnswerRight =
			Number(ctx.message?.text) === foundChallenge.mathAnswer;
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

			// Create or use already created math
			const math = createMath();
			const mathAnswer = challenge ? challenge.mathAnswer : math.answer;
			const mathQuestion = challenge ? challenge.mathQuestion : math.question;

			// Send message
			const message = await ctx.replyWithHTML(
				`${lrm}<a href="tg://user?id=${member.id}">${member.first_name}</a> [<code>${member.id}</code>] ` +
					'please solve the following arithmetic operation in ' +
					`${TIME_TO_ANSWER} seconds and read our rules(!) right after:\n` +
					`<b>${mathQuestion} = ?</b>`,
				{ disable_notification: true }
			);

			const challengeGroup = {
				id: ctx.chat?.id,
				messageId: message.message_id,
			};

			// Create a channel to use when there's none
			const newChallenge: Challenge = {
				groups: [challengeGroup],
				mathAnswer,
				mathQuestion,
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
