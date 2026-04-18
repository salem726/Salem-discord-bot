const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Create a new client instance
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ] 
});

// When the bot is ready, run this code
client.once('ready', () => {
    console.log(`Ready! Logged in as ${client.user.tag}`);
});

// Listen for messages
client.on('messageCreate', (message) => {
    // 1. Ignore messages from other bots
    if (message.author.bot) return;

    // 2. Respond to 'hello'
    if (message.content.toLowerCase() === 'hello') {
        message.reply('Hi there! 👋 I am online and ready to help.');
    }
});

// Login to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);
