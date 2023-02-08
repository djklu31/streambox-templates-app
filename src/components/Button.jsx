import React from "react"

export default function Button(props) {
    let button
    let action
    let styles = {}
    let size = ""

    if (props.size) {
        if (props.size === "big") {
            size = "big-button"
        } else if (props.size === "giant") {
            size = "giant-button"
        } else if (props.size === "small") {
            size = "small-button"
        }
    }

    if (props.backgroundColor) {
        styles = { backgroundColor: props.backgroundColor }
    }

    if (props.action === "toggleStreaming") {
        if (props.label === "Start Streaming") {
            action = "startStreaming"
        } else if (props.label === "Stop Streaming") {
            action = "stopStreaming"

            styles = { backgroundColor: "#b71c1c", color: "white" }
        }
        button = (
            <div className="giant-button-container">
                <button
                    onClick={() => {
                        props.buttonPressed(
                            action,
                            null,
                            props.port,
                            props.host
                        )
                    }}
                    className="giant-button"
                    style={styles}
                >
                    {props.label}
                </button>
            </div>
        )
    } else if (props.action === "submitLocalForm") {
        if (props.postEndpoint) {
            button = (
                <p className="fields">
                    <input
                        data-postendpoint={props.postEndpoint}
                        style={styles}
                        type="submit"
                        value={props.label}
                    />
                </p>
            )
        } else {
            button = (
                <p className="fields">
                    <span className="error-text">
                        Post endpoint is missing in template is required for
                        forms
                    </span>
                </p>
            )
        }
    } else if (props.action === "redirect") {
        if (props.redirectURL !== undefined) {
            button = (
                <p className="fields">
                    <a
                        style={styles}
                        className={size}
                        target="_blank"
                        href={props.redirectURL}
                    >
                        {props.label}
                    </a>
                </p>
            )
        } else {
            button = (
                <span style={{ color: "red", marginLeft: "30px" }}>
                    A redirectURL parameter in the template is required for
                    button redirect.
                </span>
            )
        }
    } else {
        button = (
            <p className="fields">
                <button
                    style={styles}
                    className={size}
                    onClick={() => {
                        props.buttonPressed(props.action)
                    }}
                >
                    {props.label}
                </button>
            </p>
        )
    }

    return button
}
