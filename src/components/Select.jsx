import React from 'react'

export default function Select(props) {
    return (
        <div className="input-div">
            <label className="input-label">{props.label}: </label><select></select>
        </div>
    )
}