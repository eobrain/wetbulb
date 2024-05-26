import wetbulb from './wetbulb.js'

const cached = async ({ lat, lon }) => {
  // const result = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKEY}`)
  const result = await fetch(`https://eamonn.org:1443/api?lat=${lat}&lon=${lon}`)
  return await result.json()
}

export default async ({ lat, lon }) => {
  const result = await cached({ lat, lon })
  const name = result.city.name
  const description = `${result.city.country} population ${result.city.population}`
  const main = result.list[0].main
  main.wetBulbTemp = wetbulb(main.temp, main.humidity)
  return { name, description, main }
}
