const fs = require('fs')
// const WebSocket = require('ws')
// const wss = new WebSocket.Server({
//     port: 8080
// })
const axios = require('axios')

let json = JSON.parse(fs.readFileSync('./data/counter.json', 'utf8'))
let messages = json.messages
let members = json.members

function numberWithCommas (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// wss.broadcast = data => {
//     wss.clients.forEach(client => {
//         if (client.readyState === WebSocket.OPEN) {
//             client.send(data, err => {
//                 if (err) console.log(err)
//             })
//         }
//     })
// }
//
// wss.on('connection', ws => {
//     ws.send(`${messages},${members}`, err => {
//         if (err) console.log(err)
//     })
// })
//
// wss.on('error', err => {
//     console.log(err)
// })
//
// setInterval(() => {
//     wss.broadcast(`${messages},${members}`)
// }, 1000)

// setInterval(() => {
//     let obj = {
//         messages,
//         members
//     }
//     fs.writeFileSync('./data/counter.json', JSON.stringify(obj))
// }, 60000)

// console.log(messages, 'msgs')
// console.log(members, 'members')
// 
// module.exports.newMessage = async () => {
//     messages += 1
// }

module.exports.memberUpdate = async bot => {
    setInterval(() => {
        members = bot.guilds.get(process.env.GUILD_ID).memberCount
    }, 10000)
}

module.exports.updateCounters = async bot => {
    const guild = bot.guilds.get(process.env.GUILD_ID)
    const memberCt = numberWithCommas(guild.memberCount)
    const memberChannel = guild.channels.get(process.env.MEMBER_STATS_CHANNEL)
    let memText = `MEMBERS: ${memberCt}`

    if (memText !== memberChannel.name) {
        memberChannel.setName(memText, 'Update Member Count').catch(console.error)
    }

    let env = process.env
    const pewdsSubs = await axios.get(env.YT_REQUEST_URL.replace('{KEY}', env.YT_KEY).replace('{ID}', env.PEWDS_ID))
    const gapCt = ~~(pewdsSubs.data.items[0].statistics.subscriberCount / 1000000)
    const gapChannel = guild.channels.get(process.env.SUB_GAP_CHANNEL)
    let gapText = `YT SUBS: ${gapCt}M+`
    if (gapText !== gapChannel.name) {
        gapChannel.setName(gapText, 'Update Sub Gap Count').catch(console.error)
    }
}
