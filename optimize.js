const randomElement = array => array[Math.floor(Math.random() * array.length)]

const KM_IN_LAT_DEG = 0.008
const D = KM_IN_LAT_DEG
const DELTAS = [
  [-D, -D], [-D, 0], [-D, D],
  [0, -D], [0, D],
  [D, -D], [D, 0], [D, D]
]

const latMod = lon => lon > 90 ? lon - 180 : (lon < -90 ? lon + 180 : lon)
const lonMod = lon => lon > 180 ? lon - 360 : (lon < -180 ? lon + 360 : lon)

const place = {}
let sweatabilityAtPlace

export const currentPlace = () => place

let worstSweatability = 10000
let worstPlace = null

async function annealMove (annealT, scale, get, show) {
  const delta = randomElement(DELTAS)
  const [dLat, dLon] = delta
  const latLon = {
    lat: latMod(place.lat + dLat * scale),
    lon: lonMod(place.lon + dLon * scale)
  }

  const result = await get(latLon)
  if (!result) {
    return false
  }
  if (result.sweatability < worstSweatability) {
    worstSweatability = result.sweatability
    worstPlace = latLon
  }
  const dImprovement = sweatabilityAtPlace - result.sweatability
  const accept = Math.exp(dImprovement / annealT) > Math.random()
  if (accept) {
    place.lat = latLon.lat
    place.lon = latLon.lon
    sweatabilityAtPlace = result.sweatability
    await show(result)
    return true
  }
  return false
}

const sleep = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs))

const K = 10

async function randomStart (get, show) {
  let result
  while (!result) {
    place.lat = Math.random() * 180 - 90
    place.lon = Math.random() * 360 - 180
    result = await get(place)
  }
  sweatabilityAtPlace = result.sweatability
  await show(result)
}

export async function anneal (get, show) {
  await randomStart(get, show)

  for (let scale = 8192; scale >= 1; scale /= 2) {
    for (let annealT = 1; ; annealT *= 0.99) {
      let anyAccept = false
      for (let i = 0; i < K; ++i) {
        anyAccept = anyAccept || await annealMove(annealT, scale, get, show)
        await sleep(100)
      }
      if (!anyAccept) {
        break
      }
    }
    place.lat = worstPlace.lat
    place.lon = worstPlace.lon
    sweatabilityAtPlace = worstSweatability
    const worstResult = await get(worstPlace)
    await show(worstResult)
  }
}
