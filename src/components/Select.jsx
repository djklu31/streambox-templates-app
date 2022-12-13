import React from "react"
import { debounce } from "../Utils"

export default React.memo(function Select(props) {
    let options
    let subValues = props.subValues
    let valLabels = props.valLabels
    const presetObj = props.presetObj
    let value = props.value

    if (presetObj) {
        options = presetObj.preset_list.map((preset, index) => {
            if (preset.pid == localStorage.getItem("presetPID")) {
                return (
                    <option
                        key={`preset-select-${index}`}
                        selected
                        value={preset.pid}
                    >
                        {preset.pname}
                    </option>
                )
            }

            return (
                <option key={`preset-select-${index}`} value={preset.pid}>
                    {preset.pname}
                </option>
            )
        })

        if (localStorage.getItem("presetPID") === "custom") {
            options.unshift(
                <option key="preset-obj-option-default" value="custom">
                    Custom
                </option>
            )
        } else {
            options.unshift(
                <option key="preset-obj-option-default" value="not-selected">
                    Choose One
                </option>
            )
        }
    } else {
        options = subValues.map((subValue, index) => (
            <option key={`preset-options-${index}`} value={subValue}>
                {valLabels[index]}
            </option>
        ))
    }

    return (
        <div className="input-div">
            <label className="input-label">{props.label}: </label>
            {presetObj ? (
                <select id="preset-select">{options}</select>
            ) : (
                <select name={props.name} defaultValue={value}>
                    {options}
                </select>
            )}
        </div>
    )
})
