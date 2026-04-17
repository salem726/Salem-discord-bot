const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Simon Salem Identity Config
const OPERATOR = "Simon Salem";
const TOKEN = process.env.DISCORD_TOKEN; 

client.once('ready', () => {
    console.log(`-----------------------------------------`);
    console.log(`[SYSTEM]: Simon Salem's Bug Bot is LIVE`);
    console.log(`[STATUS]: Connected as ${client.user.tag}`);
    console.log(`-----------------------------------------`);
});

client.on('messageCreate', async (message) => {
    // Ignore other bots
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args[0].toLowerCase();

    // COMMAND: !bug @user
    if (command === '!bug') {
        const target = message.mentions.users.first();
        if (!target) return message.reply("Target required! 🪲");

        console.log(`[${OPERATOR} LOG]: Initiating pings on ${target.tag}`);

        // Small loop for persistence
        for (let i = 0; i < 15; i++) {
            try {
                await message.channel.send(`🪲 **BUGGED** by ${OPERATOR}: ${target} wake up!`);
                // 1.2 second delay avoids Discord's immediate spam filter
                await new Promise(r => setTimeout(r, 1200));
            } catch (err) {
                console.log(`[${OPERATOR} ERROR]: Rate limit hit or missing permissions.`);
                break;
            }
        }
    }

    // COMMAND: !raid (Spams the general channel with Simon's name)
    if (command === '!raid') {
        message.channel.send(`🚨 RAID PROTOCOL BY ${OPERATOR} ACTIVATED 🚨`);
        for (let i = 0; i < 10; i++) {
            await message.channel.send("🪲🪲🪲 BUGGING IN PROGRESS 🪲🪲🪲");
            await new Promise(r => setTimeout(r, 1000));
        }
    }
});

client.login(TOKEN);
