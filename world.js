/* global ol */

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

const hexByte = n => ('00' + n.toString(16).toUpperCase()).slice(-2)

const color = (sweatability, minS, maxS) => {
  let twiceByte = Math.trunc(0x200 * (sweatability - minS) / (maxS - minS))
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

const features = []

let vectorLayer

export function drawDot ({ lat, lon }, sweatability, minS, maxS) {
  const feature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([
      lon, lat
    ]))
  })
  const marker = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([
      lon, lat
    ]))
  })
  feature.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      radius: 10,
      fill: new ol.style.Fill({ color: color(sweatability, minS, maxS) })
    })
  }))
  marker.setStyle(new ol.style.Style({
    image: new ol.style.Circle({
      radius: 12,
      stroke: new ol.style.Stroke({ color: [0,0,255] })
    })
  }))
  features.pop()
  features.push(feature)
  features.push(marker)
  const source = new ol.source.Vector({
    features
  })
  if (vectorLayer) {
    map.removeLayer(vectorLayer)
  }
  vectorLayer = new ol.layer.Vector({ source })
  map.addLayer(vectorLayer)
}
