/**
 * PROJECT: SALEM-OS (BUG-ONLY EDITION)
 * AUTHOR: SIMON SALEM
 * TARGET: 254782972716
 */

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    DisconnectReason,
    fetchLatestBaileysVersion 
} = require("@whiskeysockets/baileys");
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const pino = require("pino");
require('dotenv').config();

const OWNER = "Simon Salem";
const OWNER_NUMBER = "254782972716";
const PREFIX = "!";

const discordClient = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

async function startBugBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./salem_bug_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Railway", "Chrome", "20.0.04"]
    });

    // Pairing Logic for Railway Logs
    if (!sock.authState.creds.registered) {
        setTimeout(async () => {
            let code = await sock.requestPairingCode(OWNER_NUMBER);
            console.log(`\n\x1b[45m[ SIMON SALEM BUG-BOT PAIRING CODE ]\x1b[0m`);
            console.log(`\x1b[1m\x1b[32mCODE: ${code}\x1b[0m\n`);
        }, 5000);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startBugBot();
        } else if (connection === "open") {
            console.log(`\x1b[32m[SYSTEM ONLINE]\x1b[0m Simon Salem's Bug Bot is active on WhatsApp.`);
        }
    });

    discordClient.on('messageCreate', async (message) => {
        if (!message.content.startsWith(PREFIX) || message.author.bot) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // --- EXCLUSIVELY BUG COMMANDS ---

        // 1. KILL (WhatsApp Notification Overload)
        if (command === 'kill') {
            const target = args[0];
            if (!target) return message.reply("Target required: `!kill 254XXXXXXXXX`.");
            
            message.reply(`🧪 **SIMON SALEM:** Deploying infestation to ${target}...`);
            for (let i = 0; i < 7; i++) {
                await sock.sendMessage(`${target}@s.whatsapp.net`, { 
                    text: `🐛 *SYSTEM ERROR: INFESTATION DETECTED BY ${OWNER.toUpperCase()}* 🐛` 
                });
                await delay(700);
            }
            return message.channel.send(`✅ **Extermination complete.** ${target} has been bugged.`);
        }

        // 2. STING (Direct Toxic Message)
        if (command === 'sting') {
            const target = args[0];
            const msg = args.slice(1).join(' ');
            if (!target || !msg) return message.reply("Usage: `!sting [number] [message]`");

            await sock.sendMessage(`${target}@s.whatsapp.net`, { 
                text: `🐝 *STING FROM ${OWNER.toUpperCase()}'S COLONY:* \n\n"${msg}"` 
            });
            return message.reply(`✅ Sting injected into ${target}.`);
        }

        // 3. INFEST (Discord UI Swarm)
        if (command === 'infest') {
            const count = Math.min(parseInt(args[0]) || 5, 20);
            let swarm = "";
            for(let i=0; i<count; i++) swarm += "🐜 🐛 🦗 🕷️ 🐝 🦂 \n";
            return message.channel.send(`⚠️ **SWARM WARNING:** ${OWNER} has breached the containment!\n${swarm}`);
        }

        // 4. HIVE (Bot Health & Status)
        if (command === 'hive' || command === 'status') {
            const hiveEmbed = new EmbedBuilder()
                .setTitle(`🕸️ ${OWNER}'s Bug-Bot Status`)
                .setColor(0x2b2d31)
                .addFields(
                    { name: 'Colony Queen', value: OWNER, inline: true },
                    { name: 'Target Number', value: OWNER_NUMBER, inline: true },
                    { name: 'System Integrity', value: '100% (No Leaks)', inline: true }
                )
                .setFooter({ text: `SALEM-OS: Bug Edition` });
            return message.reply({ embeds: [hiveEmbed] });
        }
    });

    discordClient.login(process.env.BOT_TOKEN);
}

startBugBot();
        
