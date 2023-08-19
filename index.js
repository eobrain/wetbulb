import openweathermap from './openweathermap.js'
import wetbulb from './wetbulb.js'

const decimal = (degrees, minutes, seconds) => degrees + minutes / 60 + seconds / 3600

const FRANZ = { lat: decimal(38, 34, 54), lon: decimal(-122, 36, 36) }

const { main, name } = await openweathermap(FRANZ)

const { temp, humidity } = main

console.log(name, temp, humidity, wetbulb(temp, humidity))
