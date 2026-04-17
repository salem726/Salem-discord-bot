const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ] 
});

const PREFIX = "!";
const OWNER = "Simon Salem";

client.once('ready', () => {
    console.log(`System Check: ${OWNER}'s bot is officially online.`);
    client.user.setPresence({
        activities: [{ name: `Design by ${OWNER}`, type: ActivityType.Playing }],
        status: 'online',
    });
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- IDENTITY COMMANDS ---

    if (command === 'who') {
        message.reply(`I am the official AI assistant for **${OWNER}**. Currently managing Salem's server and projects.`);
    }

    if (command === 'socials') {
        message.reply(`🔗 **Connect with ${OWNER}:**\nInstagram: https://www.instagram.com/officialsalem8\nGitHub: https://github.com/salem726`);
    }

    // --- UTILITY & INFO ---

    if (command === 'ping') {
        message.reply(`🏓 Pong! Connection Speed: **${client.ws.ping}ms**`);
    }

    if (command === 'uptime') {
        let days = Math.floor(client.uptime / 86400000);
        let hours = Math.floor(client.uptime / 3600000) % 24;
        let minutes = Math.floor(client.uptime / 60000) % 60;
        message.reply(`⏳ **${OWNER}'s Bot** has been running for: ${days}d ${hours}h ${minutes}m`);
    }

    // --- FUN & INTERACTION ---

    if (command === 'joke') {
        const jokes = [
            "Why did the developer go broke? Because he used up all his cache.",
            "How many programmers does it take to change a lightbulb? None, that's a hardware problem.",
            "What is a programmer's favorite hangout place? The Foo Bar."
        ];
        message.reply(jokes[Math.floor(Math.random() * jokes.length)]);
    }

    if (command === 'pick') {
        if (!args[0]) return message.reply("Give me some options! Example: `!pick apples oranges` ");
        const choice = args[Math.floor(Math.random() * args.length)];
        message.reply(`🤔 I choose: **${choice}**`);
    }

    if (command === '8ball') {
        const responses = ["It is certain", "Ask again later", "Very doubtful", "Simon Salem says yes", "My sources say no"];
        message.reply(`🎱 ${responses[Math.floor(Math.random() * responses.length)]}`);
    }

    // --- SERVER MANAGEMENT ---

    if (command === 'kick') {
        if (!message.member.permissions.has('KickMembers')) return message.reply("Access Denied.");
        const member = message.mentions.members.first();
        if (!member) return message.reply("Who should I kick?");
        member.kick().then(() => message.reply(`✅ Successfully removed ${member.user.tag}.`));
    }

    if (command === 'clear') {
        if (!message.member.permissions.has('ManageMessages')) return message.reply("You lack permissions.");
        const amt = parseInt(args[0]);
        if (!amt || amt > 100) return message.reply("Provide a number 1-100.");
        await message.channel.bulkDelete(amt + 1);
        message.channel.send(`🧹 Cleaned up ${amt} messages for you.`).then(m => setTimeout(() => m.delete(), 2000));
    }

    // --- THE COMPREHENSIVE HELP MENU ---

    if (command === 'help') {
        const helpEmbed = `
**--- ${OWNER.toUpperCase()}'S BOT COMMANDS ---**

🆔 **Identity:** \`!who\`, \`!socials\`, \`!uptime\`
🎮 **Fun:** \`!joke\`, \`!8ball\`, \`!pick [option1] [option2]\`, \`!ping\`
🛠️ **Admin:** \`!clear [number]\`, \`!kick [@user]\`

*Status: Hosted 24/7 on Railway*
        `;
        message.reply(helpEmbed);
    }
});

client.login(process.env.DISCORD_TOKEN);
            
