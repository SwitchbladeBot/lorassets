const fetch = require('node-fetch')
const AdmZip = require('adm-zip')
const Progress = require('node-fetch-progress')
require('array-flat-polyfill')
const axios = require('axios').default
const cldr = require('cldr')

const fs = require('fs')

const BASE_DATADRAGON_URL = 'https://dd.b.pvp.net/latest/'

const ignore = [
  'COPYRIGHT',
  'metadata.json',
  'README.md'
]

if (fs.existsSync('build')) {
  console.log('removing')
  fs.rmdirSync('build', { recursive: true,  })
}
fs.mkdirSync('build')
if (!fs.existsSync('downloads')) fs.mkdirSync('downloads')

function getSetBundleFileName (set, locale) {
  return `set${set}-${locale}.zip`
}

function getCoreBundleFileName (locale) {
  return `core-${locale}.zip`
}

async function getSets () {
  let sets = []
  let current = 1

  while (true) {
    const exists = await setExists(current)
    if (exists) {
      sets.push(current)
      current++
    } else {
      break
    }
  }

  return sets
}

async function setExists (set) {
  return axios.head(`${BASE_DATADRAGON_URL}${getSetBundleFileName(set, 'en_us')}`).then(res => {
    return res.status == 200
  }).catch(err => {
    return false
  })
}

async function build () {
  const locales = require('./locales.json')

  console.log('Looking for available sets...')
  const sets = await getSets()
  console.log(`Got ${sets.length} sets (${sets.join(', ')})`)
  
  fs.writeFileSync('build/metadata.json', JSON.stringify({ locales, sets }))
  
  locales.forEach(locale => {
    fs.mkdirSync(`build/${locale}/data`, { recursive: true })
    fs.mkdirSync(`build/${locale}/img/cards`, { recursive: true })
    fs.mkdirSync(`build/${locale}/img/regions`, { recursive: true })

    const fileName = getCoreBundleFileName(locale)
    console.log(`Downloading ${fileName}`)
    downloadFile(fileName).then(savePath => {
      console.log(`Finished downloading ${fileName}`)

      console.log(`Extracting files from ${fileName}`)
      const zip = new AdmZip(savePath)
      zip.getEntries().forEach(entry => {

        // Skip folders and ignored files
        if (/\/$/.test(entry.entryName) || ignore.includes(entry.name)) return

        console.log(`Extracting ${entry.entryName}`)

        // Region icons
        if (entry.entryName.startsWith(`core-${locale}/${locale}/img/regions/`)) {
          zip.extractEntryTo(entry, `build/${locale}/img/regions`)
          return
        }

        // Globals
        if (entry.name === `globals-${locale}.json`) {
          fs.writeFileSync(`build/${locale}/data/globals.json`, zip.readFile(entry))
          return
        }
      })
    }).catch(console.error)

    sets.forEach(set => {
      const fileName = getSetBundleFileName(set, locale)
      console.log(`Downloading ${fileName}`)
      downloadFile(fileName).then(savePath => {
        console.log(`Finished downloading ${fileName}`)
        const zip = new AdmZip(savePath)
        zip.getEntries().forEach(entry => {

          // Skip folders and ignored files
          if (/\/$/.test(entry.entryName) || ignore.includes(entry.name)) return

          console.log(`Extracting ${entry.entryName}`)

          // Card data
          if (entry.name === `set${set}-${locale}.json`) {
            const data = JSON.parse(zip.readAsText(entry))
            addCards(data, locale, set)
          }

          // Card images
          if (entry.entryName.startsWith(`set${set}-${locale}/${locale}/img/cards/`)) {
            zip.extractEntryTo(entry, `build/${locale}/img/cards`, false)
            return
          }

        })
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

  let progressData = {}

  function downloadFile (fileName) {
    return new Promise((resolve, reject) => {
      const savePath = `downloads/${fileName}`
      if (fs.existsSync(savePath)) return resolve(savePath)
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
          const current = Math.round(p.progress*100)
          if (progressData[fileName] != current) {
            progressData[fileName] = current
            console.log(fileName, `${current}%`)
          }
        })

        res.body.pipe(dest)
      })
    })
  }
}

build()