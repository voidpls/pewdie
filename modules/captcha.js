const Discord = require('discord.js')
const { convert } = require('convert-svg-to-png')
const svgCaptcha = require('svg-captcha')

module.exports.run = async (bot, member) => {
  const guildID = '333915065277349888'
  const guild = bot.guilds.get(guildID)
  const roleID = '372536409321635840'
  const role = guild.roles.get(roleID)
  const welcomeID = '362724817729880066'
  const welcomeC = guild.channels.get('362724817729880066')

  const captcha = await genCaptcha()

  await sendCaptcha(member.user, captcha).catch(async e => {
    if (e.code === 50007) {
      welcomeC
        .send(
          `<@${member.id}> There was an error sending you a DM! Please complete the captcha here.`
        )
        .catch(console.error)
      sendCaptcha(welcomeC, captcha)
    }
  })

  async function sendCaptcha(channel, captcha) {
    let embed = new Discord.RichEmbed()
      .setImage('attachment://captcha.png')
      .setColor('#fad7da')
      .setTitle('Beep boop. Are you an Indian bot?')
      .setDescription('Solve the captcha, you have **60 secs**:')

    await channel
      .send({
        embed,
        files: captcha.png
      })
      .then(m => {
        let filter = m => m.author.id === member.id && m.content === captcha.code
        m.channel
          .awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
          .then(async c => {
            const text =
              `**Success.** Welcome to **${guild.name}**!` +
              ` \n\nYou probably some questions, perhaps about PewDiePie.` +
              ` If you want these answered, please refer to <#513755213044252672>.` +
              ` \nDon't have any questions? Refer to the rules anyways - you don't want to be kicked for a dumb reason.` +
              ` \n\n**Enjoy your stay! <:brofist:337742740265631744>**`
            let embed = new Discord.RichEmbed().setDescription(text).setColor('#fad7da')

            m.channel.send(embed).then(() => {
              member.addRole(role, 'Passed Verification.')
            })
          })
          .catch(c => {
            m.channel
              .send('**You ran out of time!** Please rejoin to try again.')
              .then(() => member.kick('Failed Verification.').catch(console.error))
          })
      })
  }

  async function genCaptcha() {
    const captcha = svgCaptcha.createMathExpr({
      color: true,
      background: '#f9f8f7',
      noise: 2
    })
    const png = await convert(captcha.data, { width: 450 })

    return {
      png: [
        {
          attachment: png,
          name: 'captcha.png'
        }
      ],
      code: captcha.text
    }
  }
}