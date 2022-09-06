import React from "react"
import { debounce } from "../Utils"

export default React.memo(function Input(props) {
    return (
        <div className="input-div">
            <label className="input-label">{props.label}: </label>
            <input
                className="input-box"
                name={props.name}
                type="input"
                defaultValue={props.value}
            />
            <span className="endLabel">{props.endLabel}</span>
        </div>
    )
})
