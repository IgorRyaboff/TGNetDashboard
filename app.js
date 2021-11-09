const { Telegraf } = require('telegraf')
const fs = require('fs');
const ping = require('ping');

let config = {
    timeout: 1,
    hosts: {
        'Localhost': '127.0.0.1',
        'Localhost IPv6': '::1'
    }
};
if (fs.existsSync('./config.js')) config = require('./config.js');

const bot = new Telegraf('2088665525:AAEhI1bRWmIe2XBhtG86zBZv2m70UpTAEb8');
bot.command('start', async ctx => {
    if (!Object.keys(config.hosts).length) return ctx.reply('No hosts for scanning :(');
    ctx.reply('Scanning, please wait...');
    let result = {};
    let promises = [];
    for (let i in config.hosts) {
        promises.push(new Promise(res => {
            ping.promise.probe(config.hosts[i], {
                timeout: config.timeout
            }).then(rp => {
                result[i] = rp.alive;
                res();
            });
        }));
    }
    await Promise.all(promises);
    ctx.reply(Object.keys(config.hosts).map(i => `${result[i] ? '🟢' : '🔴'} ${i}`).join('\n'));
});
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));