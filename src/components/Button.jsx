import React from "react"

export default function Button(props) {
    let button
    let action

    if (props.action === "toggleStreaming") {
        if (props.label === "Start Streaming") {
            action = "startStreaming"
        } else if (props.label === "Stop Streaming") {
            action = "stopStreaming"
        }
    } else if (props.action === "submitForm") {
        
    }

    if (props.size === "giant") {
        button = <div className="giant-button-container"><button onClick={() => props.buttonPressed(action)}  className="giant-button">{props.label}</button></div>
    } else if (props.size === "big") {
        button = <div className="big-button-container"><button className="big-button">{props.label}</button></div>
    } else if (props.size === "small") {
        button = <p className="fields"><button className="small-button">{props.label}</button></p>
    }

    return (
        button
    )
}