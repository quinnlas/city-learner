import { useState } from "react"
import { searchCities } from "./tools/nomi"
import { getCityBorders, getRoads } from "./tools/osm"
import Canvas from "./Canvas"
import "./CityChooser.css"

export default function CityChooser() {
    const [searchText, setSearchText] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [borders, setBorders] = useState(null)
    const [streets, setStreets] = useState(null)
    const [justStarted, setJustStarted] = useState(true)
    const [showCanvas, setShowCanvas] = useState(false)
    const [loadingMessage, setLoadingMessage] = useState('')
    const [cityID, setCityID] = useState(0)

    function onInput(e) {
        setSearchText(e.target.value)
    }

    function onKeyUp(e) {
        if (e.key == "Enter") onClickSearch()
    }

    async function onClickSearch() {
        setLoadingMessage("Loading search results...")
        setSearchResults(await searchCities(searchText))
        setLoadingMessage("")
        setShowSearchResults(true)
    }

    async function onClickResult(i) {
        setJustStarted(false)
        const result = searchResults[i]

        // get the city data from osm
        setLoadingMessage("Loading city borders (this could take awhile)...")
        try {
            const borderRes = await getCityBorders(result.name)
            setBorders(borderRes.data.elements[0])
            
            setLoadingMessage("Loading city streets (this could take awhile)...")
            const streets = await getRoads(result.boundingbox)
            setLoadingMessage("")
            setStreets(streets)
            setCityID(result.osm_id)
            setShowCanvas(true)
            setSearchResults([])
            setShowSearchResults(false)
        } catch (e) {
            console.error(e)
            setLoadingMessage("Request failed.")
        }
    }

    return (
        <>
            <div style={{ textAlign: "-webkit-center" }}>
                {justStarted ? (
                    <div style={{ marginTop: "100px" }}>
                        <h1>City Learner MN</h1>
                        <p>Enter a city in Minnesota to get started.</p>
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
                            different search.
                        </p>
                    ) : (
                        <></>
                    )}
                    {searchResults.length ? <hr /> : <></>}
                    {searchResults.map((r, i) => (
                        <li
                            key={r.place_id}
                            onClick={() => onClickResult(i)}
                            className="search-result"
                        >
                            {r.display_name}
                        </li>
                    ))}
                </ul>
                {loadingMessage ? (
                    <div>
                        {loadingMessage}
                    </div>
                ) : (
                    <></>
                )}
            </div>
            {/* TODO get starting size from viewport */}
            {/* TODO some kind of app state management */}
            {/* -10 is to avoid scrollbar, not sure exact amount needed */}
            {/* key is used to reset the component for new cities and avoid bugginess */}
            {showCanvas ? (
                <Canvas
                    key={cityID}
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
