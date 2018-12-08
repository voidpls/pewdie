require('dotenv').config()

const Discord = require('discord.js')
const recognition = require('./modules/recognition.js')
const bot = new Discord.Client({
  disableEveryone: true
})

const gID = '333915065277349888'
const statID = '520430348790661120'

bot.on('ready', async () => {
  console.log(`Logged in as ${bot.user.username}`)
  bot.user.setActivity(`bitch lasagna`, {
    type: 'WATCHING'
  })
  const guild = bot.guilds.get(gID)
  // UPDATE COUNTER EVERY 5 MINUTES
  bot.setInterval(async () => {
    const memberCt = guild.memberCount
    const text = `l═ Members: ${memberCt} ═l`
    const statChannel = guild.channels.get(statID)
    if (text === statChannel.name) return
    statChannel.setName(text, 'Update Member Count').catch(console.error)
  }, 3e5)
})

bot.on('message', async msg => {
  if (msg.author.id === bot.user.id) return
  if (msg.author.bot) return

  //IMAGE RECOGNITION
  if (msg.channel.id === '480833794211971092') {
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (msg.embeds.length >= 1 || msg.attachments.size >= 1) await recognition.run(msg)
  }
})

bot.login(process.env.DISCORD_TOKEN).catch('Error Connecting')
