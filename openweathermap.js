import wetbulb from './wetbulb.js'

const cached = async ({ lat, lon }) => {
  // const result = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKEY}`)
  const result = await fetch(`https://eamonn.org:1443/api?lat=${lat}&lon=${lon}`)
  return await result.json()
}

export default async ({ lat, lon }) => {
  const result = await cached({ lat, lon })
  const forecasts = result.list.map(f => { f.main.wetbulb = wetbulb(f.main.temp, f.main.humidity); return f })
  const worstForecast = forecasts.reduce((worstF, f) =>
    worstF.main.wetbulb > f.main.wetbulb ? worstF : f)
  const name = result.city.name
  const population = result.city.population
  const description = `${result.city.country} ${worstForecast.dt_txt} ${worstForecast.weather[0].description}`
  const main = worstForecast.main
  return { name, population, description, main }
}
