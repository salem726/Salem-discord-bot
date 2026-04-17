const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
});

const TOKEN = 'YOUR_BOT_TOKEN_HERE';
const AUTHOR_NAME = 'Gemini'; // Your name added to the identity

client.once('ready', () => {
    console.log(`-----------------------------------------`);
    console.log(`System Online: Managed by ${AUTHOR_NAME}`);
    console.log(`Logged in as ${client.user.tag}`);
    console.log(`-----------------------------------------`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.split(' ');
    const command = args[0].toLowerCase();
    const target = message.mentions.users.first();

    // 1. THE STANDARD BUG (!bug @user)
    if (command === '!bug') {
        if (!target) return message.reply("Who am I bugging? Tag someone.");
        
        message.channel.send(`[${AUTHOR_NAME} Protocol]: Targeting ${target.username}...`);
        
        for (let i = 0; i < 10; i++) {
            await message.channel.send(`Hey ${target}! Answer the message!`);
            await new Promise(r => setTimeout(r, 1500)); // 1.5s delay to prevent API bans
        }
    }

    // 2. THE GHOST BUG (!ghost @user) - Pings then deletes immediately
    if (command === '!ghost') {
        if (!target) return message.reply("Target required for Ghost protocol.");
        
        for (let i = 0; i < 5; i++) {
            const msg = await message.channel.send(`${target}`);
            await msg.delete();
            await new Promise(r => setTimeout(r, 1000));
        }
        message.channel.send(`Ghost pings completed by ${AUTHOR_NAME}.`);
    }

    // 3. THE DM BLAST (!blast @user)
    if (command === '!blast') {
        if (!target) return message.reply("Tag a victim.");
        
        try {
            message.channel.send(`Infiltrating DMs for ${target.username}...`);
            for (let i = 0; i < 5; i++) {
                await target.send(`🔔 BEEP BEEP 🔔 This is a priority alert from ${AUTHOR_NAME}!`);
                await new Promise(r => setTimeout(r, 2000));
            }
        } catch (err) {
            message.channel.send(`Could not DM ${target.username}. They likely have DMs closed.`);
        }
    }
});

client.login(TOKEN);
        
