import openweathermap from './openweathermap.js'
import { tabu, currentPlace } from './optimize.js'
import { drawDot } from './world.js'

/* global $place $temp $feelsLike $humidity $wetbulb $when $weather $map $about */

const MAX_WB = 37
const MIN_WB = 5

const uncachedGet = async (location) => {
  const { name, country, date, weather, population, description, main } = await openweathermap(location)

  if (!name || population === 0) {
    return undefined
  }
  // if (name.match(/^[0-9,.-]*$/)) {
  //  return undefined
  // }

  const { temp, humidity, feels_like: feelsLike, wetbulb } = main

  return { name, country, date, weather, description, temp, humidity, feelsLike, wetbulb }
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

const mapUrl = ({ lat, lon }) =>
 `https://maps.google.com/?ll=${lat},${lon}&q=${lat},${lon}&z=8`
const aboutUrl = (name, country) =>
 `https://www.google.com/search?q=%22${encodeURIComponent(name)}%22+${encodeURIComponent(country)}+excessive+heat`

// const farenheit = (celsius) => celsius * 9 / 5 + 32

async function show ({ name, country, date, weather, description, temp, humidity, feelsLike, wetbulb }) {
  const place = currentPlace()
  drawDot(place, wetbulb, MIN_WB, MAX_WB)
  $place.innerText = (name || `${place.lat},${place.lon}`) + ', ' + country
  $map.href = mapUrl(place)
  $about.href = aboutUrl(name, country)
  $when.innerText = date.toDateString()
  $weather.innerText = weather
  $temp.innerText = Math.round(temp)
  $feelsLike.innerText = Math.round(feelsLike)
  $humidity.innerText = Math.round(humidity)
  $wetbulb.innerText = Math.round(wetbulb)
}

await tabu(get, show)
// await anneal(get, show)
