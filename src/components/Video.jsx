import React, { useEffect, useState } from "react";

export default function Video(props) {
    var img_tag = new Image();
    let dateTime = new Date().getTime();
    const [cacheBuster, setCacheBuster] = useState(new Date().getTime());
    let previewEndpoint;
    let imageRefreshRate = 700; //in milliseconds

    let videoTimer = setInterval(() => {
        setCacheBuster(dateTime++);
    }, imageRefreshRate);

    useEffect(() => {
        previewEndpoint =
            props.location + props.previewImageRoute + "?t=" + cacheBuster;
        img_tag.onload = function () {
            document.getElementById(
                "video-preview"
            ).style.backgroundImage = `url(${previewEndpoint})`;
        };
        img_tag.src = previewEndpoint;

        return () => {
            clearInterval(videoTimer);
        };
    }, [cacheBuster]);

    return <div id="video-preview" className="video"></div>;
}
