// ==================== DISCORD VOICE BOT ====================
process.on("unhandledRejection", (err) => console.error("[Unhandled Rejection]", err));
process.on("uncaughtException", (err) => console.error("[Uncaught Exception]", err));

const { Client, GatewayIntentBits } = require("discord.js");
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus
} = require("@discordjs/voice");

const cron = require("node-cron");
const path = require("path");
require("dotenv").config();

console.log("🚀 Bot sedang dijalankan...");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

client.once("ready", () => {
    console.log(`✅ BOT BERHASIL LOGIN sebagai ${client.user.tag}`);

    // === CRON SCHEDULE ===
    // Saat ini test setiap 1 menit → nanti ubah sesuai kebutuhan
    cron.schedule("*/1 * * * *", async () => {
        console.log(`⏰ [${new Date().toLocaleString('id-ID')}] Cron berjalan`);

        try {
            const guild = client.guilds.cache.get("1492442606410530918");
            if (!guild) return console.log("❌ Guild tidak ditemukan");

            const channel = guild.channels.cache.get("1500136991222792312");
            if (!channel) return console.log("❌ Voice channel tidak ditemukan");

            // Cegah multiple join
            if (guild.members.me?.voice.channel) {
                return console.log("⚠️ Bot sudah di voice channel");
            }

            // Join VC
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });

            console.log(`✅ Berhasil join ke: ${channel.name}`);

            const player = createAudioPlayer();
            const resource = createAudioResource(path.join(__dirname, "lagu.mp3"));

            connection.subscribe(player);
            player.play(resource);

            console.log("🎵 Sedang memutar lagu...");

            player.on(AudioPlayerStatus.Idle, () => {
                console.log("✅ Lagu selesai, disconnect...");
                connection.destroy();
            });

            player.on("error", (err) => {
                console.error("❌ Player Error:", err.message);
                connection.destroy();
            });

        } catch (err) {
            console.error("❌ Error di cron:", err);
        }
    }, {
        timezone: "Asia/Jakarta"
    });
});

// Login Bot
client.login(process.env.TOKEN_BOT)
    .then(() => console.log("🔑 Proses login berhasil dimulai..."))
    .catch(err => {
        console.error("❌ LOGIN GAGAL:", err.message);
        console.error("⚠️ Pastikan TOKEN_BOT sudah diatur di Railway Environment Variables");
    });