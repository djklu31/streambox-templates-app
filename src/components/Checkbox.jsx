import React from 'react'

export default function Checkbox(props) {
    return (
        <div className="input-div">
            <label className="input-label">{props.label}: </label><input type="checkbox" />
        </div>
    )
}