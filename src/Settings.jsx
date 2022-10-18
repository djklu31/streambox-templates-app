import React, { useState, useEffect } from "react"
import "./styles/setting-style.css"
import ReactTooltip from "react-tooltip"
import { isLocalDev } from "./Utils"

export default function Settings(props) {
    const [templateOptions, setTemplateOptions] = useState([])
    const [currentTemplateName, setCurrentTemplateName] = useState(
        localStorage.getItem("templateName")
            ? localStorage.getItem("templateName")
            : "none"
    )
    const [currentEditTemplateName, setCurrentEditTemplateName] = useState("")
    const [saveDisabled, setSaveDisabled] = useState(true)
    const [deleteDisabled, setDeleteDisabled] = useState(true)
    const [isRerender, setIsRerender] = useState(false)
    const endpoint = props.endpoint

    //check if any url params present for userid
    //if no url params passed in, check if local storage set with these vals
    //if there are, then check against the 'db'
    //if they match, then set local storage with these vals
    //logout should destroy local storage for userid and pass

    useEffect(() => {
        document.querySelector(".settings-btn").classList.add("selected-route")
        if (isRerender) {
            //reset all fields on settings rerender
            document.querySelector(".create-template-input").value = ""
            document.querySelector(".edit-template-area").value = ""
            document.getElementById("file-input").value = ""
            let selects = document.getElementsByClassName("settings-select")
            for (let select of selects) {
                select.value = "none"
            }
            setSaveDisabled(true)
            setDeleteDisabled(true)
            setIsRerender(false)
        }

        const fetchData = async () => {
            let response = ""
            try {
                response = await fetch(`${endpoint}/REST/templates/_list`)
            } catch (err) {
                alert(
                    "There was a problem retrieving templates from the server."
                )
                return
            }
            let json = await response.json()
            if (currentTemplateName === "none" && json && json.length > 0) {
                alert(
                    "No template is selected.  Please choose one and apply the template."
                )
            } else if (currentTemplateName === "none") {
                alert("No templates found on server. Please create some.")
            }
            let templateOptionsArr = json.map((template, index) => (
                <option key={`template-option-${index}`} value={template.name}>
                    {template.name}
                </option>
            ))
            templateOptionsArr.unshift(
                <option key={`template-option-default`} value="none">
                    Choose One
                </option>
            )
            setTemplateOptions(templateOptionsArr)
        }
        fetchData()
    }, [currentTemplateName, isRerender])

    function applyTemplate(e) {
        e.preventDefault()
        const selectedTemplate = e.target[0].value
        if (selectedTemplate !== "none") {
            //save template name in local storage
            localStorage.setItem("templateName", selectedTemplate)
            setCurrentTemplateName(selectedTemplate)
            props.handleChangeTemplate(selectedTemplate)
            alert("Template Applied")
        }
    }

    async function deleteTemplate() {
        if (
            confirm(
                "Are you sure you want to delete " + currentEditTemplateName
            )
        ) {
            let response = await fetch(
                `${endpoint}/REST/templates/${currentEditTemplateName}`,
                {
                    method: "DELETE",
                }
            )
            let text = await response.text()
            let parsedText = JSON.parse(text)

            if (parsedText.errmsg === "deleted") {
                alert(currentEditTemplateName + " has been deleted")
            } else {
                alert("Error deleting " + currentEditTemplateName)
            }
            setIsRerender(true)
        }
    }

    function isDefaultTemplate(templateName) {
        if (
            //these should never be altered
            templateName === "Colorful Prod Template (Default - Read-only)" ||
            templateName === "Dark Prod Template (Default - Read-only)" ||
            templateName === "Light Prod Template (Default - Read-only)"
        ) {
            return true
        }

        return false
    }

    async function editTemplate(e) {
        e.preventDefault()
        const selectedTemplate = e.target[0].value
        if (selectedTemplate !== "none") {
            let response = await fetch(
                `${endpoint}/REST/templates/${selectedTemplate}`
            )
            let json
            try {
                json = await response.json()
            } catch (e) {
                document.querySelector(".edit-template-area").value =
                    "This JSON file is not formatted correctly"
                return
            }
            const prettyJson = JSON.stringify(json, undefined, 2)
            document.querySelector(".edit-template-area").value = prettyJson
            document.querySelector(
                ".template-area-status"
            ).textContent = `Editing template: ${selectedTemplate}`
            isDefaultTemplate(selectedTemplate)
                ? setSaveDisabled(true)
                : setSaveDisabled(false)

            setCurrentEditTemplateName(selectedTemplate)
        }
    }

    async function saveTemplate() {
        //send request to node server to save current template
        if (
            confirm(
                "Are you sure you want to save template: " +
                    currentEditTemplateName
            )
        ) {
            let formData = new FormData()
            formData.append("filename", currentEditTemplateName)
            formData.append(
                "filedata",
                document.querySelector(".edit-template-area").value
            )

            let response = await fetch(`${endpoint}/REST/templates/newfile`, {
                method: "POST",
                body: formData,
            })
            let text = await response.text()
            let parsedText = JSON.parse(text)

            if (parsedText.errmsg === "written") {
                alert("Saved edited template: " + currentEditTemplateName)
            } else {
                alert("Error saving template")
            }

            setIsRerender(true)
        }
    }

    async function createTemplate(e) {
        e.preventDefault()
        const templateName = document.querySelector(
            ".create-template-input"
        ).value
        let formData = new FormData()
        formData.append("filename", templateName)
        formData.append(
            "filedata",
            document.querySelector(".edit-template-area").value
        )
        let response = await fetch(`${endpoint}/REST/templates/newfile`, {
            method: "POST",
            body: formData,
        })

        let text = await response.text()
        let parsedText = JSON.parse(text)

        if (parsedText.errmsg === "written") {
            alert("Created new template: " + templateName)
        } else {
            alert("Error creating template")
        }

        setIsRerender(true)
    }

    function handleSaveTemplateBtn(e) {
        let value = e.target.value
        if (value === "none") {
            setSaveDisabled(true)
            setDeleteDisabled(true)
            setCurrentEditTemplateName("none")
        } else if (isDefaultTemplate(value)) {
            setSaveDisabled(true)
            setDeleteDisabled(true)
        } else {
            setSaveDisabled(false)
            setCurrentEditTemplateName(value)
            setDeleteDisabled(false)
        }
    }

    async function handleUploadSubmit(e) {
        e.preventDefault()
        let formData = new FormData()
        let fileInput = document.getElementById("file-input")
        formData.append("file", fileInput.files[0])
        console.log(fileInput.files[0])
        let response
        if (isLocalDev) {
            response = await fetch(
                "http://localhost:5005" + "/sbuiauth/receiveFile.php",
                {
                    method: "post",
                    body: formData,
                }
            ).catch(console.error)
        } else {
            response = await fetch(endpoint + "/sbuiauth/receiveFile.php", {
                method: "post",
                body: formData,
            }).catch(console.error)
        }

        let json = await response.text()
        let [responseText, extension] = JSON.parse(json)

        if (responseText === "success") {
            alert("File uploaded successfully")
            document.getElementsByClassName(
                "logo"
            )[0].src = `${endpoint}/sbuiauth/logo/logo${extension}`
        } else if (responseText === "failure") {
            alert("Invalid file format. Please use .svg, .png or .jpg files.")
        }
    }

    return (
        <>
            <ReactTooltip />
            <div className="settings-outer-container">
                <div className="settings-inner-container">
                    <div className="settings-container">
                        <div className="current-template-readout template-form-padding">
                            <label>Current Template:</label>&nbsp;
                            <span style={{ color: "forestgreen" }}>
                                {currentTemplateName}
                            </span>
                        </div>
                        <div className="settings-label">
                            <label className="template-label">
                                <h4>Apply Template</h4>
                                <img
                                    className="tooltip"
                                    src="../../images/information.png"
                                    data-tip="
                            Choose and apply a template.
                        "
                                />
                            </label>
                        </div>
                        <form
                            className="settings-form template-form-padding"
                            onSubmit={applyTemplate}
                        >
                            <select className="settings-select">
                                {templateOptions}
                            </select>
                            <input type="submit" value="Apply Template" />
                        </form>

                        <div className="settings-label">
                            <label className="template-label">
                                <h4>Upload Logo</h4>
                                <img
                                    className="tooltip"
                                    src="../../images/information.png"
                                    data-tip="
                            Upload a logo (.svg, .png, .jpg)
                        "
                                />
                            </label>
                        </div>

                        <form id="form">
                            <input type="file" id="file-input" />
                            <input
                                onClick={(e) => handleUploadSubmit(e)}
                                type="submit"
                                id="submit-btn"
                            />
                        </form>

                        <div className="settings-label">
                            <label className="template-label">
                                <h4>Edit Template</h4>
                                <img
                                    className="tooltip"
                                    src="../../images/information.png"
                                    data-tip="
                            Edit, overwrite, or delete a template. When a file is chosen from the dropdown, the file can be edited in the 'Template area'.
                        "
                                />
                            </label>
                        </div>
                        <form className="settings-form" onSubmit={editTemplate}>
                            <select
                                onChange={handleSaveTemplateBtn}
                                className="settings-select"
                            >
                                {templateOptions}
                            </select>
                            <input type="submit" value="Edit Template" />
                        </form>
                        <button
                            className="save-template-btn"
                            onClick={saveTemplate}
                            disabled={saveDisabled}
                        >
                            Save Template
                        </button>
                        <button
                            className="save-template-btn template-form-padding"
                            onClick={deleteTemplate}
                            disabled={deleteDisabled}
                        >
                            Delete Template
                        </button>
                        <div className="settings-label">
                            <label className="template-label">
                                <h4>Create Template</h4>
                                <img
                                    className="tooltip"
                                    src="/images/information.png"
                                    data-tip="
                            Create a JSON template using the text area 'Template area'.
                        "
                                />
                            </label>
                        </div>
                        <form
                            className="settings-form"
                            onSubmit={createTemplate}
                        >
                            <input
                                className="create-template-input"
                                type="text"
                                placeholder="Template Name..."
                            />
                            <input type="submit" value="Create Template" />
                        </form>
                    </div>
                    <div className="template-area-div">
                        <div className="template-area-label-div">
                            <label className="template-area-label">
                                <h3>Template area (create/edit)</h3>
                            </label>
                            <label className="template-area-status-label">
                                <h5 className="template-area-status"></h5>
                            </label>
                        </div>
                        <textarea
                            className="edit-template-area"
                            placeholder="JSON template will populate here upon selection..."
                        ></textarea>
                    </div>
                </div>
            </div>
        </>
    )
}
