import React from "react"
import {nanoid} from "nanoid"
import Video from "./Video"
import Button from "./Button"

export default function Container(props) {
    const container = props.container
    const apiObj = props.apiObj
    console.log(apiObj)
    const title = container.title
    const fields = container.fields
    let style = {}

    //handle different field types
    const mappedFields = fields.map(field => {
        if (field.type === "text") {
            let filteredStat
            let result

            if (field.mapping) {
                if (apiObj){
                    filteredStat = apiObj.current_stat.filter(stat => field.mapping === stat.cname)
                    if (filteredStat && filteredStat.length > 0) {
                        result = filteredStat[0].val
                    } else {
                        result = <span className="mapping-not-found">Field couldn't be mapped to a value from the API 
                        <br/>(please check if cname from API matches the "mapping" field of 
                        <br/> the JSON template)</span>
                    }
                }
            }
            return <p className="fields" key={nanoid()}>{<span className="field-label">{field.value}</span>}: {(field.mapping && apiObj) ? result:
                 <span className="mapping-not-found">{field.mapping ? "API src not included in JSON template" : "No mapping field found in JSON template"}</span>}</p>
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