// const APIKEY = '4f1b762e294e38a1cc4d6770caf926dd'

const cached = async ({ lat, lon }) => {
  // const result = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${APIKEY}`)
  const result = await fetch(`https://eamonn.org:1443/api?lat=${lat}&lon=${lon}`)
  return await result.json()
}

export default async ({ lat, lon }) => {
  const result = await cached({ lat, lon })
  return { name: result.city.name, main: result.list[0].main }
}
