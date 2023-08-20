import openweathermap from './openweathermap.js'
import wetbulb from './wetbulb.js'

/* global $place $temp $humidity $sweatability $here $best $worst $better $worse */

// All temperatures on Celcius

const HUMAN_BODY_TEMP_C = 37
const KM_IN_LAT_DEG = 0.008

// const decimal = (degrees, minutes, seconds) => degrees + minutes / 60 + seconds / 3600
// const FRANZ = { lat: decimal(38, 34, 54), lon: decimal(-122, 36, 36) }

// const FRANZ = { lat: 38.581621, lon: -122.609887 }

const place = {}
let sweatabilityAtPlace

const get = async (location) => {
  const { main, name } = await openweathermap(location)

  const { temp, humidity } = main

  const wetBulbTempC = wetbulb(temp, humidity)

  const sweatability = HUMAN_BODY_TEMP_C - wetBulbTempC
  return { name, temp, humidity, sweatability }
}

async function show ({ name, temp, humidity, sweatability }) {
  $place.innerText = name
  $temp.innerText = Math.round(temp)
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
const DELTAS = [[-D, 0], [D, 0], [0, -D], [0, D]]
async function move (up) {
  let optimalLatLon = place
  let optimalSweatability = sweatabilityAtPlace
  let optimalResult
  for (const delta of DELTAS) {
    const [dLat, dLon] = delta
    const latLon = { lat: place.lat + dLat, lon: place.lon + dLon }
    const result = await get(latLon)
    const accept = !!((result.sweatability > optimalSweatability) ^ up)
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

const sleep = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs))

async function hillClimb (up) {
  $here.disabled = true
  $best.disabled = true
  $worst.disabled = true
  $better.disabled = true
  $worse.disabled = true
  while (await move(up)) {
    await sleep(4000)
  }
  $here.disabled = false
  $best.disabled = false
  $worst.disabled = false
  $better.disabled = false
  $worse.disabled = false
}

$worse.onclick = () => hillClimb(true)
$better.onclick = () => hillClimb(false)
