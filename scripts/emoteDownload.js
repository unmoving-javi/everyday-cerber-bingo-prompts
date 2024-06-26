// @ts-check
const fs = require('fs')
const path = require('path')
const axios = require('axios').default

const emotes = require('../src/helpers/emotesList.json')
const assetsPath = path.resolve(__dirname, '../public/assets/images/emotes')
const apiUrl = 'https://wsrv.nl/?url=cdn.7tv.app/emote'

/**
 * Download emote by name
 * @param {string} name
 * @param {boolean} printUrl
 */
const downloadEmote = (name, printUrl = false) => {
  let emoteId = emotes[name]
  if (!emoteId) return null

  let page = -1
  if (emoteId.includes('_')) {
    const emoteWithPage = emoteId.split('_')

    emoteId = emoteWithPage[0]
    page = emoteWithPage[1]
  }

  const url = `${apiUrl}/${emoteId}/1x.webp`

  const urls = {
    animated: `${url}&n=-1`,
    static: `${url}&page=${page}`
  }

  for (const emoteType in urls) {
    const typeName = emoteType.substring(0, 1)
    const fileName = `${name}_${typeName}.webp`

    if (printUrl) {
      console.log(`Link to the ${name} ${emoteType} emote: ${urls[emoteType]}`)
    }

    downloadFile(
      fileName,
      urls[emoteType],
      path.resolve(__dirname, assetsPath, fileName)
    )
  }
}

/**
 * Download and save emote file to disk
 * @param {string} fileName
 * @param {string} fileUrl
 * @param {string} downloadPath
 */
const downloadFile = async (fileName, fileUrl, downloadPath) => {
  try {
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream'
    })

    const w = response.data.pipe(fs.createWriteStream(downloadPath))
    w.on('finish', () => {
      console.log(`Successfully downloaded file - ${fileName}`)
    })
  } catch (error) {
    console.error(`${fileUrl}, ${error}`)
  }
}

/**
 * Main function
 */
const main = async () => {
  const emoteToUpdate = process.argv[2] ?? null

  // remove all emotes from the `assetsPath` folder (if any)
  if (!emoteToUpdate) {
    fs.readdir(assetsPath, (err, files) => {
      if (err) throw err

      for (const file of files) {
        fs.unlink(path.join(assetsPath, file), (err) => {
          if (err) throw err
        })
      }
    })
  }

  // download again
  if (emoteToUpdate) {
    await downloadEmote(emoteToUpdate, true)
  } else {
    for (const emoteName in emotes) {
      await downloadEmote(emoteName)
    }
  }
}

main()
