import { useState } from "react"
import { searchCities } from "./tools/nomi"
import { getCityBorders, getRoads } from "./tools/osm"
import Canvas from "./Canvas"

export default function CityChooser() {
    const [searchText, setSearchText] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [borders, setBorders] = useState(null)
    const [streets, setStreets] = useState(null)
    const [showCanvas, setShowCanvas2] = useState(false)

    function onInput(e) {
        setSearchText(e.target.value)
    }

    function onKeyUp(e) {
        if (e.code == "Enter") onClickSearch()
    }

    async function onClickSearch() {
        setSearchResults(await searchCities(searchText))
    }

    async function onClickResult(i) {
        const result = searchResults[i]

        // get the city data from osm
        const borderRes = await getCityBorders(result.osm_id)
        setBorders(borderRes.data.elements[0])

        await new Promise((rs) => setTimeout(rs, 1000))
        const streetsRes = await getRoads(result.osm_id)
        const streetData = streetsRes.data.elements
        // the streets data is an array with a bunch of nodes and ways:
        // we want to process this efficiently before sending it to another component
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
        setStreets({ ways, nodes })
        setShowCanvas2(true)
    }

    return (
        <>
            <input
                type="text"
                placeholder="Minneapolis"
                onInput={onInput}
                onKeyUp={onKeyUp}
            />
            <button onClick={onClickSearch}>Search</button>
            <ul>
                {searchResults.map((r, i) => (
                    // TODO prettier display than ul/li
                    <li key={r.place_id} onClick={() => onClickResult(i)}>
                        {r.display_name}
                    </li>
                ))}
            </ul>
            {/* TODO get starting size from viewport */}
            {/* TODO some kind of app state management */}
            {/* -10 is to avoid scrollbar, not sure exact amount needed */}
            {showCanvas ? (
                <Canvas
                    borders={borders}
                    streets={streets}
                    width={1440 - 40 * 2 - 32 * 2}
                    height={843 - 32 * 2 - 10}
                />
            ) : (
                <></>
            )}
        </>
    )
}
