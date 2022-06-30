import React from "react"

export default function Video(props) {
    //default video size 400 x 400 px
    let styles = {
        height: 400,
        width: 400
    }
    if (props.videoStyles) {
        styles = {
            height: props.videoStyles.styleheight,
            width: props.videoStyles.width
        }
    }
    
    return (
        <div className="video" style={styles}>
            Video Here
        </div>
    )
}