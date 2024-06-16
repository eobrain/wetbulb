import { drawDot } from './world.js'
import { relTime, BODY_TEMP, humanEffect, tile } from './display.js'

/* global $place $units
   $temp $feelsLike $wetbulb $bodyTemp
   $sweatability
   $tile
   $humidity  $humanEffect
   $when $weather $googleMap $about */

const MAX_WB = 37
const MIN_WB = 5

const farenheit = (celsius) => celsius * 9 / 5 + 32
const celsius = (celsius) => celsius

let units = celsius

$units.onclick = () => {
  if ($units.value === 'F') {
    units = farenheit
  } else if ($units.value === 'C') {
    units = celsius
  }
  showTemperatures()
}

const mapUrl = ({ lat, lon }) =>
    `https://maps.google.com/?ll=${lat},${lon}&q=${lat},${lon}&z=8`
const aboutUrl = (name, country) =>
    `https://www.google.com/search?q=%22${encodeURIComponent(name)}%22+${encodeURIComponent(country)}+excessive+heat`

let theData = {}

export function setData (data) {
  theData = data
}

function showTemperatures () {
  const { temp, feelsLike, wetbulb } = theData
  $temp.innerText = Math.round(units(temp))
  $feelsLike.innerText = Math.round(units(feelsLike))
  $wetbulb.innerText = Math.round(units(wetbulb))
  $sweatability.innerText = Math.round(units(BODY_TEMP) - units(wetbulb))
  $bodyTemp.innerText = Math.round(units(BODY_TEMP))
  document.querySelectorAll('.unit').forEach(($span) => {
    $span.innerText = $units.value
  })
}

export function showData (place) {
  const { name, country, date, weather, humidity, wetbulb } = theData
  $place.innerText = (name || `${place.lat},${place.lon}`) + ', ' + country
  $googleMap.href = mapUrl(place)
  $about.href = aboutUrl(name, country)
  $when.innerText = relTime(date)
  $weather.innerText = weather
  $humidity.innerText = Math.round(humidity)
  $humanEffect.innerText = humanEffect(wetbulb)
  $tile.src = tile(place)

  showTemperatures()
  drawDot(place, wetbulb, MIN_WB, MAX_WB)
}
