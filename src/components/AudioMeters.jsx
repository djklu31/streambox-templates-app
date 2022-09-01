import { nanoid } from "nanoid"
import React, { useEffect, useState, useRef } from "react"
import SingleMeter from "./SingleMeter"

export default function AudioMeters({
    location,
    audioLevelRoute,
    numChannels,
}) {
    //audioLevelFetch will keep track of the number of audio level fetches
    const [audioLevelFetch, setAudioLevelFetch] = useState(0)
    const [vuMeters, setVUMeters] = useState([])
    let audioLevelFetchRate = 1000 //in milliseconds
    let fullEndpoint
    let isCancelled = useRef(false)

    let audioIntervalTimer = setInterval(() => {
        if (!isCancelled.current) {
            setAudioLevelFetch((prev) => prev + 1)
        }
    }, audioLevelFetchRate)

    useEffect(() => {
        let cancelController = new AbortController()

        const fetchData = async () => {
            fullEndpoint = location + audioLevelRoute
            const response = await fetch(fullEndpoint, {
                signal: cancelController.signal,
            })
            const json = await response.json()
            const [, ...audioLevels] = json.current_stat[0].val.split(":")
            const tempVUMeters = []
            let count = 0

            for (let i = 0; i < numChannels; i++) {
                tempVUMeters.push(
                    <SingleMeter
                        key={nanoid()}
                        volLevel={audioLevels[i]}
                        vuIndex={count}
                    />
                )
                count++
            }
            setVUMeters(tempVUMeters)
        }
        if (!isCancelled.current) {
            fetchData().catch((error) => {
                console.log(error)
            })
        }

        return () => {
            isCancelled.current = true
            cancelController.abort()
            clearInterval(audioIntervalTimer)
        }
    }, [audioLevelFetch])

    return <div className="vu-meters">{vuMeters}</div>
}
