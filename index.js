const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, DisconnectReason } = require("@whiskeysockets/baileys");
const pino = require("pino");
const express = require("express");
const colors = require("colors");

const app = express();
const PORT = process.env.PORT || 3000;
const SIMON_NUMBER = "25482972716";

// Simon's Railway Portal Dashboard (Web View)
app.get("/", (req, res) => {
    res.status(200).send(`<h1>Vampire Killer v9: Online</h1><p>Target: ${SIMON_NUMBER}</p>`);
});
app.listen(PORT, () => console.log(`[SYSTEM] Simon's Railway Portal active on port ${PORT}`.cyan));

async function startV9() {
    const { state, saveCreds } = await useMultiFileAuthState('v9_session');
    
    const v9 = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" })),
        },
        printQRInTerminal: false,
        logger: pino({ level: "fatal" }),
        browser: ["Simon Salem V9", "Safari", "1.0.0"]
    });

    // PAIRING CODE GENERATOR
    if (!v9.authState.creds.registered) {
        console.log("========================================".magenta);
        console.log("   VAMPIRE KILLER V9: PAIRING PORTAL    ".bgMagenta.white.bold);
        console.log("========================================".magenta);
        
        setTimeout(async () => {
            let code = await v9.requestPairingCode(SIMON_NUMBER);
            console.log(`\n[!] SIMON SALEM, YOUR BOT TOKEN CODE: `.yellow.bold + `${code}\n`.white.bgRed.bold);
            console.log(`[ACTION] Enter this code in your WhatsApp Linked Devices menu.\n`.grey);
        }, 5000);
    }

    v9.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            if (lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut) startV9();
        } else if (connection === "open") {
            console.log(`[SUCCESS] V9 Engine Linked to ${SIMON_NUMBER}`.green.bold);
        }
    });

    v9.ev.on("creds.update", saveCreds);

    // V9 RESPONDER
    v9.ev.on("messages.upsert", async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (text === ".status") {
            await v9.sendMessage(msg.key.remoteJid, { text: "V9 Engine Status: Active\nUser: Simon Salem" });
        }
    });
}

startV9();
