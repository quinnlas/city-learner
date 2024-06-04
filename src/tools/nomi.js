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

export function searchCities(searchText) {
    return nomi.get("/search", {
        params: {
            q: searchText,
        },
    })
}
