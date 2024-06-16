import { optimize, currentPlace } from './optimize.js'
import { relTime, BODY_TEMP, humanEffect, tile } from './display.js'

let count = 0
const { worstPlace, worstResult } = await optimize(data => {
  console.log(++count, currentPlace())
})

console.log(worstPlace, worstResult)

const when = relTime(worstResult.date)
const wetbulb = Math.round(worstResult.wetbulb)
const sweatability = Math.round(BODY_TEMP - worstResult.wetbulb)
const effect = humanEffect(worstResult.wetbulb)
const humidity = Math.round(worstResult.humidity)
const temp = Math.round(worstResult.temp)
const feelsLike = Math.round(worstResult.feelsLike)

console.log(`
${when} in ${worstResult.name}, ${worstResult.country}
the wet-bulb temperature will be ${wetbulb}°C

This will be a margin of ${sweatability} degrees below body temperature
which will ${effect}.

The humidity will be ${humidity}%
The actual temperature will be ${temp}°C
It will feel like ${feelsLike}°C

There will will be ${worstResult.weather}

${tile(worstPlace)}
`)
