import openweathermap from './openweathermap.js'
import { tabu, currentPlace } from './optimize.js'
import { drawDot } from './world.js'

/* global $place $temp $tempF $humidity $guage $wetbulb */

const MAX_WB = 37
const MIN_WB = 5

const uncachedGet = async (location) => {
  const { name, population, description, main } = await openweathermap(location)

  if (!name || population === 0) {
    return undefined
  }
  // if (name.match(/^[0-9,.-]*$/)) {
  //  return undefined
  // }

  const { temp, humidity, wetbulb } = main

  return { name, description, temp, humidity, wetbulb }
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

function guageVariables (wetbulb) {
  if (wetbulb > MAX_WB) {
    wetbulb = MAX_WB
  }
  if (wetbulb < MIN_WB) {
    wetbulb = MIN_WB
  }
  const MAX_DEG = 135
  const MIN_DEG = -135
  const R = 92.5 / 2
  const X0 = 41
  const Y0 = R
  const deg = MIN_DEG + (MAX_DEG - MIN_DEG) * (wetbulb - MIN_WB) / (MAX_WB - MIN_WB)
  const x = X0 - R * Math.cos(deg * Math.PI / 180)
  const y = Y0 + R * Math.sin(deg * Math.PI / 180)
  return { deg, x, y }
}

async function show ({ name, description, temp, humidity, wetbulb }) {
  const place = currentPlace()
  drawDot(place, wetbulb, MIN_WB, MAX_WB)
  $place.innerText = (name || `${place.lat},${place.lon}`) + ' ' + description
  $place.href = mapUrl(place)
  $temp.innerText = Math.round(temp)
  $tempF.innerText = Math.round(temp * 9 / 5 + 32)
  $humidity.innerText = Math.round(humidity)
  const { deg, x, y } = guageVariables(wetbulb)
  $guage.style.setProperty('--pointerdeg', `${deg}deg`)
  $guage.style.setProperty('--pointertop', `${x}%`)
  $guage.style.setProperty('--pointerleft', `${y}%`)
  $wetbulb.innerText = Math.round(wetbulb)
}

await tabu(get, show)
// await anneal(get, show)
