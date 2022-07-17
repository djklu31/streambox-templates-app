import React from 'react'
import { nanoid } from 'nanoid'

export default function Select(props) {
    let options
    let subValues = props.subValues
    let valLabels = props.valLabels
    let value = props.value

    options = subValues.map((subValue, index) => <option key={nanoid()} value={subValue}>{valLabels[index]}</option>)
    return (
        <div className="input-div">
            <label className="input-label">{props.label}: </label>
            <select name={props.name} defaultValue={value}>
                {options}
            </select>
        </div>
    )
}