import openweathermap from './openweathermap.js'
import wetbulb from './wetbulb.js'

/* global $place $temp $tempF $humidity $sweatability $here $best $worst $better $worse */

// All temperatures on Celcius

const HUMAN_BODY_TEMP_C = 37
const KM_IN_LAT_DEG = 0.008

// const decimal = (degrees, minutes, seconds) => degrees + minutes / 60 + seconds / 3600
// const FRANZ = { lat: decimal(38, 34, 54), lon: decimal(-122, 36, 36) }

// const FRANZ = { lat: 38.581621, lon: -122.609887 }

const place = {}
let sweatabilityAtPlace

const uncachedGet = async (location) => {
  const { main, name } = await openweathermap(location)

  const { temp, humidity } = main

  const wetBulbTempC = wetbulb(temp, humidity)

  const sweatability = HUMAN_BODY_TEMP_C - wetBulbTempC
  return { name, temp, humidity, sweatability }
}

const cache = new Map()
let hitCount = 0
let totalCount = 0

const get = async (location) => {
  const key = JSON.stringify(location)
  ++totalCount
  if (cache.has(key)) {
    ++hitCount
    console.log(`hit rate ${Math.round(100 * hitCount / totalCount)}`)
    return cache.get(key)
  }
  const result = await uncachedGet(location)
  cache.set(key, result)
  console.log(`hit rate ${Math.round(100 * hitCount / totalCount)}`)
  return result
}

async function show ({ name, temp, humidity, sweatability }) {
  $place.innerText = name || `${place.lat},${place.lon}`
  $place.href = `https://maps.google.com/?ll=${place.lat},${place.lon}&q=${place.lat},${place.lon}&z=12`
  $temp.innerText = Math.round(temp)
  $tempF.innerText = Math.round(temp * 9 / 5 + 32)
  $humidity.innerText = Math.round(humidity)
  $sweatability.innerText = Math.round(sweatability)
  $better.disabled = false
  $worse.disabled = false
}

$here.onclick = () =>
  navigator.geolocation.getCurrentPosition(async (position) => {
    const { coords } = position
    const { latitude, longitude } = coords
    place.lat = latitude
    place.lon = longitude
    const { name, temp, humidity, sweatability } = await get(place)
    sweatabilityAtPlace = sweatability
    await show({ name, temp, humidity, sweatability })
  }, async (error) => {
    throw new Error(error)
  })

const D = 5 * KM_IN_LAT_DEG
const DELTAS = [
  [-D, -D], [-D, 0], [-D, D],
  [0, -D], [0, D],
  [D, -D], [D, 0], [D, D]
]
async function hillclimbMove (up) {
  let optimalLatLon = place
  let optimalSweatability = sweatabilityAtPlace
  let optimalResult
  for (const delta of DELTAS) {
    const [dLat, dLon] = delta
    const latLon = { lat: place.lat + dLat, lon: place.lon + dLon }
    const result = await get(latLon)
    const dSweatability = result.sweatability - optimalSweatability
    const dImprovement = up ? -dSweatability : dSweatability
    const accept = dImprovement > 0
    if (accept) {
      optimalLatLon = latLon
      optimalSweatability = result.sweatability
      optimalResult = result
    }
  }
  if (optimalResult) {
    place.lat = optimalLatLon.lat
    place.lon = optimalLatLon.lon
    sweatabilityAtPlace = optimalSweatability
    await show(optimalResult)
    return true
  }
  return false
}
async function annealMove (up, annealT) {
  const latLon = { lat: Math.random() * 180 - 90, lon: Math.random() * 360 - 180 }
  const result = await get(latLon)
  const dSweatability = result.sweatability - sweatabilityAtPlace
  const dImprovement = up ? -dSweatability : dSweatability
  const accept = Math.exp(dImprovement / annealT) > Math.random()
  if (accept) {
    place.lat = latLon.lat
    place.lon = latLon.lon
    sweatabilityAtPlace = result.sweatability
    await show(result)
    return true
  }
  return false
}

const sleep = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs))

async function hillClimb (up) {
  $here.disabled = true
  $best.disabled = true
  $worst.disabled = true
  $better.disabled = true
  $worse.disabled = true
  while (await hillclimbMove(up)) {
    await sleep(4000)
  }
  $here.disabled = false
  $best.disabled = false
  $worst.disabled = false
  $better.disabled = false
  $worse.disabled = false
}

async function anneal (up) {
  place.lat = Math.random() * 180 - 90
  place.lon = Math.random() * 360 - 180
  const result = await get(place)
  sweatabilityAtPlace = result.sweatability
  await show(result)

  $here.disabled = true
  $best.disabled = true
  $worst.disabled = true
  $better.disabled = true
  $worse.disabled = true
  for (let annealT = 5; annealT > 0.01; annealT *= 0.98) {
    console.log({ annealT })
    await annealMove(up, annealT)
    await sleep(1000)
  }
  $here.disabled = false
  $best.disabled = false
  $worst.disabled = false
  $better.disabled = false
  $worse.disabled = false
}

$worst.onclick = () => anneal(true)
$best.onclick = () => anneal(false)
$worse.onclick = () => hillClimb(true)
$better.onclick = () => hillClimb(false)
