import { setData, showData } from './view.js'
import { optimize, currentPlace } from './heat-wave.js'

const sleep = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs))

async function show (data) {
  setData(data)
  showData(currentPlace())
}

while (true) {
  await optimize(
    (lat, lon) => `https://weather-424404.uc.r.appspot.com/?lat=${lat}&lon=${lon}`,
    show)
  await sleep(60 * 60 * 1000)
}
