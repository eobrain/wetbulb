import sleep from './sleep.js'

const randomElement = array => array[Math.floor(Math.random() * array.length)]

const KM_IN_LAT_DEG = 0.008
const D = KM_IN_LAT_DEG
const DSIN = D * Math.sqrt(3) / 2
const DCOS = D / 2
const DELTAS = [
  [-DSIN, -DCOS], [-DSIN, DCOS],
  [0, -D], /* [0,0] */[0, D],
  [DSIN, -DCOS], [DSIN, DCOS]
]

// Corresponds to about 1 km at the equator
const quantize = degree => Math.round(degree / KM_IN_LAT_DEG) * KM_IN_LAT_DEG

const latMod = lon => lon > 90 ? lon - 180 : (lon < -90 ? lon + 180 : lon)
const lonMod = lon => lon > 180 ? lon - 360 : (lon < -180 ? lon + 360 : lon)

const place = {}
let wetbulbAtPlace

export const currentPlace = () => place

let worstWetbulb = -10000
let worstPlace = null

const plus = (ll, delta, scale) => {
  const [dLat, dLon] = delta
  return {
    lat: quantize(latMod(ll.lat + dLat * scale)),
    lon: quantize(lonMod(ll.lon + dLon * scale))
  }
}

async function annealMove (annealT, scale, get, show) {
  const latLon = plus(place, randomElement(DELTAS), scale)

  const result = await get(latLon)
  if (!result) {
    return false
  }
  if (result.wetbulb > worstWetbulb) {
    worstWetbulb = result.wetbulb
    worstPlace = latLon
  }
  const dImprovement = result.wetbulb - wetbulbAtPlace
  const accept = Math.exp(dImprovement / annealT) > Math.random()
  if (accept) {
    place.lat = latLon.lat
    place.lon = latLon.lon
    wetbulbAtPlace = result.wetbulb
    await show(result)
    return true
  }
  return false
}

const visited = new Set()

async function tabuMove (scale, get, show) {
  let highestResult = { wetbulb: -10000 }
  let highestPlace

  for (const delta of DELTAS) {
    const latLon = plus(place, delta, scale)
    if (visited.has(JSON.stringify(latLon))) {
      continue
    }
    const result = await get(latLon)
    if (!result) {
      continue
    }
    if (result.wetbulb > highestResult.wetbulb) {
      highestResult = result
      highestPlace = latLon
    }
  }
  if (!highestPlace) {
    return false
  }
  if (highestResult.wetbulb > worstWetbulb) {
    worstWetbulb = highestResult.wetbulb
    worstPlace = highestPlace
    await show(highestResult)
  }
  place.lat = highestPlace.lat
  place.lon = highestPlace.lon
  wetbulbAtPlace = highestResult.wetbulb
  visited.add(JSON.stringify(place))
  return true
}

const K = 10
const START_QUANTIZATION_DEG = 20
const startQuantization = degree =>
  START_QUANTIZATION_DEG * Math.round(degree / START_QUANTIZATION_DEG)

async function randomStart (get, show) {
  let result
  while (!result) {
    place.lat = startQuantization(Math.random() * 180 - 90)
    place.lon = startQuantization(Math.random() * 360 - 180)
    result = await get(place)
  }
  wetbulbAtPlace = result.wetbulb
  await show(result)
}

async function moveToWorst (get, show) {
  if (!worstPlace) {
    await sleep(1000)
    return
  }
  place.lat = worstPlace.lat
  place.lon = worstPlace.lon
  wetbulbAtPlace = worstWetbulb
  const worstResult = await get(worstPlace)
  await show(worstResult)
}

export async function anneal (get, show) {
  await randomStart(get, show)

  for (let scale = 16384; scale >= 1; scale /= 2) {
    for (let annealT = 10; ; annealT *= 0.99) {
      let anyAccept = false
      for (let i = 0; i < K; ++i) {
        anyAccept = anyAccept || await annealMove(annealT, scale, get, show)
        // await sleep(100)
      }
      if (!anyAccept) {
        break
      }
    }
    moveToWorst(get, show)
  }
}

export async function tabu (get, show) {
  await randomStart(get, show)

  for (let scale = 16384; scale >= 1; scale /= 2) {
    for (let i = 0; i < 100; ++i) {
      // await sleep(1000)
      if (!(await tabuMove(scale, get, show))) {
        break
      }
    }
    moveToWorst(get, show)
    await sleep(10000)
  }
}
