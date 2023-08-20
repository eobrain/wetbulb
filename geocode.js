const cache = new Map()

const uncached = async ({ lat, lon }) => {
  try {
    const result = await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`)
    const { display_name: displayName } = await result.json()
    return displayName
  } catch (exp) {
    return undefined
  }
}

export default async (location) => {
  const key = JSON.stringify(location)
  if (cache.has(key)) {
    console.log('HIT')
    return cache.get(key)
  }
  console.log('MISS')
  const result = uncached(location)
  cache.set(key, result)
  return result
}
