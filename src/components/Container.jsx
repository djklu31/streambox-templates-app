import React from "react"
import {nanoid} from "nanoid"
import Video from "./Video"
import Button from "./Button"
import Input from "./Input"
import Checkbox from "./Checkbox"
import Select from "./Select"
import Form from "./Form"

const endpoint = location.origin

export default function Container(props) {
    const container = props.container
    const apiObj = props.apiObj
    const title = container.title
    const fields = container.fields
    let style = {}
    const isForm = container.type === "form" ? true : false

    //handle button presses with appropriate action
    function buttonPressed(action) {
        if (action === "startStreaming") {
            startStreaming()
        } else if (action === "stopStreaming") {
            stopStreaming()
        }
    }

    async function handleFormSubmit(event) {
        event.preventDefault()
        let target = event.target;
        let postEndpoint = ""
        let tempObj = {
            "cname": "",
            "val": ""
        }
        let arr = []

        for (let field of target) {
            if (field.name) {
                tempObj.cname = field.name
                tempObj.val = field.value
                arr = [...arr, {...tempObj}]
            }

            if (field.type === "submit") {
                postEndpoint = field.dataset.postendpoint
            }
        }

        POSTData(endpoint + postEndpoint, { "val_list": arr })
        .then(data => {
            console.log("Data POSTED to " + endpoint + postEndpoint + ": " + JSON.stringify(data));
            alert("Changes have been applied")
            props.triggerBackgroundFetch() 
        });
    }

    async function startStreaming() {
        POSTData(endpoint + '/REST/encoder/action', { "action_list": ["start"] })
        .then(data => {
            console.log("Streaming started" + JSON.stringify(data)); 
            props.triggerBackgroundFetch();
        });
    }
    

    async function stopStreaming() {
        POSTData(endpoint + '/REST/encoder/action', { "action_list": ["stop"] })
        .then(data => {
            console.log("Streaming stopped" + JSON.stringify(data)); 
            props.triggerBackgroundFetch();
        });
    }

    async function POSTData(url = '', data = {}) {
        let formData = new FormData();
        formData.append("c", JSON.stringify(data));
        const response = await fetch(url, {
            method: 'POST', 
            body: formData
        });
        return response.json(); // parses JSON response into native JavaScript objects
    }

    //handle different field types
    const mappedFields = fields.map(field => {
        let filteredStat
        let result
        let apiObjMissing = false;
        let fieldMapMissing = false;

        if (!apiObj) {
            apiObjMissing = true;
        }

        if (field.mapping) {
            if (!apiObjMissing) {
                filteredStat = apiObj.current_stat.filter(stat => field.mapping === stat.cname)
                if (filteredStat && filteredStat.length > 0) {
                    result = filteredStat[0].val
                } else {
                    result = <span className="error-text">Field couldn't be mapped to a value from the API 
                    <br/>(please check if cname from API matches the "mapping" field of 
                    <br/> the JSON template)</span>
                }
            }
        } else {
            fieldMapMissing = true;
        }

        //if mapping field is missing from container or api src is missing then print that out in it's respective type
        if (fieldMapMissing) {
            result = <span className="error-text">No mapping field found in JSON template</span>
        }
        if (apiObjMissing) {
            result = <span className="error-text">API src not included in JSON template</span>
        }
        if (apiObjMissing || fieldMapMissing && (field.type !== "button" && field.type !== "video")) {
            return <p className="fields"><span className="field-label">{field.label}</span>: {result}</p>
        } 


        //handle all types of input
        if (field.type === "text") {
            if (field.mapping === "is_ldmp" && (!apiObjMissing && !fieldMapMissing)) {
                if (filteredStat && filteredStat[0].val == 1) {
                    result = "LDMP"
                } else {
                    result = "UDP"
                }
            }
            return <p className="fields" key={nanoid()}><span className="field-label">{field.label}</span>: {result}</p>
        } else if (field.type === "video") {
            if (field.previewImageRoute) {
                return <Video key={nanoid()} location={endpoint} previewImageRoute={field.previewImageRoute}/>
            } else {
                return <p className="fields">
                    <span className="error-text">Missing parameter for video preview: previewImageRoute</span></p>
            }
        } else if (field.type ==="button") {
            //custom button rules
            if (field.mapping === "isStreaming") {
                if (filteredStat && filteredStat[0].val == 1) {
                    result = "Stop Streaming"
                } else {
                    result = "Start Streaming"
                }
            } else {
                result = field.label
            }
            if (isForm) {
                return <Button key={nanoid()} postEndpoint={container.postEndpoint} size={field.size} label={result} action={field.action} buttonPressed={buttonPressed}/>
            } else {
                return <Button key={nanoid()} size={field.size} label={result} action={field.action} buttonPressed={buttonPressed}/>
            }
        } else if (field.type === "input") {
            if (filteredStat) {
                return <Input key={nanoid()} name={filteredStat[0].cname} endLabel={field.endLabel} label={field.label} value={filteredStat[0].val} />
            }
        } else if (field.type === "checkbox") {
            if (filteredStat) {
                return <Checkbox key={nanoid()} name={filteredStat[0].cname} label={field.label} checked={filteredStat[0].val} endLabel={field.endLabel} />
            }
        } else if (field.type === "select") {
            if (filteredStat) {
                return <Select key={nanoid()} name={filteredStat[0].cname} subValues={filteredStat[0].sub_values} value={filteredStat[0].val} valLabels={filteredStat[0].val_labels} label={field.label} endLabel={field.endLabel} />
            }
        }
    })

    if (container.backgroundColor) {
        style = {backgroundColor: container.backgroundColor}
    }

    if (container.containerStyle) {
        if (container.containerStyle.stretchVertically) {
            style = {...style,
                "gridRow": "span " + container.containerStyle.stretchVertically
            }
        }
    }
    return (
        <div className="container" style={style}>
            <h4 className="container-title">{title}</h4>
            <hr />
            {isForm ? <Form mappedFields={mappedFields} handleFormSubmit={handleFormSubmit} /> : mappedFields}
        </div>
    )
}