import React from "react"
import Video from "./Video"
import Button from "./Button"
import Input from "./Input"
import Checkbox from "./Checkbox"
import Select from "./Select"
import Form from "./Form"
import AudioMeter from "./AudioMeters"
import SessionsPanel from "./SessionsPanel"
import { isLocalDev, POSTData, setNetwork1Api } from "../Utils"

const endpoint = location.origin

export default function Container(props) {
    //console.log("Container rendered")
    const container = props.container
    const apiObj = props.apiObj
    const title = container.title
    const fields = container.fields
    const containerType = container.type
    let style = {}
    let fieldStyle = {}
    let isModule = false
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
        await POSTData(endpoint + "/REST/encoder/presets", {
            command: "apply",
            pid: pid,
        }).then((data) => {
            alert("Preset Changed Successfully")
            localStorage.setItem("presetPID", pid)
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

        await POSTData(endpoint + postEndpoint, { val_list: arr }).then(
            (data) => {
                console.log(
                    "Data POSTED to " +
                        endpoint +
                        postEndpoint +
                        ": " +
                        JSON.stringify(data)
                )
                alert("Changes have been applied")
                localStorage.setItem("presetPID", "custom")
                props.triggerBackgroundFetch()
            }
        )

        if (
            postEndpoint === "/REST/encoder/metadata" ||
            postEndpoint === "/REST/encoder/metadata.json"
        ) {
            localStorage.removeItem("sessionDRM")
            localStorage.removeItem("sessionID")
        }
    }

    async function startStreaming() {
        let response = ""
        if (isLocalDev) {
            response = await fetch(endpoint + "/REST/encoder/metadata.json")
        } else {
            response = await fetch(endpoint + "/REST/encoder/metadata")
        }
        let metadataResult = await response.json()

        let networkObj = metadataResult.current_stat.filter(
            (res) => res.cname === "Meta_Network1"
        )

        const apiDRM = networkObj[0]["val"]

        if (
            localStorage.getItem("sessionDRM") !== undefined &&
            localStorage.getItem("sessionDRM") !== null &&
            localStorage.getItem("sessionDRM") !== ""
        ) {
            if (localStorage.getItem("sessionDRM") !== apiDRM) {
                if (
                    confirm(
                        "There is a mismatch between the session DRM and DRM on the encoder.  Would you like to set the encoder DRM to the session DRM?"
                    ) == true
                ) {
                    await setNetwork1Api(localStorage.getItem("sessionDRM"))
                }
            }
        }

        await POSTData(endpoint + "/REST/encoder/action", {
            action_list: ["start"],
        }).then((data) => {
            console.log("Streaming started" + JSON.stringify(data))
            props.triggerBackgroundFetch()
        })
    }

    async function stopStreaming() {
        await POSTData(endpoint + "/REST/encoder/action", {
            action_list: ["stop"],
        }).then((data) => {
            console.log("Streaming stopped" + JSON.stringify(data))
            props.triggerBackgroundFetch()
        })
    }

    function handleFieldTypes(field, index, fieldStyle) {
        let filteredStat
        let result
        let apiObjMissing = false
        let fieldMapMissing = false
        let isPlainText = field.type === "plainText" ? true : false

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
                    field.type !== "video" &&
                    field.type !== "presetSelect")
            ) {
                return (
                    <p className="fields" style={fieldStyle}>
                        <span className="field-label">{field.label}</span>:
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
                <p
                    className="fields"
                    key="${field.type}-${index}"
                    style={fieldStyle}
                >
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
                <p
                    className="fields"
                    key={`${field.label}-${index}`}
                    style={fieldStyle}
                >
                    <span className="field-label">{field.label}</span>: {result}
                </p>
            )
        } else if (field.type === "video") {
            if (field.previewImageRoute) {
                if (field.hasVUMeter) {
                    //get number of audio channels
                    let numChannels

                    try {
                        numChannels = apiObj.current_stat.filter(
                            (stat) => stat.cname === "AudioChannels"
                        )[0].val
                    } catch (err) {
                        alert(
                            "Please provide the audio REST endpoint in addition to the video REST endpoint.  This is required to render VU meters."
                        )
                        props.clearTimer()
                        props.openSettings()
                        return
                    }

                    returnArr = (
                        <div
                            key={`video-section-${index}`}
                            className="video-audio-meter-container"
                        >
                            <Video
                                key={`video-section-${index}`}
                                location={endpoint}
                                previewImageRoute={field.previewImageRoute}
                            />
                            <AudioMeter
                                key={`audio-section-${index}`}
                                location={endpoint}
                                audioLevelRoute={field.audioLevelEndpoint}
                                numChannels={numChannels}
                            />
                        </div>
                    )
                } else {
                    returnArr = (
                        <div
                            key={`video-section-${index}`}
                            className="video-audio-meter-container"
                        >
                            <Video
                                key={`video-section-${index}`}
                                location={endpoint}
                                previewImageRoute={field.previewImageRoute}
                            />
                        </div>
                    )
                }
            } else {
                returnArr = (
                    <p className="fields" style={fieldStyle}>
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
                        key={`button-${index}`}
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
                        key={`button-${index}`}
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
                            key={`input-${index}`}
                            name={filteredStat[0].cname}
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
                            key={`checkbox-${index}`}
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
                            key={`select-${index}`}
                            name={filteredStat[0].cname}
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
                <div key={`preset-div-${index}`} className="preset-div">
                    <Select
                        key={`select-${index}`}
                        name="none"
                        value="none"
                        presetObj={props.presetObj}
                        label={field.label}
                        endLabel={field.endLabel}
                    />
                    <Button
                        key={`preset-btn-${index}`}
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
                <div className="inline-field" key={`inline-${index}`}>
                    {returnArr}
                    {inlineElementsArray}
                </div>
            )
        } else {
            return returnArr
        }
    }

    //set container styles
    if (container.containerStyle) {
        if (container.containerStyle.backgroundColor) {
            style = {
                ...style,
                backgroundColor: container.containerStyle.backgroundColor,
            }
        }
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
        if (container.containerStyle.lineSpacing) {
            fieldStyle = {
                ...fieldStyle,
                margin: container.containerStyle.lineSpacing + " 2em",
            }
        }
    }

    let mappedFields = ""
    //handle different field types
    if (fields) {
        mappedFields = fields.map((field, index) => {
            return handleFieldTypes(field, index, fieldStyle)
        })
    } else {
        //handle different modules
        isModule = true

        if (containerType === "sessionsPanel") {
            mappedFields = (
                <SessionsPanel
                    sessionDashXML={props.sessionDashXML}
                    handleCreateNewSessionBtn={props.handleCreateNewSessionBtn}
                />
            )
        }
    }

    return isModule ? (
        <div className="container" style={style}>
            {mappedFields}
        </div>
    ) : (
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
                <div className="fields-container">{mappedFields}</div>
            )}
        </div>
    )
}
