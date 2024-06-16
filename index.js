import { setData, showData } from './view.js'
import { get } from './cached.js'
import { optimize, currentPlace } from './optimize.js'

async function show (data) {
  setData(data)
  showData(currentPlace())
}

while (true) {
  await optimize(get, show)
}
