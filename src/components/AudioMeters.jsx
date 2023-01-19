import React, { useEffect, useState } from "react"
import SingleMeter from "./SingleMeter"

export default React.memo(function AudioMeters({
    audioLevelRoute,
    numChannels,
}) {
    //audioLevelFetch will keep track of the number of audio level fetches
    // const [audioLevelFetch, setAudioLevelFetch] = useState(0)
    const [vuMeters, setVUMeters] = useState([])
    let audioLevelFetchRate = 1000 //in milliseconds
    let fullEndpoint

    useEffect(() => {
        let audioIntervalTimer = setInterval(() => {
            let cancelController = new AbortController()

            const fetchData = async () => {
                fullEndpoint = audioLevelRoute
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
                            key={`audio-meter-${i}`}
                            volLevel={audioLevels[i]}
                            vuIndex={count}
                        />
                    )
                    count++
                }
                setVUMeters(tempVUMeters)
            }
            fetchData().catch((error) => {
                console.log(error)
            })
        }, audioLevelFetchRate)
        return () => {
            //cleanup runs on unmount
            clearInterval(audioIntervalTimer)
        }
    }, [])

    return <div className="vu-meters">{vuMeters}</div>
})
