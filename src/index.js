const fetch = require('node-fetch')
const yauzl = require("yauzl")
const concat = require('concat-stream')
const Progress = require('node-fetch-progress')
require('array-flat-polyfill')

const fs = require('fs')
const path = require('path')
const util = require('util')

const locales = require('./locales.json')
const sets = require('./sets.json')

const BASE_DATADRAGON_URL = 'https://dd.b.pvp.net/latest/'

const ignore = [
  'COPYRIGHT',
  'metadata.json',
  'README.md'
]

const openZip = util.promisify(yauzl.open)

fs.mkdirSync('build')
fs.mkdirSync('downloads')
fs.mkdirSync('extracted')

fs.writeFileSync('build/metadata.json', JSON.stringify({ locales, sets }))

locales.forEach(locale => {
  fs.mkdirSync(`build/${locale}/data`, { recursive: true })
  fs.mkdirSync(`build/${locale}/img/cards`, { recursive: true })
  fs.mkdirSync(`build/${locale}/img/regions`, { recursive: true })

  const fileName = `core-${locale}.zip`
  console.log(`Downloading ${fileName}`)
  downloadFile(fileName).then(savePath => {
    console.log(`Finished downloading ${fileName}`)
    console.log(`Extracting files from ${fileName}`)
    openZip(savePath, { lazyEntries: true }).then(zipfile => {
      zipfile.readEntry()
      zipfile.on("entry", function(entry) {
        if (/\/$/.test(entry.fileName)) return zipfile.readEntry() // Skip folders
        if (ignore.includes(path.basename(entry.fileName))) return zipfile.readEntry() // Skip ignored files
        zipfile.openReadStream(entry, function(err, readStream) {
          if (err) throw err
          readStream.on("end", () => zipfile.readEntry())
          let destination = `build/${locale}/${path.basename(entry.fileName)}`
          if (entry.fileName.startsWith(`core-${locale}/${locale}/img/regions/`)) {
            destination = `build/${locale}/img/regions/${path.basename(entry.fileName)}`
          }
          if (path.basename(entry.fileName) === `globals-${locale}.json`) {
            destination = `build/${locale}/data/globals.json`
          }
          console.info(`Extracting ${entry.fileName} to ${destination}`)
          const file = fs.createWriteStream(destination)
          readStream.pipe(file)
        })
      })
    }).catch(console.error)
  }).catch(console.error)

  sets.forEach(set => {
    const fileName = `set${set}-${locale}.zip`
    console.log(`Downloading ${fileName}`)
    downloadFile(fileName).then(savePath => {
      console.log(`Finished downloading ${fileName}`)
      console.log(`Extracting ${fileName}`)

      openZip(savePath, { lazyEntries: true }).then(zipfile => {
        zipfile.readEntry()
        zipfile.on("entry", function(entry) {
          if (/\/$/.test(entry.fileName)) return zipfile.readEntry() // Skip folders
          if (ignore.includes(path.basename(entry.fileName))) return zipfile.readEntry() // Skip ignored files
          zipfile.openReadStream(entry, function(err, readStream) {
            if (err) throw err
            readStream.on('data', () => zipfile.readEntry())
            let destination = `build/${locale}/${path.basename(entry.fileName)}`

            if (entry.fileName.startsWith(`set${set}-${locale}/${locale}/img/cards/`)) {
              console.info(`Extracting ${entry.fileName} to ${destination}`)
              const file = fs.createWriteStream(`build/${locale}/img/cards/${path.basename(entry.fileName)}`)
              readStream.pipe(file)
            }

            if (path.basename(entry.fileName) === `set${set}-${locale}.json`) {
              zipfile.readEntry()
            }
          })
        })
      }).catch(console.error)
    })
  })
})

const cardData = {}
locales.forEach(locale => {
  cardData[locale] = {}
})

function addCards (cards, locale, set) {
  cardData[locale][set] = cards
  console.log(`Got card data for set ${set} in ${locale}.`)
  if (Object.keys(cardData[locale]).length === sets.length) {
    console.log(`All ${locale} cards have been extracted. Writing cards.json...`)
    const allCards = Object.keys(cardData[locale]).map(key => cardData[locale][key]).flat()
    fs.writeFileSync(`build/${locale}/data/cards.json`, JSON.stringify(allCards))
  }
}

function downloadFile (fileName) {
  return new Promise((resolve, reject) => {
    const savePath = `downloads/${fileName}`
    fetch(`${BASE_DATADRAGON_URL}${fileName}`).then(res => {
      const dest = fs.createWriteStream(savePath)
      const progress = new Progress(res, { throttle: 100 })

      dest.on('finish', () => {
        resolve(savePath)
      })

      dest.on('error', err => {
        reject(err)
      })

      progress.on('progress', p => {
        console.log(`${fileName}: ${Math.round(p.progress*100)}%`)
      })

      res.body.pipe(dest)
    })
  })
}

function promisify(api) {
  return function(...args) {
    return new Promise(function(resolve, reject) {
      api(...args, function(err, response) {
        if (err) return reject(err);
        resolve(response);
      });
    });
  };
}