// queries city-learner-backend

import Axios from "axios"

const osm = Axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL
})

export function getCityBorders(relID) {
  return osm("borders?relID=" + relID)
}

export async function getRoadsInBBox(bbox) {
  const res = await osm.get('roads/bbox', {
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

export async function getRoadsInArea(osmID) {
  const res = await osm.get('roads/area', {
    params: {
      // add 3600000000 to get the area id: https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#By_area_.28area.29
      areaID: osmID + 3600000000
    }
  })

  const result = {}

  res.data.elements.forEach(r => {
    if (!result[r.tags.highway]) result[r.tags.highway] = []
    result[r.tags.highway].push(r)
  })

  return result
}