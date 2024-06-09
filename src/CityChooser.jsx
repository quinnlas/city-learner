import { useState } from "react"
import { searchCities } from "./tools/nomi"
import { getCityBorders, getRoads } from "./tools/osm"
import Canvas from "./Canvas"

export default function CityChooser() {
    const [searchText, setSearchText] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [borders, setBorders] = useState(null)
    const [streets, setStreets] = useState(null)
    const [justStarted, setJustStarted] = useState(true)
    const [showCanvas, setShowCanvas] = useState(false)
    const [showLoading, setShowLoading] = useState(false)

    function onInput(e) {
        setSearchText(e.target.value)
    }

    function onKeyUp(e) {
        if (e.code == "Enter") onClickSearch()
    }

    async function onClickSearch() {
        setShowLoading(true)
        setSearchResults(await searchCities(searchText))
        setShowLoading(false)
        setShowSearchResults(true)
    }

    async function onClickResult(i) {
        setJustStarted(false)
        const result = searchResults[i]

        // get the city data from osm
        setShowLoading(true)
        const borderRes = await getCityBorders(result.osm_id)
        setBorders(borderRes.data.elements[0])

        await new Promise((rs) => setTimeout(rs, 1000))
        const streets = await getRoads(result.osm_id)
        setShowLoading(false)
        setStreets(streets)
        setShowCanvas(true)
        setSearchResults([])
        setShowSearchResults(false)
    }

    return (
        <>
            <div style={{ textAlign: "-webkit-center" }}>
                {justStarted ? (
                    <div style={{ marginTop: "100px" }}>
                        <h1>City Learner</h1>
                        <p>Enter a city to get started.</p>
                    </div>
                ) : (
                    <></>
                )}
                <ul
                    style={{
                        listStyle: "none",
                        paddingLeft: 0,
                        width: "410px",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Minneapolis"
                        onInput={onInput}
                        onKeyUp={onKeyUp}
                        style={{
                            width: "410px",
                            boxSizing: "border-box",
                        }}
                    />
                    {showSearchResults && !searchResults.length ? (
                        <p style={{ textAlign: "left" }}>
                            No city search results were found. Please try a
                            different search. Some cities do not have borders in
                            OpenStreetMap yet.
                        </p>
                    ) : (
                        <></>
                    )}
                    {searchResults.length ? <hr /> : <></>}
                    {searchResults.map((r, i) => (
                        <li
                            key={r.place_id}
                            onClick={() => onClickResult(i)}
                            style={{
                                border: "1px solid",
                                padding: "10px",
                                backgroundColor: "white",
                            }}
                        >
                            {r.display_name}
                        </li>
                    ))}
                </ul>
            </div>
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
            {showLoading ? (
                <div style={{ position: "fixed", bottom: "8px" }}>
                    Loading...
                </div>
            ) : (
                <></>
            )}
        </>
    )
}
