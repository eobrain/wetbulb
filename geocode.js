const cache = new Map()

const sleep = ms => new Promise(r => setTimeout(r, ms))

const uncached = async ({ lat, lon }) => {
  try {
    const result = await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}&api_key=6640557992233270780261vlg1a4926`)
    const { display_name: displayName } = await result.json()
    await sleep(5000) // rate limit is 1 request/sec
    return displayName
  } catch (exp) {
    return undefined
  }
}

export default async (location) => {
  const key = JSON.stringify(location)
  if (cache.has(key)) {
    return cache.get(key)
  }
  const result = uncached(location)
  cache.set(key, result)
  return result
}
