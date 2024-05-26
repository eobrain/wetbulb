import wetbulb from './wetbulb.js'

const cached = async ({ lat, lon }) => {
  // const result = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKEY}`)
  const result = await fetch(`https://eamonn.org:1443/api?lat=${lat}&lon=${lon}`)
  return await result.json()
}

export default async ({ lat, lon }) => {
  const result = await cached({ lat, lon })
  const name = result.city.name
  const population = result.city.population
  const description = `${result.city.country} ${result.list[0].dt_txt} ${result.list[0].weather[0].description}`
  const main = result.list[0].main
  main.wetbulb = wetbulb(main.temp, main.humidity)
  return { name, population, description, main }
}
