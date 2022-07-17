import React, {useEffect} from "react"

export default function Video(props) {
    var img_tag = new Image()
    let previewEndpoint = props.location + props.previewImageRoute + "?t=" + new Date().getTime()

    img_tag.onload = function() {
        document.getElementById("video-preview").style.backgroundImage = `url(${previewEndpoint})`;
    }

    img_tag.src = previewEndpoint
    
    return (
        <div id="video-preview" className="video"></div>
    )
}