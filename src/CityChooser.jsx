import { useState } from "react";
import { searchCities } from "./tools/nomi";
import { getCityBorders } from "./tools/osm";
import Canvas from "./Canvas";

export default function CityChooser() {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [borders, setBorders] = useState(null);
  const [showCanvas, setShowCanvas2] = useState(false)

  function onInput(e) {
    setSearchText(e.target.value);
  }

  function onKeyUp(e) {
    if (e.code == 'Enter') onClickSearch()
  }

  async function onClickSearch() {
    const res = await searchCities(searchText);
    setSearchResults(res.data);
  }

  async function onClickResult(i) {
    // filter out non-cities
    // TODO filter these in displayed results
    const result = searchResults[i]
    if (!["town", "city"].includes(result.addresstype)) return

    // get the city data from osm
    const res = await getCityBorders(result.osm_id)
    setBorders(res.data.elements[0])
    setShowCanvas2(true)
  }

  return (
    <>
      <input type="text" placeholder="Minneapolis" onInput={onInput} onKeyUp={onKeyUp}/>
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
      {showCanvas ? <Canvas borders={borders} width={1440 - 40*2 - 32*2} height={843 - 32*2 - 10}/> : <></>}
    </>
  );
}
