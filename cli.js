import { get } from './cached.js'
import { optimize, currentPlace } from './optimize.js'

let count = 0
const { worstPlace, worstResult } = await optimize(get, data => {
  console.log(++count, currentPlace())
})

console.log(worstPlace, worstResult)
