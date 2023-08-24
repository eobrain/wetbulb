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

export function drawDot ({ lat, lon }, sweatability, minS, maxS) {
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
        fill: new ol.style.Fill({ color: color(sweatability, minS, maxS) })
      })
    })
  })
  map.addLayer(vectorLayer)
}
