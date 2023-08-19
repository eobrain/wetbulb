const APIKEY = '4f1b762e294e38a1cc4d6770caf926dd'

export default async ({ lat, lon }) => {
  const result = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKEY}`)
  return await result.json()
}
