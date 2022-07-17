import React from "react"

export default function Button(props) {
    let button
    let action
    let isSubmitLocalForm = false

    if (props.action === "toggleStreaming") {
        if (props.label === "Start Streaming") {
            action = "startStreaming"
        } else if (props.label === "Stop Streaming") {
            action = "stopStreaming"
        }
        button = <div className="giant-button-container"><button onClick={() => {props.buttonPressed(action); props.triggerBackgroundFetch(); }}  className="giant-button">{props.label}</button></div>
    } else if (props.action === "submitLocalForm") {
        action = "submitLocalForm"
        if (props.postEndpoint) {
            button = <p className="fields"><input name={props.cname} data-postendpoint={props.postEndpoint} type="submit" value={props.label}/></p>
        } else {
            button = <p className="fields"><span className="error-text">Post endpoint is missing in template is required for forms</span></p>
        }
    }

    // if (props.size === "giant") {
    //     button = <div className="giant-button-container"><button onClick={() => props.buttonPressed(action)}  className="giant-button">{props.label}</button></div>
    // } else if (props.size === "big") {
    //     button = <div className="big-button-container"><button className="big-button">{props.label}</button></div>
    // } else if (props.size === "small") {
    //     button = <p className="fields">{action === "submitLocalForm" ? <input type="submit" value={props.label}/>
    //         : <button className="small-button">{props.label}</button>}</p>
    // }

    return (
        button
    )
}