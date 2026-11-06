// queries the OpenStreetMap Overpass API

import Axios from "axios"

// see https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances for other instances if necessary

const osm = Axios.create({
  baseURL: "https://overpass-api.de/api",
  headers: {
    'User-Agent': 'quinnlas/city-learner'
  }
})

// rate limit to 1 Hz
let lastExecution = 0
osm.interceptors.request.use(function (config) {
  const nowMS = Date.now()
  if (nowMS - lastExecution < 1000) {
    throw Error("Attempted to request osm too fast.")
  }
  lastExecution = nowMS
  return config
})

export function getCityBorders(id) {
  return osm.post(
    "/interpreter",
    "data=" +
      encodeURIComponent(`
  [out:json][timeout:25];
  rel(${id});
  out geom;
  `)
  )
}

function processRoad(roadObj) {
  // mutates and returns
  /*
  {
    "type": "way",
    "id": 6020639,
    "bounds": {
      "minlat": {
        "source": "44.9681870",
        "parsedValue": 44.968187
      },
      "minlon": -93.2553634,
      "maxlat": {
        "source": "44.9684220",
        "parsedValue": 44.968422
      },
      "maxlon": -93.2548204
    },
    "nodes": [
      33639864,
      8355194047,
      595907012
    ],
    "geometry": [
      {
        "lat": {
          "source": "44.9684220",
          "parsedValue": 44.968422
        },
        "lon": -93.2553634
      },
      {
        "lat": {
          "source": "44.9683880",
          "parsedValue": 44.968388
        },
        "lon": -93.2552892
      },
      {
        "lat": {
          "source": "44.9681870",
          "parsedValue": 44.968187
        },
        "lon": -93.2548204
      }
    ],
    "tags": {
      "highway": "motorway",
      "lanes": "2",
      "maxspeed": "45 mph",
      "name": "South 8th Street",
      "noref": "yes",
      "oneway": "yes"
    }
  }
  */

  roadObj.bounds.minlat = roadObj.bounds.minlat.parsedValue
  roadObj.bounds.maxlat = roadObj.bounds.maxlat.parsedValue
  roadObj.geometry.forEach(n => n.lat = n.lat.parsedValue)

  // mutates and returns
  return roadObj
}

export async function getRoads(
  id,
  highway_values = [
    "motorway",
    "trunk",
    "primary",
    "secondary",
    "tertiary",
    "unclassified",
  ]
) {
  const streetData = {}

  // separate requests for each type to avoid server overload

  for (let highway_type of highway_values) {
    try {
      await new Promise((rs) => setTimeout(rs, 1000))

      // add 3600000000 to get the area id: https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#By_area_.28area.29
      const res = await osm.post(
        "/interpreter",
        "data=" +
          encodeURIComponent(`
      [timeout:25][out:json];
      area(${id + 3600000000})->.searchArea;
      way["highway"="${highway_type}"](area.searchArea);
      out;
      `)
      )

      // process into a better format
      streetData[highway_type] = res.data.elements.map(processRoad)
    } catch (e) {
      console.error(e)
      console.error(`Failed to get data for highway type ${highway_type}. Other types may succeed.`)
    }
  }

  return streetData
}
