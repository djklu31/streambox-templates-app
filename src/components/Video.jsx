import React from "react"

export default function Video(props) {
    const styles = {
        height: props.height,
        width: props.width
    }
    return (
        <div className="video" style={styles}>
            Video Here
        </div>
    )
}