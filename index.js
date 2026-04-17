const { Client, GatewayIntentBits, Events } = require('discord.js');

// Simon Salem Identity Config
const OPERATOR_NAME = "Simon Salem";
const TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Simon Salem's Connection Handler
client.once(Events.ClientReady, (readyClient) => {
    console.log(`=========================================`);
    console.log(`DEPLOAYMENT SUCCESSFUL`);
    console.log(`OPERATOR: ${OPERATOR_NAME}`);
    console.log(`BOT TAG: ${readyClient.user.tag}`);
    console.log(`STATUS: Operational & Crash-Resistant`);
    console.log(`=========================================`);
});

client.on(Events.MessageCreate, async (message) => {
    // Basic safety: Ignore bots and messages without prefix
    if (message.author.bot || !message.content.startsWith('!')) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Simon Salem's Bug Command: !bug @user
    if (command === 'bug') {
        const target = message.mentions.users.first();
        if (!target) return message.reply("Simon Salem's Bot Error: You must mention a target! 🪲");

        console.log(`[${OPERATOR_NAME} LOG]: Bugging sequence started for ${target.username}`);
        
        // Loop 10 times
        for (let i = 0; i < 10; i++) {
            try {
                await message.channel.send(`🪲 **BUG PROTOCOL** | ${target} | Managed by ${OPERATOR_NAME}`);
                // 1.5s delay is the 'Sweet Spot' for Railway to avoid API bans
                await new Promise(resolve => setTimeout(resolve, 1500));
            } catch (error) {
                console.error(`[${OPERATOR_NAME} ERROR]: Could not send message:`, error.message);
                break; // Exit loop if we hit a serious error
            }
        }
    }

    // Simon Salem's Ghost Command: !ghost @user
    if (command === 'ghost') {
        const target = message.mentions.users.first();
        if (!target) return;

        for (let i = 0; i < 5; i++) {
            try {
                const ghost = await message.channel.send(`${target}`);
                await ghost.delete();
                await new Promise(r => setTimeout(r, 1000));
            } catch (e) {
                console.log(`[${OPERATOR_NAME} LOG]: Ghost failed (likely missing 'Manage Messages' permission)`);
            }
        }
        console.log(`[${OPERATOR_NAME} LOG]: Ghost sequence finished.`);
    }
});

// CRASH PROTECTION: This prevents the bot from dying on Railway if an error occurs
process.on('unhandledRejection', (reason, promise) => {
    console.error(`[${OPERATOR_NAME} CRITICAL ERROR]: Unhandled Rejection at:`, promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error(`[${OPERATOR_NAME} CRITICAL ERROR]: Uncaught Exception:`, err);
});

client.login(TOKEN).catch(err => {
    console.error(`[${OPERATOR_NAME} LOGIN ERROR]: Failed to login. Check your DISCORD_TOKEN variable!`);
});
