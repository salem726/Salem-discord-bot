/**
 * PROJECT: SALEM-OS RAILWAY EDITION
 * AUTHOR: SIMON SALEM
 * TARGET NUMBER: 254782972716
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

async function startSalemOS() {
    // Railway-optimized session path
    const { state, saveCreds } = await useMultiFileAuthState('./salem_session');
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
        console.log("-----------------------------------------");
        console.log("WAITING FOR PAIRING CODE...");
        setTimeout(async () => {
            let code = await sock.requestPairingCode(OWNER_NUMBER);
            console.log(`>>> YOUR RAILWAY PAIRING CODE: ${code} <<<`);
        }, 5000);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startSalemOS();
        } else if (connection === "open") {
            console.log(`SALEM-OS ONLINE: WhatsApp linked to ${OWNER_NUMBER}`);
        }
    });

    // Discord Logic
    discordClient.on('messageCreate', async (message) => {
        if (!message.content.startsWith(PREFIX) || message.author.bot) return;
        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        if (command === 'kill') {
            const target = args[0];
            if (!target) return message.reply("Format: !kill 254XXXXXXXXX");
            for (let i = 0; i < 5; i++) {
                await sock.sendMessage(`${target}@s.whatsapp.net`, { text: `🐛 *BUG BY ${OWNER.toUpperCase()}*` });
                await delay(1000);
            }
            message.reply(`✅ Target ${target} exterminated.`);
        }

        if (command === 'status') {
            message.reply(`🚀 **SALEM-OS** is running on Railway. Managed by **${OWNER}**.`);
        }
    });

    discordClient.login(process.env.BOT_TOKEN);
}

startSalemOS();
