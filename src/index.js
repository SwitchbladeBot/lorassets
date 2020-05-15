const fetch = require('node-fetch')
const extract = require('extract-zip')

const fs = require('fs')
const path = require('path')

const locales = require('./locales.json')
const sets = require('./sets.json')

const BASE_DATADRAGON_URL = 'https://dd.b.pvp.net/latest/'

const cardData = {}
locales.forEach(locale => {
  cardData[locale] = {}
})

fs.mkdirSync('build')
fs.writeFileSync('build/metadata.json', JSON.stringify({ locales, sets }))

locales.forEach(locale => {
  fs.mkdirSync(`build/${locale}/data`, { recursive: true })
  fs.mkdirSync(`build/${locale}/img/cards`, { recursive: true })
  fs.mkdirSync(`build/${locale}/img/regions`, { recursive: true })

  const fileName = `core-${locale}.zip`
  console.log(`Downloading ${fileName}`)
  downloadFile(fileName).then((savePath) => {
    console.log(`Finished downloading ${fileName}`)
    console.log(`Extracting ${fileName}`)
    extract(savePath, { dir: `${__dirname}/../extracted/${path.basename(savePath, '.zip')}` }).then(() => {
      console.log(`Finished extracting ${fileName}`)
      fs.copyFileSync(`./extracted/core-${locale}/${locale}/data/globals-${locale}.json`, `build/${locale}/data/globals.json`)
      fs.readdirSync(`./extracted/core-${locale}/${locale}/img/regions`).forEach(regionImage => {
        console.log(`Copying ${locale} ${regionImage}`)
        fs.copyFileSync(`./extracted/core-${locale}/${locale}/img/regions/${regionImage}`, `build/${locale}/img/regions/${regionImage}`)
      })
    })
  })

  sets.forEach(set => {
    const fileName = `set${set}-${locale}.zip`
    console.log(`Downloading ${fileName}`)
    downloadFile(fileName).then((savePath) => {
      console.log(`Finished downloading ${fileName}`)
      console.log(`Extracting ${fileName}`)
      extract(savePath, { dir: `${__dirname}/../extracted/${path.basename(savePath, '.zip')}` }).then(() => {
        console.log(`Finished extracting ${fileName}`)
        const setCards = require(`../extracted/set${set}-${locale}/${locale}/data/set${set}-${locale}.json`)
        addCards(setCards, locale, set)
        fs.readdirSync(`./extracted/set${set}-${locale}/${locale}/img/cards`).forEach(cardImage => {
          console.log(`Copying ${cardImage} in ${locale}`)
          fs.copyFileSync(`./extracted/set${set}-${locale}/${locale}/img/cards/${cardImage}`, `build/${locale}/img/cards/${cardImage}`)
        })
      })
    })
  })
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

      dest.on('finish', () => {
        resolve(savePath)
      })

      dest.on('error', err => {
        reject(err)
      })

      res.body.pipe(dest)
    })
  })
}
