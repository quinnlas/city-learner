import { useState } from "react"
import { searchCities } from "./tools/nomi"
import { getCityBorders, getRoadsInArea, getRoadsInBBox } from "./tools/osm"
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

        const hasBorders = result.osm_type === 'relation'

        if (hasBorders) {
            try {
                // get borders
                setLoadingMessage("Loading city borders (this could take awhile)...")
                const borderRes = await getCityBorders(result.osm_id)
                setBorders(borderRes.data.elements[0])
                
                // get road data by area
                setLoadingMessage("Loading city streets (this could take awhile)...")
                const streets = await getRoadsInArea(result.osm_id)
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
        } else {
            try {
                // no borders
                setBorders({
                    bounds: {
                        minlat: Number.parseFloat(result.boundingbox[0]),
                        maxlat: Number.parseFloat(result.boundingbox[1]),
                        minlon: Number.parseFloat(result.boundingbox[2]),
                        maxlon: Number.parseFloat(result.boundingbox[3])
                    },
                    members: []
                })

                // get road data by bbox
                setLoadingMessage("Loading city streets (this could take awhile)...")
                const streets = await getRoadsInBBox(result.boundingbox)
                setLoadingMessage("")
                setStreets(streets)
                setCityID(result.osm_id)
                setShowCanvas(true)
                setSearchResults([])
                setShowSearchResults(false)
                setLoadingMessage("This city does not have border data. Displaying roads in the bounding box.")
            } catch (e) {
                console.error(e)
                setLoadingMessage("Request failed.")
            }
        }
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
