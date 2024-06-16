import { drawDot } from './world.js'

/* global $place $units
   $temp $feelsLike $wetbulb $bodyTemp
   $sweatability
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

const relTime = date => {
  const hours = Math.round((date.valueOf() - Date.now()) / HOUR)
  return (hours > 1) ? `${hours} hours from now` : 'About now'
}

function humanEffect (wetbulb) {
  if (wetbulb < 21) {
    return 'be OK'
  }
  if (wetbulb < 28) {
    return 'be uncomfortable'
  }
  if (wetbulb < 31) {
    return 'kill vulnerable people'
  }
  if (wetbulb < 35) {
    return 'kill vulnerable people and make it impossible to do physical labor'
  }
  return 'kill everyone who is not protected'
}

const mapUrl = ({ lat, lon }) =>
    `https://maps.google.com/?ll=${lat},${lon}&q=${lat},${lon}&z=8`
const aboutUrl = (name, country) =>
    `https://www.google.com/search?q=%22${encodeURIComponent(name)}%22+${encodeURIComponent(country)}+excessive+heat`

const HOUR = 1000 * 60 * 60

let theData = {}

export function setData (data) {
  theData = data
}

const BODY_TEMP = 36.9

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

  showTemperatures()
  drawDot(place, wetbulb, MIN_WB, MAX_WB)
}
