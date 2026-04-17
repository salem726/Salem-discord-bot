const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [3276799] }); // All intents for maximum bugging power

client.once('ready', () => {
    console.log(`Simon Salem's Bot is LIVE!`);
});

client.on('messageCreate', async (message) => {
    if (message.content.startsWith('!bug')) {
        const target = message.mentions.users.first();
        if (!target) return;
        for (let i = 0; i < 10; i++) {
            await message.channel.send(`🪲 BUGGED BY SIMON SALEM: ${target}`);
            await new Promise(r => setTimeout(r, 1200));
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
