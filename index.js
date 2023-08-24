import openweathermap from './openweathermap.js'
import wetbulb from './wetbulb.js'
import geocode from './geocode.js'
import { anneal, currentPlace } from './optimize.js'

/* global ol $place $temp $tempF $humidity $guage $sweatability  $worst */
const $hygrometer = document.getElementById('hygrometer')
const $thermometer = document.getElementById('thermometer')

const HUMAN_BODY_TEMP_C = 37

const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM()
    })
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-75, 35]),
    zoom: 2
  })
})

const MAX_S = 32
const MIN_S = 0

const hexByte = n => ('00' + n.toString(16).toUpperCase()).slice(-2)

const color = sweatability => {
  let twiceByte = Math.trunc(0x200 * (sweatability - MIN_S) / (MAX_S - MIN_S))
  if (twiceByte < 0) {
    twiceByte = 0
  }
  if (twiceByte > 0x1FF) {
    twiceByte = 0x1FF
  }
  let red = 0xFF
  let green = 0xFF
  if (twiceByte <= 0xFF) {
    green = twiceByte
  } else {
    red = 0x200 - twiceByte
  }
  return '#' + hexByte(red) + hexByte(green) + '00'
}

function drawDot ({ lat, lon }, sweatability) {
  const features = []
  features.push(new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([
      lon, lat
    ]))
  }))
  // create the source and layer for random features
  const vectorSource = new ol.source.Vector({
    features
  })
  const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
    style: new ol.style.Style({
      image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({ color: color(sweatability) })
      })
    })
  })
  map.addLayer(vectorLayer)
}

const uncachedGet = async (location) => {
  const name = await geocode(location)
  if (!name) {
    return undefined
  }

  const { main } = await openweathermap(location)

  const { temp, humidity } = main

  const wetBulbTempC = wetbulb(temp, humidity)

  const sweatability = HUMAN_BODY_TEMP_C - wetBulbTempC
  return { name, temp, humidity, sweatability }
}

const cache = new Map()
let hitCount = 0
let totalCount = 0

const get = async (location) => {
  if ((totalCount % 100) === 99) {
    console.log(`hit rate ${Math.round(100 * hitCount / totalCount)}`)
  }
  const key = JSON.stringify(location)
  ++totalCount
  if (cache.has(key)) {
    ++hitCount
    return cache.get(key)
  }
  const result = await uncachedGet(location)
  cache.set(key, result)
  return result
}

const mapUrl = ({ lat, lon }) => `https://maps.google.com/?ll=${lat},${lon}&q=${lat},${lon}&z=8`

function guageVariables (sweatability) {
  if (sweatability > MAX_S) {
    sweatability = MAX_S
  }
  if (sweatability < MIN_S) {
    sweatability = MIN_S
  }
  const MAX_DEG = 135
  const MIN_DEG = -135
  const R = 92.5 / 2
  const X0 = 41
  const Y0 = R
  const deg = MIN_DEG + (MAX_DEG - MIN_DEG) * (sweatability - MIN_S) / (MAX_S - MIN_S)
  const x = X0 - R * Math.cos(deg * Math.PI / 180)
  const y = Y0 + R * Math.sin(deg * Math.PI / 180)
  return { deg, x, y }
}

async function show ({ name, temp, humidity, sweatability }) {
  const place = currentPlace()
  drawDot(place, sweatability)
  $place.innerText = name || `${place.lat},${place.lon}`
  $place.href = mapUrl(place)
  $temp.innerText = Math.round(temp)
  $tempF.innerText = Math.round(temp * 9 / 5 + 32)
  $humidity.innerText = Math.round(humidity)
  const { deg, x, y } = guageVariables(sweatability)
  $guage.style.setProperty('--pointerdeg', `${deg}deg`)
  $guage.style.setProperty('--pointertop', `${x}%`)
  $guage.style.setProperty('--pointerleft', `${y}%`)
  $sweatability.innerText = Math.round(sweatability)
  $hygrometer.value = humidity
  $thermometer.value = temp
}

$worst.onclick = () => {
  $worst.disabled = true
  anneal(get, show)
  $worst.disabled = false
}
