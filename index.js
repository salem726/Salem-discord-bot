const { default: makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const { Client, GatewayIntentBits } = require("discord.js");
const qrcode = require("qrcode-terminal");
const pino = require("pino");

// --- DISCORD SETUP ---
const discordClient = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

discordClient.on("ready", () => {
    console.log(`Logged into Discord as ${discordClient.user.tag}`);
});

// --- WHATSAPP SETUP ---
async function connectWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: "silent" })
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) qrcode.generate(qr, { small: true });
        if (connection === "open") {
            console.log("Connected to WhatsApp: 254739340935");
        }
    });

    sock.ev.on("creds.update", saveCreds);

    // --- BRIDGE LOGIC ---
    // Example: When a WhatsApp message arrives, send it to Discord
    sock.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.key.fromMe && msg.message) {
            const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
            console.log(`WhatsApp from ${msg.key.remoteJid}: ${text}`);
            // You can add discordClient.channels.cache.get('ID').send(text) here
        }
    });
}

// Start both
discordClient.login(process.env.DISCORD_TOKEN);
connectWhatsApp();
