const Discord = require('discord.js')
const { convert } = require('convert-svg-to-png')
const svgCaptcha = require('svg-captcha')

module.exports.run = async (bot, member) => {
  const guild = bot.guilds.get('333915065277349888')
  const roleID = '372536409321635840'
  const role = guild.roles.get('372536409321635840')
  const welcomeC = guild.channels.get('362724817729880066')
  const captchaID = '523569602865790976'
  const captchaRole = guild.roles.get(captchaID)
  const captchaC = guild.channels.get('523569478768918528')

  const successText =
    `**Success.** Welcome to **${guild.name}**!` +
    ` \n\nYou probably some questions, perhaps about PewDiePie.` +
    ` If you want these answered, please refer to <#526632479856263170>.` +
    ` \nDon't have any questions? Refer to the rules anyways - you don't want to be kicked for a dumb reason.` +
    ` \n\n**Enjoy your stay! <:brofist:337742740265631744>**`

  welcomeC
    .send(
      `<:brofist:337742740265631744> Welcome to **${guild.name}**, <@${
        member.id
      }>, please check your DMs for verification. We now have **${guild.memberCount.toLocaleString(
        'en-US'
      )}** members!`
    )
    .catch(console.error)
  const captcha = await genCaptcha().catch(e => console.log(e))

  await sendCaptcha(member.user, captcha)

  async function sendCaptcha(channel, captcha) {
    let embed = new Discord.RichEmbed()
      .setImage('attachment://captcha.png')
      .setColor('#fad7da')
      .setTitle('Beep boop. Are you an Indian bot?')
      .setDescription('Solve the captcha, you have **3 mins**:')

    channel
      .send({
        embed,
        files: captcha.png
      })
      .then(m => {
        let filter = m => m.author.id === member.id && m.content === captcha.code
        m.channel
          .awaitMessages(filter, { max: 1, time: 180000, errors: ['time'] })
          .then(async c => {
            let embed = new Discord.RichEmbed().setDescription(successText).setColor('#fad7da')
            channel
              .send(embed)
              .then(successM => {
                if (member.roles.find(r => r.id === captchaID))
                  member.removeRole(captchaRole, 'Passed Verification.')
                member.addRole(role, 'Passed Verification.').catch(console.error)
                if (successM.channel.type === 'text')
                  setTimeout(() => {
                    successM.delete()
                  }, 180000)
              })
              .catch(console.error)
          })
          .catch(c => {
            if (member.roles.find(r => r.id === roleID))
              return member
                .removeRole(captchaRole, 'Manually Passed Verification.')
                .catch(e => console.log())

            if (m.channel.type === 'dm')
              return m.channel
                .send(
                  '**You ran out of time!** Please rejoin to try again: https://discord.gg/zyTfdeS'
                )
                .then(() => member.kick('Failed Verification.').catch(console.error))
            else member.kick('Failed Verification.').catch(console.error)
          })
        if (m.channel.type === 'text')
          setTimeout(() => {
            m.delete()
          }, 180000)
      })
      .catch(e => {
        if (e.code === 50007) {
          member
            .addRole(captchaRole, 'User has disabled DMs.')
            .catch(console.error)
            .then(() => {
              let text = `<@${
                member.id
              }> There was an error sending you a DM! Please complete the captcha here.`
              captchaC
                .send(text)
                .then(captchaM => {
                  setTimeout(() => {
                    captchaM.delete()
                  }, 180000)
                })
                .catch(console.error)
              sendCaptcha(captchaC, captcha)
            })
        } else console.log(e)
      })
  }

  async function genCaptcha() {
    const captcha = svgCaptcha.createMathExpr({
      color: true,
      background: '#f9f8f7',
      noise: 2
    })
    const png = await convert(captcha.data, {
      width: 450,
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      }
    })

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
