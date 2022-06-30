import React from "react"

export default function Button(props) {
    let button = <div className="giant-button-container"><button className="giant-button">{props.value}</button></div>;

    if (props.size === "giant") {
        button = <div className="giant-button-container"><button className="giant-button">{props.value}</button></div>
    } else if (props.size === "big") {
        button = <div className="big-button-container"><button className="big-button">{props.value}</button></div>
    } else if (props.size === "small") {
        button = <p className="fields"><button className="small-button">{props.value}</button></p>
    }

    return (
        button
    )
}