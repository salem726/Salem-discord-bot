const { Client, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Initialize client with mandatory 2026 Intents
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent // Necessary to read 'hello'
    ] 
});

// Using the modern 'ClientReady' event to fix the warning in your logs
client.once(Events.ClientReady, (c) => {
    console.log(`✅ System Active! Logged in as ${c.user.tag}`);
});

// Command Listener
client.on(Events.MessageCreate, (message) => {
    // 1. Ignore messages from bots
    if (message.author.bot) return;

    // 2. Simple 'hello' response
    if (message.content.toLowerCase() === 'hello') {
        message.reply('Hi there! 👋 Your Discord bot is officially listening.');
    }

    // 3. Simple 'ping' response
    if (message.content.toLowerCase() === '!ping') {
        message.reply(`🏓 Pong! Latency is ${client.ws.ping}ms.`);
    }
});

// Start the bot
client.login(process.env.DISCORD_TOKEN);
