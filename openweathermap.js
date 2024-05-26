import wetbulb from './wetbulb.js'

const cached = async ({ lat, lon }) => {
  // const result = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKEY}`)
  // const result = await fetch(`https://eamonn.org:1443/api?lat=${lat}&lon=${lon}`)
  const result = await fetch(`https://corolla.tailbcc5.ts.net:1443/api?lat=${lat}&lon=${lon}`)
  return await result.json()
}

export default async ({ lat, lon }) => {
  const result = await cached({ lat, lon })
  const forecasts = result.list.map(f => { f.main.wetbulb = wetbulb(f.main.temp, f.main.humidity); return f })
  const worstForecast = forecasts.reduce((worstF, f) =>
    worstF.main.wetbulb > f.main.wetbulb ? worstF : f)
  const name = result.city.name
  const population = result.city.population
  const date = new Date(worstForecast.dt * 1000)
  const weather = worstForecast.weather[0].description
  const description = `${result.city.country} ${worstForecast.dt_txt} ${weather}`
  const main = worstForecast.main
  const country = result.city.country
  return { name, country, date, weather, population, description, main }
}
