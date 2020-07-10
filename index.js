require('dotenv').config()

const Discord = require('discord.js')
// const recognition = require('./modules/recognition.js')
// const captcha = require('./modules/captcha.js')
const counter = require('./modules/counter.js')

const bot = new Discord.Client({
    // disableEveryone: true
})

const invites = {}
const wait = require('util').promisify(setTimeout)

bot.on('ready', async () => {
    wait(5000)
    console.log(`Logged in as ${bot.user.username}`)
    const userCount = bot.guilds.map(g => g.memberCount).reduce((a, b) => a + b)
    console.log(`Serving ${bot.guilds.size} servers and ${userCount} members`)
    const guild = bot.guilds.get(process.env.GUILD_ID)
    guild.fetchInvites().then(guildInvites => {
        invites[guild.id] = guildInvites
    }).catch(console.error)

    bot.user.setActivity(`Pixelings`, {
        type: 'PLAYING'
    }).catch(console.error)

    // UPDATE COUNTERS EVERY 5 MINUTES
    bot.setInterval(async () => {
        counter.updateCounters(bot)
    }, 3e5)
    counter.updateCounters(bot)
})
counter.memberUpdate(bot)

bot.on('guildMemberAdd', async member => {
    const guild = member.guild
    if (guild.id === process.env.GUILD_ID && !member.user.bot) {
    // captcha.run(bot, member)
        const guidMembers = guild.memberCount.toLocaleString(
            'en-US'
        )
        let welcomeMsg = `<:brofist:337742740265631744> Welcome to **${guild.name}**, <@${member.id}>, ` +
      `please check <#585825250730836022> to gain access to the server. We now have **${guidMembers}** members! `
        const guildInvites = await guild.fetchInvites()
        const oldInvites = invites[guild.id]
        invites[guild.id] = guildInvites
        const invite = guildInvites.filter(i => i.uses && oldInvites.get(i.code) && oldInvites.get(i.code).uses < i.uses)
        if (invite.size === 1 && invite.first()) {
            const inviter = bot.users.get(invite.first().inviter.id)
            if (inviter && inviter.username) welcomeMsg = welcomeMsg + `(Invited by **${inviter.username}**)`
        }
        bot.channels
            .get('362724817729880066')
            .send(welcomeMsg)
            .catch(console.error)
    }
})
bot.on('guildMemberRemove', async member => {
    if (member.guild.id === process.env.GUILD_ID) {
        member.guild.channels
            .get('362724817729880066')
            .send(`👋 Byebye <@${member.id}>, we won't miss ya!`)
    }
})

bot.on('error', console.error)

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at: Promise', promise, 'reason:', reason)
})

bot.on('message', async msg => {
    // if (msg.author.id !== '283052467879411712' && msg.author.id !== '513795593118810139') return
    // counter.newMessage()
    if (msg.author.id === bot.user.id) return
    if (msg.author.bot) return
    if (msg.channel.type === 'dm') return
    // IMAGE RECOGNITION
    // if (msg.channel.id === process.env.GENERAL_CHANNEL) {
    //   await new Promise(resolve => setTimeout(resolve, 1000))
    //   if (msg.embeds.length >= 1 || msg.attachments.size >= 1) return await recognition.run(msg)
    // }

    const args = msg.content
        .slice(process.env.PREFIX.length)
        .split(' ')
        .slice(1)
    const cmd = msg.content
        .slice(process.env.PREFIX.length)
        .split(' ')[0]
        .toLowerCase()

    if (msg.channel.id === process.env.CAPTCHA_CHANNEL && msg.author.id !== bot.user.id) {
        msg.delete('Captcha channel.').catch(e => console.log(e.message))
    }

    if (cmd === 'embed') {
        if (!msg.member.hasPermission('ADMINISTRATOR')) return msg.channel.send('sry i dont serve gay people')
        if (args.length < 2) {
            return msg.channel
                .send(`**Usage:** \`${process.env.PREFIX}embed [channel] {embed data}\`\n` +
          `See https://leovoel.github.io/embed-visualizer/ for embed data; copy everything from left side.\n\n` +
          `(Use a hexadecimal to decimal converter to convert color hexes to integers)`
                )
        }
        const channelID = args.shift().replace(/<|#|>/g, '')
        const channel = msg.guild.channels.get(channelID)
        let json = args.join(' ')

        if (!channel) return msg.channel.send('<:error:335660275481051136> **Error:** Invalid Channel')
        try {
            json = JSON.parse(json)
        } catch (e) {
            console.log(e.message)
            return msg.channel.send('<:error:335660275481051136> **Error:** Invalid Embed Data. See https://leovoel.github.io/embed-visualizer/.')
        }
        channel.send(json).catch(console.log)
    }
})

bot.on('roleUpdate', async (oldRole, newRole) => {
    const managerChannel = bot.guilds
        .get(process.env.GUILD_ID)
        .channels.get(process.env.MANAGER_CHAT)
    if (!oldRole.hasPermission('ADMINISTRATOR') && newRole.hasPermission('ADMINISTRATOR'))
        return managerChannel.send(`[\⚠️@everyone\⚠️] \nRole \`${newRole.name}\` \`[ID ${newRole.id}]\` was just given the \`ADMINISTRATOR\` permission.`)
    if (!oldRole.hasPermission('BAN_MEMBERS') && newRole.hasPermission('BAN_MEMBERS'))
        return managerChannel.send(`[\⚠️@everyone\⚠️] \nRole \`${newRole.name}\` \`[ID ${newRole.id}]\` was just given the \`BAN_MEMBERS\` permission.`)
})

bot.on('roleCreate', async role => {
    const managerChannel = bot.guilds
        .get(process.env.GUILD_ID)
        .channels.get(process.env.MANAGER_CHAT)
    if (role.hasPermission('ADMINISTRATOR'))
        return managerChannel.send(`[\⚠️@everyone\⚠️] \nRole \`${role.name}\` \`[ID ${role.id}]\` was just created with the \`ADMINISTRATOR\` permission.`)
    if (role.hasPermission('BAN_MEMBERS'))
        return managerChannel.send(`[\⚠️@everyone\⚠️] \nRole \`${role.name}\` \`[ID ${role.id}]\` was just created with the \`BAN_MEMBERS\` permission.`)
})


bot.login(process.env.DISCORD_TOKEN).catch(e => console.log('Error Connecting'))
