import { setData, showData } from './view.js'
import { optimize, currentPlace } from 'https://unpkg.com/wetbulb'

async function show (data) {
  setData(data)
  showData(currentPlace())
}

await optimize(
  (lat, lon) => `https://weather-424404.uc.r.appspot.com/?lat=${lat}&lon=${lon}`,
  show)
