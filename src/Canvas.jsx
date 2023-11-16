import { useEffect } from "react";
import borders from "./mpls.json"

export default function Canvas({ width, height }) {
    useEffect(() => {
        const canvas = document.getElementById("canvas")

        // applying styles in jsx with object causes distortion, canvases are finnicky with this
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d");
        
        // fit borders into canvas
        const cityWidth = borders.bounds.maxlon - borders.bounds.minlon
        const cityHeight = borders.bounds.maxlat - borders.bounds.minlat
        const pxPerDeg = Math.min(width/cityWidth, height/cityHeight)
        // ctx.fillRect(0, 0, cityWidth * pxPerDeg, cityHeight * pxPerDeg)

        function convertLat(lat) {
            return (borders.bounds.maxlat - lat) * pxPerDeg
        }
        function convertLon(lon) {
            return (lon - borders.bounds.minlon) * pxPerDeg
        }
        function convertCoord(coord){
            return [convertLon(coord.lon), convertLat(coord.lat)]
        }

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
    })
    
    return <canvas id="canvas"/>
}