/**
 * PROJECT: SALEM-OS APEX (BUG EDITION)
 * AUTHOR: SIMON SALEM
 * TARGET: 254782972716
 */

const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    delay, 
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");
const { Client, GatewayIntentBits, EmbedBuilder, ActivityType } = require('discord.js');
const pino = require("pino");
const fs = require('fs');
require('dotenv').config();

const OWNER = "Simon Salem";
const OWNER_NUMBER = "254782972716";
const PREFIX = "!";

// --- DISCORD INITIALIZATION ---
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

async function startSalemOS() {
    // Ensure the session directory exists for Railway persistence
    if (!fs.existsSync('./salem_session')) fs.mkdirSync('./salem_session');
    
    const { state, saveCreds } = await useMultiFileAuthState('./salem_session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "silent" }),
        browser: ["Railway", "Chrome", "20.0.04"]
    });

    // RAILWAY PAIRING LOGIC
    if (!sock.authState.creds.registered) {
        console.log(`\x1b[36m[ LOGGING ] Connecting to ${OWNER_NUMBER}...\x1b[0m`);
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(OWNER_NUMBER);
                console.log(`\n\x1b[45m[ SIMON SALEM PAIRING CODE ]\x1b[0m`);
                console.log(`\x1b[1m\x1b[32mCODE: ${code}\x1b[0m`);
                console.log(`\x1b[37mGo to WhatsApp > Linked Devices > Link with Phone Number\x1b[0m\n`);
            } catch (err) {
                console.log("Retrying pairing code generation...");
            }
        }, 6000);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startSalemOS();
        } else if (connection === "open") {
            console.log(`\x1b[32m[ONLINE]\x1b[0m ${OWNER}'s WhatsApp Matrix is Active.`);
        }
    });

    // --- BUG COMMAND HANDLER ---
    discordClient.on('messageCreate', async (message) => {
        if (!message.content.startsWith(PREFIX) || message.author.bot) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // KILL: Notification Overload
        if (command === 'kill') {
            const target = args[0];
            if (!target) return message.reply("Target required: `!kill 254XXXXXXXXX`.");
            
            message.reply(`🧪 **SIMON SALEM:** Deploying infestation to ${target}...`);
            for (let i = 0; i < 7; i++) {
                await sock.sendMessage(`${target}@s.whatsapp.net`, { 
                    text: `🐛 *CRITICAL BUG: INFESTATION BY ${OWNER.toUpperCase()}* 🐛` 
                });
                await delay(800);
            }
            return message.channel.send(`✅ **Extermination complete.** Target ${target} has been bugged.`);
        }

        // STING: Branded Direct Message
        if (command === 'sting') {
            const target = args[0];
            const msg = args.slice(1).join(' ');
            if (!target || !msg) return message.reply("Usage: `!sting [number] [message]`");

            await sock.sendMessage(`${target}@s.whatsapp.net`, { 
                text: `🐝 *STING FROM ${OWNER.toUpperCase()} NETWORK:* \n\n"${msg}"` 
            });
            return message.reply(`✅ Sting injected into ${target}.`);
        }

        // HIVE: System Status
        if (command === 'hive' || command === 'status') {
            const hiveEmbed = new EmbedBuilder()
                .setTitle(`🕸️ ${OWNER}'s Apex Core Status`)
                .setColor(0x00FFBB)
                .addFields(
                    { name: 'Developer', value: OWNER, inline: true },
                    { name: 'WhatsApp', value: 'Connected', inline: true },
                    { name: 'Targeting', value: OWNER_NUMBER, inline: true }
                )
                .setFooter({ text: `SALEM-OS: Railway Edition` })
                .setTimestamp();
            return message.reply({ embeds: [hiveEmbed] });
        }
    });

    discordClient.once('ready', () => {
        console.log(`\x1b[34m[DISCORD]\x1b[0m Logged in as ${discordClient.user.tag}`);
        discordClient.user.setActivity(`Bugs by ${OWNER}`, { type: ActivityType.Watching });
    });

    discordClient.login(process.env.BOT_TOKEN);
}

startSalemOS();
