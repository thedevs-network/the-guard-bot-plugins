/**
 * Author: Mrs Feathers (echo@furryrefuge.com)
 * Description: Example of inline keyboard use.
 * Originally created for Furry Refuge (https://furryrefuge.com).
 * 
 * License: This work is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License.
 * To view a copy of this license, visit http://creativecommons.org/licenses/by-nc/4.0/.
 * Under this license, you are free to share and adapt this work for any non-commercial purpose,
 * provided you give appropriate credit to the original author.
 */

'use strict';
const { Composer } = require("telegraf");

module.exports = Composer.command('play', async (ctx, next) => {
  const options = [
    { title: 'Hextris', description: 'Description 1', url: 'https://arcade.furryrefuge.com/hextris-lite/' },
    { title: '2048', description: 'Description 2', url: 'https://arcade.furryrefuge.com/2048-lite/' },
    { title: 'HexGL Racing', description: 'Description 3', url: 'https://arcade.furryrefuge.com/hexgl-lite/' },
    { title: 'Asteroids', description: 'Description 3', url: 'https://arcade.furryrefuge.com/html5-asteroids/' },
    { title: 'A Dark Room', description: 'Description 3', url: 'https://arcade.furryrefuge.com/adarkroom' },
    { title: 'ROMs Emulator', description: 'Description 3', url: 'https://arcade.furryrefuge.com/roms/' },
    { title: 'Wordle', description: 'Description 3', url: 'https://arcade.furryrefuge.com/wordle/' },
    { title: 'Missle Game', description: 'Description 3', url: 'https://arcade.furryrefuge.com/missile-game/' },
    { title: 'Chess', description: 'Description 3', url: 'https://arcade.furryrefuge.com/chess/' },
    { title: 'Pool', description: 'Description 3', url: 'https://arcade.furryrefuge.com/classic-pool/' },
    { title: 'Dead Valley', description: 'Description 3', url: 'https://arcade.furryrefuge.com/dead-valley/' },
    { title: 'PacMan', description: 'Description 3', url: 'https://arcade.furryrefuge.com/pacman-lite/' },
    { title: '3D City', description: 'Description 3', url: 'https://arcade.furryrefuge.com/3d.city/' },
    { title: 'Particle Clicker', description: 'Description 3', url: 'https://arcade.furryrefuge.com/particle-clicker/' },
    { title: 'Tap Tap Tap', description: 'Description 3', url: 'https://arcade.furryrefuge.com/taptaptap/play/' },
    { title: 'Quake JS', description: 'Description 1', url: 'https://arcade.furryrefuge.com/quakejs/' },
    { title: 'IO Party Games', description: 'Description 2', url: 'https://arcade.furryrefuge.com/iogames/' },
    { title: 'Cards Against Humanity', description: 'Description 3', url: 'https://arcade.furryrefuge.com/cah/' },
    { title: 'TransCube', description: 'Description 3', url: 'https://arcade.furryrefuge.com/transcube/' },
    { title: 'Scribble.rs', description: 'Description 3', url: 'https://arcade.furryrefuge.com/scribblers/' },
    { title: 'Board Game Online', description: 'Description 3', url: 'https://arcade.furryrefuge.com/boardgame-online/' },
    { title: 'Swap', description: 'Description 3', url: 'https://arcade.furryrefuge.com/swap/' },
    { title: 'Sudoku', description: 'Description 3', url: 'https://arcade.furryrefuge.com/sudoku/' },
    { title: 'cyberpong', description: 'Description 3', url: 'https://arcade.furryrefuge.com/cyberpong/' },
    { title: 'Executive Man', description: 'Description 3', url: 'https://arcade.furryrefuge.com/executiveman/' },
    { title: 'Shape Experiment', description: 'Description 3', url: 'https://arcade.furryrefuge.com/shape-experiment/' },
    { title: 'Virtual Tabletop', description: 'Description 3', url: 'https://arcade.furryrefuge.com/virual-tabletop/' },
  ];

  const inlineKeyboard = options.map(option => {
    return [
      { text: option.title, url: option.url },
    ];
  });

  await ctx.reply('What would you like to play?:', {
    reply_markup: {
      inline_keyboard: inlineKeyboard,
    },
  });
});
