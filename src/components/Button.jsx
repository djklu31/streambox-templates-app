import React from "react"

export default function Button(props) {
    let button
    let action
    let isSubmitLocalForm = false
    let styles = {}

    if (props.backgroundColor) {
        styles = {backgroundColor: props.backgroundColor}
    }

    if (props.action === "toggleStreaming") {
        if (props.label === "Start Streaming") {
            action = "startStreaming"
            styles = {backgroundColor: "#05386B"}
        } else if (props.label === "Stop Streaming") {
            action = "stopStreaming"
            styles = {backgroundColor: "#b71c1c"}
        }
        button = <div className="giant-button-container"><button onClick={() => {props.buttonPressed(action)}} className="giant-button" style={styles}>{props.label}</button></div>
    } else if (props.action === "submitLocalForm") {
        if (props.postEndpoint) {
            button = <p className="fields"><input data-postendpoint={props.postEndpoint} style={styles} type="submit" value={props.label}/></p>
        } else {
            button = <p className="fields"><span className="error-text">Post endpoint is missing in template is required for forms</span></p>
        }
    } else {
        if (props.size === "big") {
            button = <p className="fields"><button style={styles} className="big-button" onClick={() => {props.buttonPressed(props.action)}}>{props.label}</button></p>
        } else {
            button = <p className="fields"><button style={styles} className="small-button" onClick={() => {props.buttonPressed(props.action)}}>{props.label}</button></p>
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