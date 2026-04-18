const { Client, Events, GatewayIntentBits, ActivityType } = require('discord.js');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ] 
});

client.once(Events.ClientReady, (c) => {
    console.log(`✅ Deployment Successful! Logged in as ${c.user.tag}`);
    
    // Set a custom status so you know the bot is live
    client.user.setActivity('System Logs', { type: ActivityType.Watching });
});

client.on(Events.MessageCreate, async (message) => {
    // Ignore bots to prevent infinite loops
    if (message.author.bot) return;

    const msg = message.content.toLowerCase();

    if (msg === 'hello') {
        message.reply('👋 I am back online! Build fixed.');
    }

    if (msg === '!status') {
        message.reply('🛡️ **System Status:** Operational\n🚀 **Platform:** Railway');
    }
});

// Safety: Handle unhandled promise rejections to keep the bot from crashing
process.on('unhandledRejection', error => {
    console.error('Unhandled promise rejection:', error);
});

client.login(process.env.DISCORD_TOKEN);
