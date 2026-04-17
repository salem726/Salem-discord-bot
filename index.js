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

// --- DISCORD SETUP ---
const discordClient = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

async function startSalemOS() {
    // Create session folder if it doesn't exist
    if (!fs.existsSync('./salem_session')) {
        fs.mkdirSync('./salem_session');
    }
    
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
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // PAIRING CODE LOGIC
    if (!sock.authState.creds.registered) {
        console.log(`\x1b[36m[ LOGGING ] Initializing connection for ${OWNER_NUMBER}...\x1b[0m`);
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(OWNER_NUMBER);
                console.log(`\n\x1b[45m[ SIMON SALEM PAIRING CODE ]\x1b[0m`);
                console.log(`\x1b[1m\x1b[32mCODE: ${code}\x1b[0m`);
                console.log(`\x1b[37mEnter this in WhatsApp > Linked Devices > Link with Phone Number\x1b[0m\n`);
            } catch (err) {
                console.log("Error fetching pairing code. Retrying...");
            }
        }, 8000); // 8 second delay to ensure socket readiness
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log("[SYSTEM] Reconnecting...");
                startSalemOS();
            }
        } else if (connection === "open") {
            console.log(`\x1b[32m[ONLINE]\x1b[0m ${OWNER}'s WhatsApp Network is Active.`);
        }
    });

    // --- DISCORD BUG COMMANDS ---
    discordClient.on('messageCreate', async (message) => {
        if (!message.content.startsWith(PREFIX) || message.author.bot) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // 1. KILL (WhatsApp Flood)
        if (command === 'kill') {
            const target = args[0];
            if (!target) return message.reply("Target number required (e.g., 254712345678).");
            
            message.reply(`🧪 **SIMON SALEM:** Sending bugs to ${target}...`);
            for (let i = 0; i < 7; i++) {
                await sock.sendMessage(`${target}@s.whatsapp.net`, { 
                    text: `🐛 *CRITICAL BUG: INFESTATION BY ${OWNER.toUpperCase()}* 🐛` 
                });
                await delay(1000);
            }
            return message.channel.send(`✅ **Success.** Target ${target} has been bugged.`);
        }

        // 2. STING (Direct Message)
        if (command === 'sting') {
            const target = args[0];
            const msg = args.slice(1).join(' ');
            if (!target || !msg) return message.reply("Usage: `!sting [number] [message]`");

            await sock.sendMessage(`${target}@s.whatsapp.net`, { 
                text: `🐝 *STING BY ${OWNER.toUpperCase()}:* \n\n"${msg}"` 
            });
            return message.reply(`✅ Sting injected into ${target}.`);
        }

        // 3. STATUS
        if (command === 'status' || command === 'salem') {
            const statusEmbed = new EmbedBuilder()
                .setTitle(`🕸️ ${OWNER} Apex Core Status`)
                .setColor(0x00FFBB)
                .setDescription(`📡 **Status:** Active\n📱 **WhatsApp:** Linked to ${OWNER_NUMBER}`)
                .setFooter({ text: `SALEM-OS: Confirmed Build` });
            return message.reply({ embeds: [statusEmbed] });
        }
    });

    discordClient.once('ready', () => {
        console.log(`\x1b[34m[DISCORD]\x1b[0m Logged in as ${discordClient.user.tag}`);
        discordClient.user.setActivity(`Bugs by ${OWNER}`, { type: ActivityType.Watching });
    });

    discordClient.login(process.env.BOT_TOKEN);
}

startSalemOS().catch(err => console.error("FATAL_STARTUP_ERROR:", err));
