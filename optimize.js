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
let sweatabilityAtPlace

export const currentPlace = () => place

let worstSweatability = 10000
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

const visited = new Set()

async function tabuMove (scale, get, show) {
  let lowestResult = { sweatability: 10000 }
  let lowestPlace

  for (const delta of DELTAS) {
    const latLon = plus(place, delta, scale)
    if (visited.has(JSON.stringify(latLon))) {
      continue
    }
    const result = await get(latLon)
    if (!result) {
      continue
    }
    if (result.sweatability < lowestResult.sweatability) {
      lowestResult = result
      lowestPlace = latLon
    }
  }
  if (!lowestPlace) {
    return false
  }
  if (lowestResult.sweatability < worstSweatability) {
    worstSweatability = lowestResult.sweatability
    worstPlace = lowestPlace
  }
  place.lat = lowestPlace.lat
  place.lon = lowestPlace.lon
  sweatabilityAtPlace = lowestResult.sweatability
  await show(lowestResult)
  visited.add(JSON.stringify(place))
  return true
}

const K = 10

async function randomStart (get, show) {
  let result
  while (!result) {
    place.lat = quantize(Math.random() * 180 - 90)
    place.lon = quantize(Math.random() * 360 - 180)
    result = await get(place)
  }
  sweatabilityAtPlace = result.sweatability
  await show(result)
}

async function moveToWorst (get, show) {
  place.lat = worstPlace.lat
  place.lon = worstPlace.lon
  sweatabilityAtPlace = worstSweatability
  const worstResult = await get(worstPlace)
  await show(worstResult)
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
    moveToWorst(get, show)
  }
}

export async function tabu (get, show) {
  await randomStart(get, show)

  for (let scale = 8192; scale >= 1; scale /= 2) {
    for (let i = 0; i < 100; ++i) {
      // await sleep(1000)
      if (!(await tabuMove(scale, get, show))) {
        break
      }
    }
    moveToWorst(get, show)
  }
}
