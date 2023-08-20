import openweathermap from './openweathermap.js'
import wetbulb from './wetbulb.js'

/* global $place $temp $humidity $sweatability $here $best $worst $better $worse */

// All temperatures on Celcius

const HUMAN_BODY_TEMP_C = 37
const KM_IN_LAT_DEG = 0.008

// const decimal = (degrees, minutes, seconds) => degrees + minutes / 60 + seconds / 3600
// const FRANZ = { lat: decimal(38, 34, 54), lon: decimal(-122, 36, 36) }

const FRANZ = { lat: 38.581621, lon: -122.609887 }

async function show (latLon) {
  const { main, name } = await openweathermap(latLon)

  const { temp, humidity } = main

  const wetBulbTempC = wetbulb(temp, humidity)

  const sweatability = HUMAN_BODY_TEMP_C - wetBulbTempC

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
    const { latitude: lat, longitude: lon } = coords
    await show({ lat, lon })
  }, async () => {
    await show(FRANZ)
  })
