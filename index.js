import { setData, showData } from './view.js'
import { optimize, currentPlace } from './optimize.js'

const sleep = (delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs))

async function show (data) {
  setData(data)
  showData(currentPlace())
}

while (true) {
  await optimize(show)
  await sleep(60 * 60 * 1000)
}
