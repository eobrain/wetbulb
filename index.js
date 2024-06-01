import openweathermap from './openweathermap.js'
import countryNames from './country-names.js'
import { tabu, currentPlace } from './optimize.js'
import { drawDot } from './world.js'

/* global $place $temp $feelsLike $humidity $wetbulb $humanEffect
   $when $weather $googleMap $about */

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

const HOUR = 1000 * 60 * 60

const relTime = date => Math.round((date.valueOf() - Date.now()) / HOUR) + ' hours'

function humanEffect (wetbulb) {
  if (wetbulb < 21) {
    return 'is fine'
  }
  if (wetbulb < 28) {
    return 'is uncomfortable'
  }
  if (wetbulb < 31) {
    return 'has killed tens of thousands in previous heatwaves'
  }
  if (wetbulb < 35) {
    return 'makes it impossible to do physical labor'
  }
  return 'will kill you'
}

async function show ({ name, country, date, weather, description, temp, humidity, feelsLike, wetbulb }) {
  const countryName = countryNames[country] || country
  const place = currentPlace()
  drawDot(place, wetbulb, MIN_WB, MAX_WB)
  $place.innerText = (name || `${place.lat},${place.lon}`) + ', ' + countryName
  $googleMap.href = mapUrl(place)
  $about.href = aboutUrl(name, countryName)
  $when.innerText = relTime(date)
  $weather.innerText = weather
  $temp.innerText = Math.round(temp)
  $feelsLike.innerText = Math.round(feelsLike)
  $humidity.innerText = Math.round(humidity)
  $wetbulb.innerText = Math.round(wetbulb)
  $humanEffect.innerText = humanEffect(wetbulb)
}

while (true) {
  await tabu(get, show)
}
// await anneal(get, show)
