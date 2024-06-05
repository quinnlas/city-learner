// queries the OpenStreetMap Overpass API

import Axios from "axios"

const osm = Axios.create({
    baseURL: "https://overpass-api.de/api",
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
  [out:json][timeout:900];
  rel(${id});
  out geom;
  `)
    )
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
    // add 3600000000 to get the area id: https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL#By_area_.28area.29
    const res = await osm.post(
        "/interpreter",
        "data=" +
            encodeURIComponent(`
  [timeout:900][maxsize:1073741824][out:json];
  area(${id + 3600000000});
  (._; )->.area;
  ${highway_values
      .map((hv) => `(way[highway=${hv}](area.area); node(w););\nout skel;`)
      .join("\n")}
  `)
    )

    // the streets data is an array with a bunch of nodes and ways:
    // we want to process this efficiently before sending it to another component
    // by putting the nodes into an object for O(1) lookups
    /*
    [
        {
            "type": "way",
            "id": 1289153991,
            "nodes": [
                7949762772,
                11954064929
            ]
        },
        {
            "type": "node",
            "id": 7949762772,
            "lat": 44.9360219,
            "lon": -93.2739399
        },
        {
            "type": "node",
            "id": 11954064929,
            "lat": 44.9360029,
            "lon": -93.2739607
        }
    ]
    */
    const streetData = res.data.elements
    const ways = []
    const nodes = {}

    while (streetData.length) {
        const current = streetData.pop()
        if (current.type == "node") {
            nodes[current.id] = current
        } else if (current.type == "way") {
            ways.push(current)
        }
    }

    return { ways, nodes }
}
