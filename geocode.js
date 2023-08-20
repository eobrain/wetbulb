export default async ({ lat, lon }) => {
  try {
    const result = await fetch(`https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`)
    const { display_name: displayName } = await result.json()
    return displayName
  } catch (exp) {
    return undefined
  }
}
