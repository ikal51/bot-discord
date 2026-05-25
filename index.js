process.on("unhandledRejection", (err) => console.error("[Unhandled]", err));
process.on("uncaughtException", (err) => console.error("[Uncaught]", err));

const { Client, GatewayIntentBits, ActivityType } = require("discord.js"); // Tambah ActivityType
const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    StreamType
} = require("@discordjs/voice");
const cron = require("node-cron");
require("dotenv").config();

console.log("🚀 Bot sedang dijalankan...");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ],
    // 🔥 Cara 1: Mengatur status Idle langsung saat bot pertama kali login
    presence: {
        status: 'idle', // Pilihan: 'online', 'idle', 'dnd', 'invisible'
        activities: [{
            name: 'Indonesia Raya 🇮🇩',
            type: ActivityType.Watching // Pilihan: Playing, Streaming, Listening, Watching, Competing
        }]
    }
});

client.once("clientReady", () => {
    console.log(`✅ BOT BERHASIL LOGIN sebagai ${client.user.tag}`);
    console.log(`🌙 Status bot diset menjadi IDLE`);

    // Cron test setiap 1 menit
    cron.schedule("*/1 * * * *", async () => {
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
            
            // Menggunakan URL audio streaming biar lancar di Railway
            const audioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; 
            
            const resource = createAudioResource(audioUrl, {
                inputType: StreamType.Arbitrary,
                inlineVolume: true
            });

            connection.subscribe(player);
            player.play(resource);

            console.log("🎵 Sedang memutar audio dari URL...");

            player.on(AudioPlayerStatus.Playing, () => {
                console.log("▶️ Audio sedang diputar di Discord!");
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