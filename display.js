const HOUR = 1000 * 60 * 60

export const relTime = date => {
  const hours = Math.round((date.valueOf() - Date.now()) / HOUR)
  return (hours > 1) ? `${hours} hours from now` : 'About now'
}

export const BODY_TEMP = 36.9

export function humanEffect (wetbulb) {
  if (wetbulb < 21) {
    return 'be OK'
  }
  if (wetbulb < 28) {
    return 'be uncomfortable'
  }
  if (wetbulb < 31) {
    return 'kill vulnerable people'
  }
  if (wetbulb < 35) {
    return 'kill vulnerable people and make it impossible to do physical labor'
  }
  return 'kill everyone who is not protected'
}
