require('dotenv').config()

const Discord = require('discord.js')
const recognition = require('./modules/recognition.js')
const captcha = require('./modules/captcha.js')
const counter = require('./modules/counter.js')

const bot = new Discord.Client({
  disableEveryone: true
})

bot.on('ready', async () => {
  console.log(`Logged in as ${bot.user.username}`)
  bot.user.setActivity(`Congratulations`, {
    type: 'WATCHING'
  })
  // UPDATE COUNTERS EVERY 5 MINUTES
  bot.setInterval(async () => {
    counter.updateCounters(bot)
  }, 3e5)
  counter.updateCounters(bot)
})
counter.memberUpdate(bot)

bot.on('guildMemberAdd', async member => {
  if (member.guild.id === process.env.GUILD_ID && !member.user.bot) captcha.run(bot, member)
})
bot.on('guildMemberRemove', async member => {
  if (member.guild.id === process.env.GUILD_ID) {
    member.guild.channels
      .get('362724817729880066')
      .send(`👋 Byebye <@${member.id}>, we won't miss ya!`)
  }
})

bot.on('message', async msg => {
  // if (msg.author.id !== '283052467879411712' && msg.author.id !== '513795593118810139') return
  counter.newMessage()
  if (msg.author.id === bot.user.id) return
  if (msg.author.bot) return
  //IMAGE RECOGNITION
  if (msg.channel.id === process.env.GENERAL_CHANNEL) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    if (msg.embeds.length >= 1 || msg.attachments.size >= 1) return await recognition.run(msg)
  }
  if (msg.channel.id === process.env.CAPTCHA_CHANNEL && !msg.author.bot)
    msg.delete('Captcha channel.').catch(e => console.log(e.message))
})

bot.login(process.env.DISCORD_TOKEN).catch('Error Connecting')
