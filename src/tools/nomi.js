// http requests for Nominatim, which is used to determine exact place names etc:
// https://nominatim.org/release-docs/develop/api/Overview/

// autocomplete searching is not allowed, a different "geocoding" service would need to be used:
// https://operations.osmfoundation.org/policies/nominatim/

import Axios from "axios"

const nomi = Axios.create({
    baseURL: "https://nominatim.openstreetmap.org",
    params: {
        format: "json",
    },
})

// rate limit to 1 Hz
let lastExecution = 0
nomi.interceptors.request.use(function (config) {
    const nowMS = Date.now()
    if (nowMS - lastExecution < 1000) {
        throw Error("Attempted to request nomi too fast.")
    }
    lastExecution = nowMS
    return config
})

export async function searchCities(searchText) {
    const res = await nomi.get("/search", {
        params: {
            q: searchText,
        },
    })

    // we only want to include cities and towns as loading data for a whole county, state, country etc would not be good
    // some cities do not have borders mapped and are just a node, we can't use those (e.g. Gothenburg)
    // although we could potentially use the bounding box if provided
    return res.data.filter((result) => {
        // doesn't have borders
        // it's possible a city could be a "way" type, but I haven't seen that
        if (result.osm_type != "relation") return false

        // determine if it's a city
        if (["city", "town"].includes(result.type)) return true
        if (result.addresstype == "city") return true

        return false
    })
}
