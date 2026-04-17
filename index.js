/**
 * PROJECT: SALEM-OS APEX (CONFIRMED BUILD)
 * AUTHOR: SIMON SALEM
 * TARGET NUMBER: 254782972716
 * VERSION: 7.0.0
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
    const { state, saveCreds } = await useMultiFileAuthState('salem_session_data');
    const { version } = await fetchLatestBaileysVersion();

    // --- WHATSAPP ENGINE ---
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

    // PAIRING CODE GENERATOR
    if (!sock.authState.creds.registered) {
        console.log(`\n\x1b[36m[ LOGGING ] Connecting to ${OWNER_NUMBER}...\x1b[0m`);
        setTimeout(async () => {
            try {
                let code = await sock.requestPairingCode(OWNER_NUMBER);
                console.log(`\n\x1b[45m[ SIMON SALEM PAIRING CODE ]\x1b[0m`);
                console.log(`\x1b[1m\x1b[32mCODE: ${code}\x1b[0m`);
                console.log(`\x1b[37mGo to WhatsApp > Linked Devices > Link with Phone Number\x1b[0m\n`);
            } catch (err) {
                console.log("Error generating pairing code. Retrying...");
            }
        }, 5000);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log(`[WA] Connection Closed. Reason: ${reason}`);
            if (reason !== DisconnectReason.loggedOut) startSalemOS();
        } else if (connection === "open") {
            console.log(`\x1b[32m[SYSTEM ONLINE]\x1b[0m ${OWNER}'s WhatsApp Matrix is Active.`);
        }
    });

    // --- DISCORD COMMAND HANDLER ---
    discordClient.on('messageCreate', async (message) => {
        if (!message.content.startsWith(PREFIX) || message.author.bot) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // BRANDED COMMAND: STATUS
        if (command === 'status' || command === 'salem') {
            const statusEmbed = new EmbedBuilder()
                .setAuthor({ name: `${OWNER} Apex Core` })
                .setColor(0x00FFBB)
                .setDescription(`📡 **Status:** Operational\n🛠️ **Engine:** Salem-OS v7\n📱 **WhatsApp:** Linked to ${OWNER_NUMBER}`)
                .setFooter({ text: `Proprietary Code by ${OWNER}` })
                .setTimestamp();
            return message.reply({ embeds: [statusEmbed] });
        }

        // BUG COMMAND: KILL (WhatsApp Spam Utility)
        if (command === 'kill') {
            const target = args[0];
            if (!target) return message.reply("Format: `!kill 254XXXXXXXXX` (No + sign)");

            message.reply(`🧪 **SIMON SALEM:** Injecting bugs into target: ${target}...`);
            
            for (let i = 0; i < 5; i++) {
                await sock.sendMessage(`${target}@s.whatsapp.net`, { 
                    text: `🐛 *CRITICAL BUG: INFESTATION BY ${OWNER.toUpperCase()}* 🐛` 
                });
                await delay(800);
            }
            return message.channel.send(`✅ **Attack Success.** Target ${target} has been quarantined.`);
        }

        // BUG COMMAND: STING (Direct Messaging)
        if (command === 'sting') {
            const target = args[0];
            const content = args.slice(1).join(' ');
            if (!target || !content) return message.reply("Format: `!sting <number> <message>`");

            await sock.sendMessage(`${target}@s.whatsapp.net`, { 
                text: `🐝 *STING FROM ${OWNER.toUpperCase()} NETWORK:*\n\n${content}` 
            });
            return message.reply(`✅ Message stung through to ${target}.`);
        }
    });

    discordClient.on('ready', () => {
        console.log(`\x1b[34m[DISCORD]\x1b[0m Logged in as ${discordClient.user.tag}`);
        discordClient.user.setActivity(`Managed by ${OWNER}`, { type: ActivityType.Playing });
    });

    discordClient.login(process.env.BOT_TOKEN);
}

startSalemOS().catch(e => console.error("STARTUP_ERROR:", e));
