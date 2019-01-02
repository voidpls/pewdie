const fs = require('fs')
const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8080 })

let json = JSON.parse(fs.readFileSync('./data/counter.json', 'utf8'))
let messages = json.messages
let members = json.members

wss.broadcast = data => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data, err => {
        if (err) console.log(err)
      })
    }
  })
}

wss.on('connection', ws => {
  ws.send(`${messages},${members}`, err => {
    if (err) console.log(err)
  })
})

wss.on('error', err => {
  console.log(err)
})

setInterval(() => {
  wss.broadcast(`${messages},${members}`)
}, 1000)

setInterval(() => {
  let obj = {
    messages,
    members
  }
  fs.writeFileSync('./data/counter.json', JSON.stringify(obj))
}, 60000)

console.log(messages, 'msgs')
console.log(members, 'members')

module.exports.newMessage = async () => {
  messages += 1
}

module.exports.memberUpdate = async bot => {
  setInterval(() => {
    members = bot.guilds.get('333915065277349888').memberCount
  }, 1000)
}
