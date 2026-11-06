import { useEffect, useState } from "react"

export default function Canvas({ borders, streets, width, height }) {
    const initialTypesShown = {}
    
    Object.keys(streets).forEach(t => initialTypesShown[t] = !['footway', 'service'].includes(t))

    const [typesShown, setTypesShown] = useState(initialTypesShown)

    useEffect(() => {
        const canvas = document.getElementById("canvas")

        // applying styles in jsx with object causes distortion, canvases are finnicky with this
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")

        // fit borders into canvas
        // the size of a degree of latitude is constant, but
        // the size of a degree of longitude shrinks as you get closer to the poles (ie as a function of latitude)
        // we will just use the middle lat to calc the size of lon
        const kmPerDegLat = 110.574
        const avgLat = (borders.bounds.maxlat + borders.bounds.minlat) / 2
        const avgLatRad = (avgLat * 2 * Math.PI) / 360
        const kmPerDegLon = 111.32 * Math.cos(avgLatRad)
        const cityWidthKM =
            (borders.bounds.maxlon - borders.bounds.minlon) * kmPerDegLon
        const cityHeightKM =
            (borders.bounds.maxlat - borders.bounds.minlat) * kmPerDegLat

        // we need the city to fit into the canvas width wise and height wise, without getting distorted
        const pxPerKM = Math.min(width / cityWidthKM, height / cityHeightKM)
        const pxPerDegLat = pxPerKM * kmPerDegLat
        const pxPerDegLon = pxPerKM * kmPerDegLon

        // calculate width offset to center the map in the canvas (this will be 0 if the sizing is width-restricted)
        const cityPxWidth = cityWidthKM * pxPerKM
        const widthOffsetPx = (width - cityPxWidth) / 2

        function convertLat(lat) {
            return (borders.bounds.maxlat - lat) * pxPerDegLat
        }
        function convertLon(lon) {
            return (lon - borders.bounds.minlon) * pxPerDegLon + widthOffsetPx
        }
        function convertCoord(coord) {
            return [convertLon(coord.lon), convertLat(coord.lat)]
        }

        // draw city borders
        ctx.lineWidth = 2
        for (let way of borders.members) {
            if (way.type !== "way") continue
            if (!way.geometry) continue
            // a way is basically a set of line segments
            // which we can easily draw as a path on the canvas

            const pixels = way.geometry.map(convertCoord)
            pixels.slice(1).forEach((p2, i) => {
                const p1 = pixels[i]
                // draw line seg between p1 and p2
                ctx.beginPath()
                ctx.moveTo(...p1)
                ctx.lineTo(...p2)
                ctx.stroke()
            })
        }

        // draw streets
        ctx.lineWidth = 1
        for (let key in streets) {
            // determine if this street should be drawn
            if (!typesShown[key]) continue

            for (let way of streets[key]) {
                const pixels = way.geometry
                    .map(convertCoord)
                pixels.slice(1).forEach((p2, i) => {
                    const p1 = pixels[i]
                    // draw line seg between p1 and p2
                    ctx.beginPath()
                    ctx.moveTo(...p1)
                    ctx.lineTo(...p2)
                    ctx.stroke()
                })
            }
        }
    })

    return (
        <div style={{ textAlign: "-webkit-center" }}>
            <div
                style={{
                    textAlign: "left",
                    width: "fit-content",
                    border: "1px solid",
                    padding: "5px",
                }}
            >
                {Object.keys(streets).sort().map(t => (<div key={t}>
                    <input
                        type="checkbox"
                        checked={typesShown[t]}
                        onChange={(e) => setTypesShown({...typesShown, [t]: e.target.checked})}
                        style={{ marginLeft: 0 }}
                    />
                    <label>{t}</label>
                </div>))}
            </div>
            <canvas id="canvas" style={{ marginTop: "10px" }} />
        </div>
    )
}
