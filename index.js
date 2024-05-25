import openweathermap from './openweathermap.js'
import wetbulb from './wetbulb.js'
// import geocode from './geocode.js'
import { tabu, currentPlace } from './optimize.js'
import { drawDot } from './world.js'

/* global $place $temp $tempF $humidity $guage $sweatability */
const $hygrometer = document.getElementById('hygrometer')
const $thermometer = document.getElementById('thermometer')

const HUMAN_BODY_TEMP_C = 37

const MAX_S = 32
const MIN_S = 0

const uncachedGet = async (location) => {
  // const name = await geocode(location)
  // if (!name) {
  //  return undefined
  // }

  const { name, main } = await openweathermap(location)

  if (name.match(/^[0-9,.-]*$/)) {
    return undefined
  }

  const { temp, humidity } = main

  const wetBulbTempC = wetbulb(temp, humidity)

  const sweatability = HUMAN_BODY_TEMP_C - wetBulbTempC
  return { name, temp, humidity, sweatability }
}

const cache = new Map()
let hitCount = 0
let totalCount = 0

const get = async (location) => {
  if ((totalCount % 100) === 99) {
    console.log(`hit rate ${Math.round(100 * hitCount / totalCount)}`)
  }
  const key = JSON.stringify(location)
  ++totalCount
  if (cache.has(key)) {
    ++hitCount
    return cache.get(key)
  }
  const result = await uncachedGet(location)
  cache.set(key, result)
  return result
}

const mapUrl = ({ lat, lon }) => `https://maps.google.com/?ll=${lat},${lon}&q=${lat},${lon}&z=8`

function guageVariables (sweatability) {
  if (sweatability > MAX_S) {
    sweatability = MAX_S
  }
  if (sweatability < MIN_S) {
    sweatability = MIN_S
  }
  const MAX_DEG = 135
  const MIN_DEG = -135
  const R = 92.5 / 2
  const X0 = 41
  const Y0 = R
  const deg = MIN_DEG + (MAX_DEG - MIN_DEG) * (sweatability - MIN_S) / (MAX_S - MIN_S)
  const x = X0 - R * Math.cos(deg * Math.PI / 180)
  const y = Y0 + R * Math.sin(deg * Math.PI / 180)
  return { deg, x, y }
}

async function show ({ name, temp, humidity, sweatability }) {
  const place = currentPlace()
  drawDot(place, sweatability, MIN_S, MAX_S)
  $place.innerText = name || `${place.lat},${place.lon}`
  $place.href = mapUrl(place)
  $temp.innerText = Math.round(temp)
  $tempF.innerText = Math.round(temp * 9 / 5 + 32)
  $humidity.innerText = Math.round(humidity)
  const { deg, x, y } = guageVariables(sweatability)
  $guage.style.setProperty('--pointerdeg', `${deg}deg`)
  $guage.style.setProperty('--pointertop', `${x}%`)
  $guage.style.setProperty('--pointerleft', `${y}%`)
  $sweatability.innerText = Math.round(sweatability)
  $hygrometer.value = humidity
  $thermometer.value = temp
}

await tabu(get, show)
