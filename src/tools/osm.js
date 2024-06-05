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

export function getRoads(
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
    return osm.post(
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
}
