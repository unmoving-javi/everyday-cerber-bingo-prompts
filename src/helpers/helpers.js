// @ts-check
// eslint-disable-next-line no-unused-vars
import * as Types from 'helpers/types.d'
import { useLocalStorage } from '@vueuse/core'

/**
 * Split array into chunks
 * @param {Array} array
 * @param {number} chunkSize
 */
export const chunkArray = (array, chunkSize) => {
  let index = 0
  const chunks = []

  for (index = 0; index < array.length; index += chunkSize) {
    const chunk = array.slice(index, index + chunkSize)
    chunks.push(chunk)
  }

  return chunks
}

/**
 * Shuffle the array based on the seed
 * @param {Array} array
 * @param {number} seed
 */
export const shuffle = (array, seed) => {
  let currentIndex = array.length, temporaryValue, randomIndex
  seed = seed || 1

  const random = function () {
    const x = Math.sin(seed++) * 10000

    return x - Math.floor(x)
  }

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(random() * currentIndex)
    currentIndex -= 1
    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

/**
 * Create a deep copy of an array
 * @param {Array} array
 * @returns {Array}
 */
export const deepCopy = (array) => JSON.parse(JSON.stringify(array))

/**
 * Merge arrays and deduplicate entries
 * @param  {...string[]} arrays
 * @returns {string[]}
 */
export const mergeUnique = (...arrays) => [...new Set([].concat(...arrays))]

/**
 * Generate 48 prompts for the board
 * @param {Types.ParticipantData[]} allPrompts
 * @param {number} seed
 * @param {number} boardSize
 * @returns {Types.Prompt[]}
 */
export const generatePrompts = (allPrompts, seed, boardSize) => {
  const participantsCount = allPrompts.length
  const countForParticipiant = Math.floor((boardSize - 1) / participantsCount)
  console.debug(`Expecting ${countForParticipiant} prompts for each participant...`)

  let finalPrompts = []
  finalPrompts = Array.from(new Array(participantsCount), () => [])

  allPrompts.forEach((data, index) => {
    const prompts = shuffle(data.prompts, seed).slice(0, countForParticipiant)

    if (prompts.length < countForParticipiant) {
      throw Error(`Not enough propmts for ID: "${data.participantId}". We expect ${countForParticipiant}, we received ${prompts.length}`)
    }

    prompts.forEach(text => {
      finalPrompts[index].push({
        id: data.participantId,
        text
      })
    })
  })

  if (participantsCount > 1) return transposeForBoard(finalPrompts).flat()

  return shuffle(finalPrompts.flat(), seed)
}

/**
 * Transposes the array, then reverses the last half of the array
 * (for uniformity on the board)
 * @param {Array} array
 * @returns {Array}
 */
export const transposeForBoard = (array) => {
  const transposedArray = array[0].map((_, colIndex) => array.map(row => row[colIndex])).flat()

  return transposedArray
    .splice(0, transposedArray.length / 2)
    .concat(transposedArray.reverse())
}

/**
 * Returns a random number (inslusive).
 * If `lastInt` is provided, it will be ignored
 * @param {number} min Min value
 * @param {number} max Max value
 * @param {number} [lastInt=null] Last generated number
 * @returns {number}
 */
export const getRandomInt = (min, max, lastInt = null) => {
  min = Math.ceil(min)
  max = Math.floor(max)

  let randomInt
  do {
    randomInt = Math.floor(Math.random() * (max - min + 1) + min)
  } while (randomInt === lastInt)

  return randomInt
}

/**
 * Generates seed phrase based on a browser + current date in UTC timezone + random user seed (in local storage)
 * @param {number} version
 * @param {string} name
 * @returns {string} Seed phrase
 */
export const generateBrowserSeed = (version, name) => {
  const randomUserSeed = useLocalStorage('randomUserSeed', getRandomInt(1, 69420))
  console.debug('Random user seed -', randomUserSeed.value)

  // offsetting to 15:29 UTC
  const now = new Date()
  const offset = 15 * 60 + 29
  if (now.getUTCHours() * 60 + now.getUTCMinutes() < offset) {
    now.setUTCDate(now.getUTCDate() - 1)
  }

  return ''.concat(
    version.toString(),
    now.getUTCDate().toString(),
    now.getUTCMonth().toString(),
    now.getUTCFullYear().toString(),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    window.navigator?.languages.toString() ?? 'en',
    randomUserSeed.value.toString(),
    name
  ).replaceAll(/[^a-zA-Z0-9]+/g, '')
}

/**
 * Return a value from the path in an object
 * @param {object} object
 * @param {string} path
 */
export const get = (object, path) =>
  path.split('.').reduce((r, k) => r?.[k], object)

/**
 * Normalize path to board object key
 * @param {string} path
 */
export const routeNorm = (path) =>
  path.slice(1).replaceAll('/', '.')

/**
 * Winning lines for the board
 */
export const winningLines = {
  small: [
    // rows
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9],
    [10, 11, 12, 13, 14],
    [15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24],

    // columns
    [0, 5, 10, 15, 20],
    [1, 6, 11, 16, 21],
    [2, 7, 12, 17, 22],
    [3, 8, 13, 18, 23],
    [4, 9, 14, 19, 24],

    // diagonals
    [0, 6, 12, 18, 24],
    [4, 8, 12, 16, 20]
  ],

  big: [
    // rows
    [0, 1, 2, 3, 4, 5, 6],
    [7, 8, 9, 10, 11, 12, 13],
    [14, 15, 16, 17, 18, 19, 20],
    [21, 22, 23, 24, 25, 26, 27],
    [28, 29, 30, 31, 32, 33, 34],
    [35, 36, 37, 38, 39, 40, 41],
    [42, 43, 44, 45, 46, 47, 48],

    // columns
    [0, 7, 14, 21, 28, 35, 42],
    [1, 8, 15, 22, 29, 36, 43],
    [2, 9, 16, 23, 30, 37, 44],
    [3, 10, 17, 24, 31, 38, 45],
    [4, 11, 18, 25, 32, 39, 46],
    [5, 12, 19, 26, 33, 40, 47],
    [6, 13, 20, 27, 34, 41, 48],

    // diagonals
    [0, 8, 16, 24, 32, 40, 48],
    [6, 12, 18, 24, 30, 36, 42]
  ]
}
