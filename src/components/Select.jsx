import React from 'react'
import { nanoid } from 'nanoid'
import {debounce} from '../Utils'

export default function Select(props) {
    let options
    let subValues = props.subValues
    let valLabels = props.valLabels
    const presetObj = props.presetObj
    let value = props.value

    if (presetObj) {
        options = (presetObj.preset_list).map((preset) => <option key={nanoid()} value={preset.pid}>{preset.pname}</option>)
        options.unshift(<option key={nanoid()} value="not-selected">Choose One</option>)
    } else {
        options = subValues.map((subValue, index) => <option key={nanoid()} value={subValue}>{valLabels[index]}</option>)
    }

    return (
        <div className="input-div">
            <label className="input-label">{props.label}: </label>
            {presetObj ? 
                <select id="preset-select" onFocus={props.clearTimer} onBlur={debounce(props.startTimer)}>
                    {options}
                </select> :
                <select name={props.name} defaultValue={value} onFocus={props.clearTimer} onBlur={debounce(props.startTimer)}>
                    {options}
                </select>
            }
        </div>
    )
}