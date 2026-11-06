// queries city-learner-backend

import Axios from "axios"

const osm = Axios.create({
  baseURL: "http://localhost:3000"
})

export function getCityBorders(name) {
  return osm("borders?name=" + name)
}

export async function getRoads(bbox) {
  const res = await osm.get('roads', {
    params: {
      minlat: bbox[0],
      maxlat: bbox[1],
      minlon: bbox[2],
      maxlon: bbox[3]
    }
  })

  const result = {}

  res.data.elements.forEach(r => {
    if (!result[r.tags.highway]) result[r.tags.highway] = []
    result[r.tags.highway].push(r)
  })

  return result
}
