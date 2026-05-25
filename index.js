process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

const {
  Client,
  GatewayIntentBits
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");

const cron = require("node-cron");

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(`login sebagai ${client.user.tag}`);

  // TEST: tiap 1 menit
  // ganti nanti jadi "42 11 * * *" buat jam 11:42 WIB
  cron.schedule("*/1 * * * *", async () => {

    console.log("mulai join vc...");

    try {

      // ID SERVER
      const guild = client.guilds.cache.get("1492442606410530918");

      if (!guild) {
        console.log("guild tidak ditemukan");
        return;
      }

      // ID VOICE CHANNEL
      const channel = guild.channels.cache.get("1500136991222792312");

      if (!channel) {
        console.log("voice channel tidak ditemukan");
        return;
      }

      // join vc
      const connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator
      });

      console.log("berhasil join vc");

      // audio player
      const player = createAudioPlayer();

      // file mp3
      const resource = createAudioResource("./lagu.mp3");

      // play
      player.play(resource);

      // subscribe
      connection.subscribe(player);

      console.log("muter lagu...");

      // selesai
      player.on(AudioPlayerStatus.Idle, () => {
        console.log("lagu selesai");

        connection.destroy();
      });

    } catch (err) {
      console.error(err);
    }

  }, {
    timezone: "Asia/Jakarta"
  });

});

// LOGIN BOT
client.login(process.env.MTI5MzUzMjg5NzQxNTkyMTY2NA.GNiIhz.HJ9PYTOI9VZ77YORYZ3tcH-ZRfM05V0NewkfPM);