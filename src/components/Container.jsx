import React from "react"
import {nanoid} from "nanoid"
import Video from "./Video"
import Button from "./Button"

export default function Container(props) {
    const container = props.container
    const title = container.title
    const fields = container.fields
    let style = {}

    //handle different field types
    const mappedFields = fields.map(field => {
        if (field.type === "text") {
            return <p className="fields" key={nanoid()}>{<span className="field-label">{field.value}</span>}: {field.mapping ? field.mapping: field.type}</p>
        } else if (field.type === "video") {
            return <Video key={nanoid()} height={field.height} width={field.width}/>
        } else if (field.type ==="button") {
            return <Button key={nanoid()} size={field.size} value={field.value}/>
        }
    })

    if (container.backgroundColor) {
        style = {backgroundColor: container.backgroundColor}
    }
    return (
        <div className="container" style={style}>
            <h4 className="container-title">{title}</h4>
            <hr />
            {mappedFields}
        </div>
    )
}