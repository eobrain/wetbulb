import wetbulb from './wetbulb.js'
import sleep from './sleep.js'

const cached = async (api, { lat, lon }) => {
  const result = await fetch(api(lat, lon))
  return await result.json()
}

export default async (api, { lat, lon }) => {
  const result = await cached(api, { lat, lon })
  const { cod } = result
  const code = Number(cod)
  if (code !== 200) {
    console.log('Error fetching weather data for ', { lat, lon }, result)
    if (code === 429) { // Quota exceeded
      await sleep(10000)
    }
    return { name: undefined }
  }
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
