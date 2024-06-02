import openweathermap from './openweathermap.js'
import countryNames from './country-names.js'
import { tabu, currentPlace } from './optimize.js'
import { drawDot } from './world.js'

/* global $place $temp $tempF $feelsLike $feelsLikeF
   $humidity $wetbulb $wetbulbF $humanEffect
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

const farenheit = (celsius) => celsius * 9 / 5 + 32

const HOUR = 1000 * 60 * 60

const relTime = date => {
  const hours = Math.round((date.valueOf() - Date.now()) / HOUR)
  return (hours > 1) ? `${hours} hours from now` : 'About now'
}

function humanEffect (wetbulb) {
  if (wetbulb < 21) {
    return 'be fine'
  }
  if (wetbulb < 28) {
    return 'be uncomfortable'
  }
  if (wetbulb < 31) {
    return 'kill vulnerable people who are unprotected'
  }
  if (wetbulb < 35) {
    return 'make it impossible to do physical labor'
  }
  return 'kill everyone who is not protected'
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
  $humidity.innerText = Math.round(humidity)
  $humanEffect.innerText = humanEffect(wetbulb)

  $temp.innerText = Math.round(temp)
  $tempF.innerText = Math.round(farenheit(temp))

  $feelsLike.innerText = Math.round(feelsLike)
  $feelsLikeF.innerText = Math.round(farenheit(feelsLike))

  $wetbulb.innerText = Math.round(wetbulb)
  $wetbulbF.innerText = Math.round(farenheit(wetbulb))
}

while (true) {
  await tabu(get, show)
}
// await anneal(get, show)
