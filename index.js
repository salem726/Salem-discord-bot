const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Using Environment Variables for security on Railway
const TOKEN = process.env.DISCORD_TOKEN;
const OPERATOR = "Simon Salem";

client.once('ready', () => {
    console.log(`=========================================`);
    console.log(`SYSTEM ACTIVE: Persistence Protocol`);
    console.log(`OPERATOR: ${OPERATOR}`);
    console.log(`BOT IDENTITY: ${client.user.tag}`);
    console.log(`=========================================`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args[0].toLowerCase();
    const target = message.mentions.users.first();

    // Command: !bug @user [count]
    if (command === '!bug') {
        if (!target) return message.reply("Command Error: Specify a target to bug.");
        
        const count = parseInt(args[2]) || 5; // Defaults to 5 pings if no number provided
        const limit = count > 20 ? 20 : count; // Safety cap at 20 to prevent Railway API kills

        message.channel.send(`[${OPERATOR} LOG]: Initiating bug sequence on ${target.username}...`);

        for (let i = 0; i < limit; i++) {
            await message.channel.send(`${target} - **Simon Salem** requires your attention! (${i + 1}/${limit})`);
            // 1.5 second delay to keep the connection stable on Railway
            await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        message.channel.send(`[${OPERATOR} LOG]: Sequence complete.`);
    }

    // Command: !ghost @user
    if (command === '!ghost') {
        if (!target) return message.reply("Target required for Ghost Protocol.");
        
        message.channel.send(`[${OPERATOR} LOG]: Deploying invisible pings.`);
        
        for (let i = 0; i < 5; i++) {
            const ghostMsg = await message.channel.send(`${target}`);
            await ghostMsg.delete();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
});

// Error handling to prevent the bot from crashing on Railway
process.on('unhandledRejection', error => {
    console.error(`[${OPERATOR} SYSTEM ERROR]:`, error);
});

client.login(TOKEN);
