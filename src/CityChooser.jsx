import { useState } from "react"
import { searchCities } from "./tools/nomi"
import { getCityBorders, getRoads } from "./tools/osm"
import Canvas from "./Canvas"

export default function CityChooser() {
    const [searchText, setSearchText] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [searched, setSearched] = useState(false)
    const [borders, setBorders] = useState(null)
    const [streets, setStreets] = useState(null)
    const [showCanvas, setShowCanvas] = useState(false)

    function onInput(e) {
        setSearchText(e.target.value)
    }

    function onKeyUp(e) {
        if (e.code == "Enter") onClickSearch()
    }

    async function onClickSearch() {
        setSearchResults(await searchCities(searchText))
        setSearched(true)
    }

    async function onClickResult(i) {
        const result = searchResults[i]

        // get the city data from osm
        const borderRes = await getCityBorders(result.osm_id)
        setBorders(borderRes.data.elements[0])

        await new Promise((rs) => setTimeout(rs, 1000))
        const streets = await getRoads(result.osm_id)
        setStreets(streets)
        setShowCanvas(true)
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
            <ul
                style={{
                    listStyle: "none",
                    paddingLeft: 0,
                    width: "fit-content",
                }}
            >
                {searchResults.map((r, i) => (
                    <li
                        key={r.place_id}
                        onClick={() => onClickResult(i)}
                        style={{
                            border: "1px solid",
                            padding: "10px",
                        }}
                    >
                        {r.display_name}
                    </li>
                ))}
            </ul>
            {searched && !searchResults.length ? (
                <p>
                    No city search results were found. Please try a different
                    search.
                </p>
            ) : (
                <></>
            )}
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
