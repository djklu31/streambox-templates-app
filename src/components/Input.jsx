import React from 'react'

export default function Input(props) {
    return (
        <div className="input-div">
            <label className="input-label">{props.label}: </label><input className="input-box" type="input" value={props.value} />
        </div>
    )
}