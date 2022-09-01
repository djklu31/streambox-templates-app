import React from "react"
import { nanoid } from "nanoid"
import Video from "./Video"
import Button from "./Button"
import Input from "./Input"
import Checkbox from "./Checkbox"
import Select from "./Select"
import Form from "./Form"
import AudioMeter from "./AudioMeters"

const endpoint = location.origin

export default function Container(props) {
    const container = props.container
    const apiObj = props.apiObj
    const title = container.title
    const fields = container.fields
    let style = {}
    const isForm = container.type === "form" ? true : false
    const isMultiChannelSelection =
        container.type === "multichannel-container" ? true : false

    //handle button presses with appropriate action
    function buttonPressed(action) {
        if (action === "startStreaming") {
            startStreaming()
        } else if (action === "stopStreaming") {
            stopStreaming()
        } else if (action === "applyPreset") {
            const pid = document.getElementById("preset-select").value
            if (pid === "not-selected") {
                alert("Please choose a preset from the preset select box")
            } else {
                applyPreset(parseInt(pid))
            }
        }
    }

    async function applyPreset(pid) {
        POSTData(endpoint + "/REST/encoder/presets", {
            command: "apply",
            pid: pid,
        }).then((data) => {
            alert("Preset Changed Successfully")
            console.log("Preset changed" + JSON.stringify(data))
            props.triggerBackgroundFetch()
        })
    }

    async function handleFormSubmit(event) {
        event.preventDefault()
        let target = event.target
        let postEndpoint = ""

        let tempObj = {
            cname: "",
            val: "",
        }

        let arr = []

        for (let field of target) {
            if (field.name) {
                tempObj.cname = field.name
                tempObj.val = field.value
                arr = [...arr, { ...tempObj }]
            }

            if (field.type === "submit") {
                postEndpoint = field.dataset.postendpoint
            }
        }

        POSTData(endpoint + postEndpoint, { val_list: arr }).then((data) => {
            console.log(
                "Data POSTED to " +
                    endpoint +
                    postEndpoint +
                    ": " +
                    JSON.stringify(data)
            )
            alert("Changes have been applied")
            props.triggerBackgroundFetch()
        })
    }

    async function startStreaming() {
        POSTData(endpoint + "/REST/encoder/action", {
            action_list: ["start"],
        }).then((data) => {
            console.log("Streaming started" + JSON.stringify(data))
            props.triggerBackgroundFetch()
        })
    }

    async function stopStreaming() {
        POSTData(endpoint + "/REST/encoder/action", {
            action_list: ["stop"],
        }).then((data) => {
            console.log("Streaming stopped" + JSON.stringify(data))
            props.triggerBackgroundFetch()
        })
    }

    async function POSTData(url = "", data = {}) {
        let formData = new FormData()
        formData.append("c", JSON.stringify(data))
        const response = await fetch(url, {
            method: "POST",
            body: formData,
        })
        return response.json() // parses JSON response into native JavaScript objects
    }

    function handleFieldTypes(field) {
        let filteredStat
        let result
        let apiObjMissing = false
        let fieldMapMissing = false
        let isPlainText = field.type === "plaintext" ? true : false

        //set up error message if api object is missing or mapping field is missing or can't be mapped
        if (!apiObj) {
            apiObjMissing = true
        }

        if (field.mapping) {
            if (!apiObjMissing) {
                filteredStat = apiObj.current_stat.filter(
                    (stat) => field.mapping === stat.cname
                )
                if (filteredStat && filteredStat.length > 0) {
                    result = filteredStat[0].val
                } else {
                    result = (
                        <span className="error-text">
                            Field couldn't be mapped to a value from the API
                            <br />
                            (please check if cname from API matches the
                            "mapping" field of
                            <br /> the JSON template)
                        </span>
                    )
                }
            }
        } else {
            fieldMapMissing = true
        }

        if (!isPlainText) {
            //if mapping field is missing from container or api src is missing then print that out in it's respective type
            if (fieldMapMissing) {
                result = (
                    <span className="error-text">
                        No mapping field found in JSON template
                    </span>
                )
            }
            if (apiObjMissing) {
                result = (
                    <span className="error-text">
                        API src not included in JSON template
                    </span>
                )
            }
            if (
                apiObjMissing ||
                (fieldMapMissing &&
                    field.type !== "button" &&
                    field.type !== "video")
            ) {
                return (
                    <p className="fields">
                        <span className="field-label">{field.label}</span>:{" "}
                        {result}
                    </p>
                )
            }
        }

        let inlineElementsArray = []

        if (field.inlineElements && field.inlineElements.length > 0) {
            const inlineElements = field.inlineElements
            for (let element of inlineElements) {
                inlineElementsArray.push(handleFieldTypes(element))
            }
        }

        let returnArr = []

        //handle all types of input
        if (isPlainText) {
            returnArr = (
                <p className="fields">
                    <span className="plain-text">{field.text}</span>
                </p>
            )
        } else if (field.type === "mappedText") {
            if (
                field.mapping === "is_ldmp" &&
                !apiObjMissing &&
                !fieldMapMissing
            ) {
                if (typeof filteredStat[0] !== "undefined") {
                    if (filteredStat && filteredStat[0].val == 1) {
                        result = "LDMP"
                    } else {
                        result = "UDP"
                    }
                } else {
                    console.log("THROW ERROR")
                }
            }
            returnArr = (
                <p className="fields" key={nanoid()}>
                    <span className="field-label">{field.label}</span>: {result}
                </p>
            )
        } else if (field.type === "video") {
            if (field.previewImageRoute) {
                if (field.hasVUMeter) {
                    //get number of audio channels
                    const numChannels = apiObj.current_stat.filter(
                        (stat) => stat.cname === "AudioChannels"
                    )[0].val

                    returnArr = (
                        <div
                            key={nanoid()}
                            className="video-audio-meter-container"
                        >
                            <Video
                                key={nanoid()}
                                location={endpoint}
                                previewImageRoute={field.previewImageRoute}
                            />
                            <AudioMeter
                                key={nanoid()}
                                location={endpoint}
                                audioLevelRoute={field.audioLevelEndpoint}
                                numChannels={numChannels}
                            />
                        </div>
                    )
                } else {
                    returnArr = (
                        <Video
                            key={nanoid()}
                            location={endpoint}
                            previewImageRoute={field.previewImageRoute}
                        />
                    )
                }
            } else {
                returnArr = (
                    <p className="fields">
                        <span className="error-text">
                            Missing parameter for video preview:
                            previewImageRoute
                        </span>
                    </p>
                )
            }
        } else if (field.type === "button") {
            //custom button rules
            if (field.mapping === "isStreaming") {
                if (typeof filteredStat[0] !== "undefined") {
                    if (filteredStat && filteredStat[0].val == 1) {
                        result = "Stop Streaming"
                    } else {
                        result = "Start Streaming"
                    }
                } else {
                    console.log("THROW ERROR")
                }
            } else {
                result = field.label
            }
            if (isForm) {
                returnArr = (
                    <Button
                        key={nanoid()}
                        postEndpoint={container.postEndpoint}
                        size={field.size}
                        backgroundColor={field.backgroundColor}
                        label={result}
                        action={field.action}
                        buttonPressed={buttonPressed}
                    />
                )
            } else {
                returnArr = (
                    <Button
                        key={nanoid()}
                        size={field.size}
                        label={result}
                        action={field.action}
                        backgroundColor={field.backgroundColor}
                        buttonPressed={buttonPressed}
                    />
                )
            }
        } else if (field.type === "input") {
            if (typeof filteredStat[0] !== "undefined") {
                if (filteredStat) {
                    returnArr = (
                        <Input
                            key={nanoid()}
                            name={filteredStat[0].cname}
                            clearTimer={props.clearTimer}
                            startTimer={props.startTimer}
                            endLabel={field.endLabel}
                            label={field.label}
                            value={filteredStat[0].val}
                        />
                    )
                }
            } else {
                returnArr = (
                    <div className="error-text-margin">
                        There was a problem with the JSON for this input element
                    </div>
                )
            }
        } else if (field.type === "checkbox") {
            if (typeof filteredStat[0] !== "undefined") {
                if (filteredStat) {
                    returnArr = (
                        <Checkbox
                            key={nanoid()}
                            name={filteredStat[0].cname}
                            label={field.label}
                            checked={filteredStat[0].val}
                            endLabel={field.endLabel}
                        />
                    )
                }
            } else {
                returnArr = (
                    <div className="error-text-margin">
                        There was a problem with the JSON for this checkbox
                        element
                    </div>
                )
            }
        } else if (field.type === "select") {
            if (typeof filteredStat[0] !== "undefined") {
                if (filteredStat) {
                    returnArr = (
                        <Select
                            key={nanoid()}
                            name={filteredStat[0].cname}
                            clearTimer={props.clearTimer}
                            startTimer={props.startTimer}
                            subValues={filteredStat[0].sub_values}
                            value={filteredStat[0].val}
                            valLabels={filteredStat[0].val_labels}
                            label={field.label}
                            endLabel={field.endLabel}
                        />
                    )
                }
            } else {
                returnArr
            }
        } else if (field.type === "presetSelect" && props.presetObj) {
            returnArr = (
                <div key={nanoid()} className="preset-div">
                    <Select
                        key={nanoid()}
                        name="none"
                        value="none"
                        clearTimer={props.clearTimer}
                        startTimer={props.startTimer}
                        presetObj={props.presetObj}
                        label={field.label}
                        endLabel={field.endLabel}
                    />
                    <Button
                        key={nanoid()}
                        presetSrc={field.btnPresetSrc}
                        size={field.btnSize}
                        label={field.btnLabel}
                        action={field.btnAction}
                        buttonPressed={buttonPressed}
                    />
                </div>
            )
        }

        if (inlineElementsArray && inlineElementsArray.length > 0) {
            return (
                <div className="inline-field" key={nanoid()}>
                    {returnArr}
                    {inlineElementsArray}
                </div>
            )
        } else {
            return returnArr
        }
    }

    //handle different field types
    const mappedFields = fields.map((field) => {
        return handleFieldTypes(field)

        // //handle all types of input
        // if (field.type === "plainText") {
        //     return <p className="fields" key={nanoid()}><span className="plain-text">{field.text}</span></p>
        // } else if (field.type === "mappedText") {
        //     if (field.mapping === "is_ldmp" && (!apiObjMissing && !fieldMapMissing)) {
        //         if (filteredStat && filteredStat[0].val == 1) {
        //             result = "LDMP"
        //         } else {
        //             result = "UDP"
        //         }
        //     }
        //     return <p className="fields" key={nanoid()}><span className="field-label">{field.label}</span>: {result}</p>
        // } else if (field.type === "video") {
        //     if (field.previewImageRoute) {
        //         return <Video key={nanoid()} location={endpoint} previewImageRoute={field.previewImageRoute}/>
        //     } else {
        //         return <p className="fields">
        //             <span className="error-text">Missing parameter for video preview: previewImageRoute</span></p>
        //     }
        // } else if (field.type ==="button") {
        //     if (field.applyPreset && field.applyPreset === "applyPreset") {
        //         isPresetBtn = true
        //     }
        //     //custom button rules
        //     if (field.mapping === "isStreaming") {
        //         if (filteredStat && filteredStat[0].val == 1) {
        //             result = "Stop Streaming"
        //         } else {
        //             result = "Start Streaming"
        //         }
        //     } else {
        //         result = field.label
        //     }
        //     if (isForm) {
        //         return <Button key={nanoid()} postEndpoint={container.postEndpoint} size={field.size} label={result} action={field.action} buttonPressed={buttonPressed}/>
        //     } else if (isPresetBtn) {
        //         return <Button key={nanoid()} presetSrc={field.presetSrc} size={field.size} label={result} action={field.action} buttonPressed={buttonPressed}/>
        //     } else {
        //         return <Button key={nanoid()} size={field.size} label={result} action={field.action} buttonPressed={buttonPressed}/>
        //     }
        // } else if (field.type === "input") {
        //     if (filteredStat) {
        //         return <Input key={nanoid()} name={filteredStat[0].cname} clearTimer={props.clearTimer} startTimer={props.startTimer} endLabel={field.endLabel} label={field.label} value={filteredStat[0].val} />
        //     }
        // } else if (field.type === "checkbox") {
        //     if (filteredStat) {
        //         return <Checkbox key={nanoid()} name={filteredStat[0].cname} label={field.label} checked={filteredStat[0].val} endLabel={field.endLabel} />
        //     }
        // } else if (field.type === "select") {
        //     if (filteredStat) {
        //         return <Select key={nanoid()} name={filteredStat[0].cname} clearTimer={props.clearTimer} startTimer={props.startTimer} subValues={filteredStat[0].sub_values} value={filteredStat[0].val} valLabels={filteredStat[0].val_labels} label={field.label} endLabel={field.endLabel} />
        //     }
        // } else if (field.type === "presetSelect" && props.presetObj) {
        //     return <div key={nanoid()} className="preset-div">
        //         <Select key={nanoid()} name="none" value="none" clearTimer={props.clearTimer} startTimer={props.startTimer} presetObj={props.presetObj} label={field.label} endLabel={field.endLabel} /><Button key={nanoid()} presetSrc={field.btnPresetSrc} size={field.btnSize} label={field.btnLabel} action={field.btnAction} buttonPressed={buttonPressed}/>
        //     </div>
        // }
    })

    if (container.backgroundColor) {
        style = { backgroundColor: container.backgroundColor }
    }

    if (container.containerStyle) {
        if (container.containerStyle.stretchVertically) {
            style = {
                ...style,
                gridRow: "span " + container.containerStyle.stretchVertically,
            }
        }

        if (container.containerStyle.stretchHorizontally) {
            style = {
                ...style,
                gridColumn:
                    "span " + container.containerStyle.stretchHorizontally,
                maxWidth: "none",
            }
        }
    }
    return (
        <div
            className={
                isMultiChannelSelection
                    ? "container multichannel-container"
                    : "container"
            }
            style={style}
        >
            <h4 className="container-title">
                {title}
                {isMultiChannelSelection && (
                    <button className="big-button multichannel-title-btn">
                        Open
                    </button>
                )}
            </h4>
            <hr />
            {isForm ? (
                <Form
                    mappedFields={mappedFields}
                    handleFormSubmit={handleFormSubmit}
                />
            ) : (
                mappedFields
            )}
        </div>
    )
}
