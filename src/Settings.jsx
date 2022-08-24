import React, {useState, useEffect} from "react"
import { nanoid } from 'nanoid'
import './styles/setting-style.css'
import ReactTooltip from 'react-tooltip';

export default function Settings(props) {
    const [templateOptions, setTemplateOptions] = useState([]);
    const [currentTemplateName, setCurrentTemplateName] = useState(localStorage.getItem("templateName") ? localStorage.getItem("templateName") : "none")
    const [currentEditTemplateName, setCurrentEditTemplateName] = useState("")
    const [saveDisabled, setSaveDisabled] = useState(true)
    const [deleteDisabled, setDeleteDisabled] = useState(true)
    const [isRerender, setIsRerender] = useState(false)
    const endpoint = props.endpoint

    useEffect(async () => {
        document.querySelector(".settings-btn").classList.add("selected-route")
        if (isRerender) {
            //reset all fields on settings rerender
            document.querySelector(".create-template-input").value = ""
            document.querySelector(".edit-template-area").value = ""
            let selects = document.getElementsByClassName("settings-select")
            for (let select of selects) {
                select.value = null
            }
            setSaveDisabled(true)
            setDeleteDisabled(true)
            setIsRerender(false)
        }
        let response = await fetch(`${endpoint}/REST/templates/_list`)
        let json = await response.json();
        if (currentTemplateName === "none" && json && json.length > 0) {
            //set json template to first template
            alert("No template is selected.  Please choose one and apply the template.")
        } else if (currentTemplateName === "none") {
            alert("No templates found on server. Please create some.")
        }
        let templateOptionsArr = (json).map((template) => <option key={nanoid()} value={template.name}>{template.name}</option>)
        templateOptionsArr.unshift(<option key={nanoid()} value="none">Choose One</option>)
        setTemplateOptions(templateOptionsArr)
    }, [currentTemplateName, isRerender])

    function applyTemplate(e) {
        e.preventDefault()
        const selectedTemplate = e.target[0].value
        if (selectedTemplate !== "none") {
            //save template name in local storage
            localStorage.setItem('templateName', selectedTemplate)
            setCurrentTemplateName(selectedTemplate)
            props.handleChangeTemplate(selectedTemplate)
            alert('Template Applied')
        }
    }

    async function deleteTemplate() {
        if (confirm ("Are you sure you want to delete " + currentEditTemplateName)) {
            let response = await fetch(`${endpoint}/REST/templates/${currentEditTemplateName}`, {
                method: 'DELETE'
            })
            let text = await response.text()
            let parsedText = JSON.parse(text)

            if (parsedText.errmsg === "deleted") {
                alert(currentEditTemplateName + " has been deleted")
            } else {
                alert("Error deleting " + currentEditTemplateName + ": " + parsedText.errMsg)
            }
            setIsRerender(true)
        }
    }

    async function editTemplate(e) {
        e.preventDefault()
        const selectedTemplate = e.target[0].value
        if (selectedTemplate !== "none") {
            let response = await fetch(`${endpoint}/REST/templates/${selectedTemplate}`)
            let json = await response.json();
            const prettyJson = JSON.stringify(json, undefined, 2)
            document.querySelector(".edit-template-area").value = prettyJson
            setSaveDisabled(false)
            setCurrentEditTemplateName(selectedTemplate)
        }
    }

    async function saveTemplate() {
        //send request to node server to save current template
        if (confirm('Are you sure you want to save template: ' + currentEditTemplateName)) {
            let formData = new FormData()
            formData.append("filename", currentEditTemplateName)
            formData.append("filedata", document.querySelector('.edit-template-area').value)

            let response = await fetch(`${endpoint}/REST/templates/newfile`, {
                method: 'POST',
                body: formData
            })
            let text = await response.text()
            let parsedText = JSON.parse(text)

            if (parsedText.errmsg === "written") {
                alert('Saved edited template: ' + currentEditTemplateName)
                setIsRerender(true)
            } else {
                alert('Error creating template: ' + text.errmsg)
            }

            setIsRerender(true)
        }
    }

    async function createTemplate(e) {
        e.preventDefault()
        const templateName = document.querySelector(".create-template-input").value
        let formData = new FormData()
        formData.append("filename", templateName)
        formData.append("filedata", document.querySelector('.edit-template-area').value)
        let response = await fetch(`${endpoint}/REST/templates/newfile`, {
            method: 'POST',
            body: formData
        })

        let text = await response.text()
        let parsedText = JSON.parse(text)

        if (parsedText.errmsg === "written") {
            alert('Created new template: ' + templateName)
            setIsRerender(true)
        } else {
            alert('Error creating template: ' + text.errmsg)
        }

        setIsRerender(true)
    }

    function handleSaveTemplateBtn(e) {
        let value = e.target.value;
        if (value === "none") {
            setSaveDisabled(true)
            setDeleteDisabled(true)
            setCurrentEditTemplateName("none")
        } else {
            setCurrentEditTemplateName(value)
            setDeleteDisabled(false)
        }
    }

    return <>
        <ReactTooltip />
        <div className="settings-outer-container">
            <div className="settings-container">
                <div className="current-template-readout template-form-padding">
                    <label>Current Template:</label>&nbsp;
                    <span style={{color: "forestgreen"}}>{currentTemplateName}</span>
                </div>
                <div className="settings-label">
                    <label className="template-label">
                        <h4>Apply Template</h4>
                        <img className="tooltip" src="../../images/information.png" data-tip="
                            Choose and apply a template.
                        "/>
                    </label>
                </div>
                <form className="settings-form template-form-padding" onSubmit={applyTemplate}>
                    <select className="settings-select">
                        {templateOptions}
                    </select>
                    <input type="submit" value="Apply Template" />
                </form>
                <div className="settings-label">
                    <label className="template-label">
                        <h4>Edit Template</h4>
                        <img className="tooltip" src="../../images/information.png" data-tip="
                            Edit, overwrite, or delete a template. When a file is chosen from the dropdown, the file can be edited in the 'Template area'.
                        "/>
                    </label>
                </div>
                <form className="settings-form" onSubmit={editTemplate}>
                    <select onChange={handleSaveTemplateBtn} className="settings-select">
                        {templateOptions}
                    </select>
                    <input type="submit" value="Edit Template" />
                </form>
                <button className="save-template-btn" onClick={saveTemplate} disabled={saveDisabled}>Save Template</button>
                <button className="save-template-btn template-form-padding" onClick={deleteTemplate} disabled={deleteDisabled}>Delete Template</button>
                <div className="settings-label">
                    <label className="template-label">
                        <h4>Create Template</h4><img className="tooltip" src="../../images/information.png" data-tip="
                            Create a JSON template using the text area 'Template area'.
                        "/>
                    </label>
                </div>
                <form className="settings-form" onSubmit={createTemplate}>
                    <input className="create-template-input" type="text" placeholder="Template Name..." />
                    <input type="submit" value="Create Template" />
                </form>
            </div>  
            <div className="template-area-div">
                <div>
                    <label className="template-area-label">
                        <h3>
                            Template area (create/edit)
                        </h3>
                    </label>
                </div>
                <textarea className="edit-template-area" placeholder="JSON template will populate here upon selection...">
                </textarea>
            </div>
        </div>
    </>
}