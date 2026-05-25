process.on("unhandledRejection", (err) => console.error("[Unhandled]", err));
process.on("uncaughtException", (err) => console.error("[Uncaught]", err));

const { Client, GatewayIntentBits } = require("discord.js");
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus
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

    cron.schedule("*/1 * * * *", async () => {   // Test setiap 1 menit
        console.log(`⏰ Cron berjalan [${new Date().toLocaleString('id-ID')}]`);

        try {
            const guild = client.guilds.cache.get("1492442606410530918");
            const channel = guild?.channels.cache.get("1500136991222792312");

            if (!guild || !channel) {
                return console.log("❌ Guild atau Channel tidak ditemukan");
            }

            if (guild.members.me?.voice.channel) {
                return console.log("⚠️ Bot sudah di voice channel");
            }

            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
            });

            console.log(`✅ Berhasil join ke: ${channel.name}`);

            const player = createAudioPlayer();

            const audioPath = path.join(__dirname, "lagu.mp3");
            const resource = createAudioResource(audioPath, {
                inlineVolume: true
            });

            connection.subscribe(player);
            player.play(resource);

            console.log("🎵 Sedang memutar lagu...");

            player.on(AudioPlayerStatus.Playing, () => {
                console.log("▶️ Audio sedang diputar!");
            });

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

client.login(process.env.TOKEN_BOT)
    .catch(err => console.error("❌ Login Error:", err.message));