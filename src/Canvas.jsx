import { useEffect, useState } from "react"

export default function Canvas({ borders, streets, width, height }) {
    const [showMotorway, setShowMotorway] = useState(true)
    const [showTrunk, setShowTrunk] = useState(true)
    const [showPrimary, setShowPrimary] = useState(true)
    const [showSecondary, setShowSecondary] = useState(true)
    const [showTertiary, setShowTertiary] = useState(true)
    const [showUnclassified, setShowUnclassified] = useState(false)

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
        const pxPerKM = Math.min(width / cityWidthKM, height / cityHeightKM)
        const pxPerDegLat = pxPerKM * kmPerDegLat
        const pxPerDegLon = pxPerKM * kmPerDegLon

        function convertLat(lat) {
            return (borders.bounds.maxlat - lat) * pxPerDegLat
        }
        function convertLon(lon) {
            return (lon - borders.bounds.minlon) * pxPerDegLon
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
        for (let way of streets.ways) {
            // determine if this street should be drawn
            switch (way.tags && way.tags.highway) {
                case "motorway":
                    if (!showMotorway) continue
                    break

                case "trunk":
                    if (!showTrunk) continue
                    break

                case "primary":
                    if (!showPrimary) continue
                    break

                case "secondary":
                    if (!showSecondary) continue
                    break

                case "tertiary":
                    if (!showTertiary) continue
                    break

                case "unclassified":
                    if (!showUnclassified) continue
                    break

                default:
                    continue
            }

            const pixels = way.nodes
                .map((nID) => streets.nodes[nID])
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
    })

    return (
        <div style={{ textAlign: "-webkit-center" }}>
            <div style={{textAlign: 'left', width: 'fit-content'}}>
                <input
                    type="checkbox"
                    checked={showMotorway}
                    onChange={(e) => setShowMotorway(e.target.checked)}
                />
                <label>Motorways</label>
                <br />
                <input
                    type="checkbox"
                    checked={showTrunk}
                    onChange={(e) => setShowTrunk(e.target.checked)}
                />
                <label>Trunks</label>
                <br />
                <input
                    type="checkbox"
                    checked={showPrimary}
                    onChange={(e) => setShowPrimary(e.target.checked)}
                />
                <label>Primary</label>
                <br />
                <input
                    type="checkbox"
                    checked={showSecondary}
                    onChange={(e) => setShowSecondary(e.target.checked)}
                />
                <label>Secondary</label>
                <br />
                <input
                    type="checkbox"
                    checked={showTertiary}
                    onChange={(e) => setShowTertiary(e.target.checked)}
                />
                <label>Tertiary</label>
                <br />
                <input
                    type="checkbox"
                    checked={showUnclassified}
                    onChange={(e) => setShowUnclassified(e.target.checked)}
                />
                <label>Unclassified</label>
                <br />
            </div>
            <canvas id="canvas" style={{marginTop: '10px'}}/>
        </div>
    )
}
