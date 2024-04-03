// queries the OpenStreetMap Overpass API

import Axios from 'axios'

const osm = Axios.create({
  baseURL: "https://overpass-api.de/api"
})

// rate limit to 1 Hz
let lastExecution = 0
osm.interceptors.request.use(function (config) {
  const nowMS = Date.now()
  if (nowMS - lastExecution < 1000) {
    throw Error('Attempted to request osm too fast.')
  }
  lastExecution = nowMS
  return config
})

export function getCityBorders(id) {
  return osm.post("/interpreter", "data=" + encodeURIComponent(`
  [out:json][timeout:25];
  rel(${id});
  out geom;
  `))
}