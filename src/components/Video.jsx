import React, { useEffect, useState } from "react"

export default React.memo(function Video(props) {
    console.log(props)
    var img_tag = new Image()
    const [cacheBuster, setCacheBuster] = useState(new Date().getTime())
    let previewEndpoint
    let imageRefreshRate = 700 //in milliseconds
    let videoTimer
    useEffect(() => {
        videoTimer = setInterval(() => {
            setCacheBuster((prev) => prev + 1)
        }, imageRefreshRate)
    }, [])

    useEffect(() => {
        previewEndpoint =
            props.location + props.previewImageRoute + "?t=" + cacheBuster
        img_tag.onload = function () {
            document.getElementById(
                "video-preview"
            ).style.backgroundImage = `url(${previewEndpoint})`
        }
        img_tag.src = previewEndpoint

        return () => {
            clearInterval(videoTimer)
        }
    }, [cacheBuster])

    return <div id="video-preview" className="video"></div>
})
