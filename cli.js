import { optimize, currentPlace, relTime, BODY_TEMP, humanEffect, tile } from 'wetbulb'

const api = (lat, lon) => `https://weather-424404.uc.r.appspot.com/?lat=${lat}&lon=${lon}`
// const api = (lat, lon) => `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=YOUR_API_KEY`

const minLat = 24.396308
const maxLat = 49.384358
const minLon = -125.0
const maxLon = -66.93457

let count = 0
const { worstPlace, worstResult } = await optimize(api,
  data => {
    console.log(++count, currentPlace())
  },
  { minLat, maxLat, minLon, maxLon })

console.log(worstPlace, worstResult)

const when = relTime(worstResult.date)
const wetbulb = Math.round(worstResult.wetbulb)
const sweatability = Math.abs(Math.round(BODY_TEMP - worstResult.wetbulb))
const effect = humanEffect(worstResult.wetbulb)
const humidity = Math.round(worstResult.humidity)
const temp = Math.round(worstResult.temp)
const feelsLike = Math.round(worstResult.feelsLike)
const preposition = wetbulb < BODY_TEMP ? "below" : "above"
const s = sweatability == 1 ? "" : "s"

console.log(`
${when} in ${worstResult.name}, ${worstResult.country}
the wet-bulb temperature will be ${wetbulb}°C

This will be ${sweatability} degree${s} ${preposition} body temperature
which will ${effect}.

The humidity will be ${humidity}%
The actual temperature will be ${temp}°C
It will feel like ${feelsLike}°C

There will will be ${worstResult.weather}

${tile(worstPlace)}
`)
