/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: Morse code encoder and decoder.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");
const morse = require('./morse.json');

module.exports = Composer.command('morse', (ctx) => {
  const input = ctx.message.text.split(' ');
  const command = input[1];
  const message = input.slice(2).join(' ');

  if (command === 'enc') {
    let encryptedMessage = '';
    for (let i = 0; i < message.length; i++) {
      encryptedMessage += morse[message[i].toUpperCase()] + ' ';
    }
    ctx.reply(encryptedMessage);
  } else if (command === 'dec') {
    let decryptedMessage = '';
    const morseCode = message.split(/ {3,}/); // Any number of spaces more than 2 indicate a new word in Morse code
    for (let i = 0; i < morseCode.length; i++) {
      const word = morseCode[i].split(' '); // One space indicates a new letter in Morse code
      for (let j = 0; j < word.length; j++) {
        decryptedMessage += Object.keys(morse).find(key => morse[key] === word[j]);
      }
      decryptedMessage += ' '; // Add a space after each word
    }
    ctx.reply(decryptedMessage);
  } else {
    ctx.reply('Usage: /morse enc [message] to encrypt, /morse dec [message] to decrypt');
  }
});
