import React from "react"

export default function Button(props) {
    return (
        props.size === "big" ? <div className="big-button-container"><button className="big-button">{props.value}</button></div> : 
        <p className="fields"><button className="small-button">{props.value}</button></p>
    )
}