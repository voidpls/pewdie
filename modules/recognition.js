const AWS = require('aws-sdk')
const axios = require('axios')
const creds = new AWS.Credentials(process.env.AWS_ACCESS_ID, process.env.AWS_ACCESS_KEY)
AWS.config.update({
  credentials: creds,
  region: 'us-east-1'
})
const rekog = new AWS.Rekognition()

const asyncForEach = async (arr, cb) => {
  for (let i = 0; i < arr.length; i++) {
    await cb(arr[i], i, arr)
  }
}

module.exports.run = async msg => {
  const extReg = new RegExp(/(.png|.jpg|.jpeg)$/)
  const imgs = []
  msg.embeds.filter(e => e.type === 'image' && extReg.test(e.url)).map(e => imgs.push(e.url))
  msg.attachments.filter(a => extReg.test(a.filename)).map(a => imgs.push(a.url))
  if (imgs.length < 1) return

  asyncForEach(imgs, async img => {
    const res = await axios.get(img, { responseType: 'arraybuffer' })
    if (res.data.byteLength > 5242880) return
    const b64 = new Buffer.from(res.data, 'base64')
    rekog.recognizeCelebrities(
      {
        Image: {
          Bytes: b64
        }
      },
      (err, data) => {
        if (err) return console.error(err.message)
        if (data.CelebrityFaces.length === 0) return
        data.CelebrityFaces.map(async face => {
          //ADD THRESHOLD
          if (face.Name === 'Ben Shapiro')
            await msg.react(process.env.SHAPIRO_EMOTE).catch(console.error)
          else if (face.Name === 'PewDiePie')
            await msg.react(process.env.PEWDS_EMOTE).catch(console.error)
        })
      }
    )
  })
}
