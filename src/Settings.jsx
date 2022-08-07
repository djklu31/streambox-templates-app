import React, {useState, useEffect} from "react"
import { nanoid } from 'nanoid'

export default function Settings(props) {

    const [templateOptions, setTemplateOptions] = useState();
    const [currentTemplateName, setcurrentTemplateName] = useState(localStorage.getItem("templateName") ? localStorage.getItem("templateName") : "none")
    const [currentEditTemplateName, setCurrentEditTemplateName] = useState("")
    const [saveDisabled, setSaveDisabled] = useState(true)

    useEffect(async () => {
        let response = await fetch('http://localhost:5005/templates')
        let json = await response.json();
        if (currentTemplateName === "none" && json.templates && (json.templates).length > 0) {
            //set json template to first template
            const firstTemplate = json.templates[0]
            localStorage.setItem("templateName", firstTemplate)
            setcurrentTemplateName(firstTemplate)
        } else if (currentTemplateName === "none") {
            alert("No templates found on server")
        }
        let templateOptions = (json.templates).map((template) => <option value={template}>{template}</option>)
        templateOptions.unshift(<option value="none">Choose One</option>)
        setTemplateOptions(templateOptions)
        console.log(templateOptions)
    }, [], currentTemplateName)

    function applyTemplate(e) {
        e.preventDefault()
        const selectedTemplate = e.target[0].value
        if (selectedTemplate !== "none") {
            //save template name in local storage
            localStorage.setItem('templateName', selectedTemplate)
            setcurrentTemplateName(selectedTemplate)
            props.handleChangeTemplate(selectedTemplate)
            alert('Template Applied')
        }
    }

    async function editTemplate(e) {
        e.preventDefault()
        const selectedTemplate = e.target[0].value
        if (selectedTemplate !== "none") {
            let response = await fetch(`http://localhost:5005/templates/${selectedTemplate}`)
            let json = await response.json();
            const prettyJson = JSON.stringify(json, undefined, 2)
            document.querySelector(".edit-template-area").innerHTML = prettyJson
            setSaveDisabled(false)
            setCurrentEditTemplateName(selectedTemplate)
        }
    }

    async function saveTemplate() {
        //send request to node server to save current template
        let response = await fetch('http://localhost:5005/templates/', {
            method: 'POST',
            headers: {
            "content-type": "application/json"
            },
            body: JSON.stringify({template: document.querySelector('.edit-template-area').value, templateName: currentEditTemplateName})
        })
    }

    async function createTemplate(e) {
        e.preventDefault()
        const templateName = document.querySelector(".create-template-input").value
        let response = await fetch('http://localhost:5005/templates/', {
            method: 'POST',
            headers: {
            "content-type": "application/json"
            },
            body: JSON.stringify({template: document.querySelector('.edit-template-area').value, templateName: templateName + ".json"})
        })
    }

    function handleSaveTemplateBtn(e) {
        let value = e.target.value;
        if (value === "none") {
            setSaveDisabled(true)
        }
    }

    return <>
        <div className="settings-outer-container">
            <div className="settings-container">
                <div className="current-template-readout template-form-padding">
                    <label>Current Template:</label>&nbsp;
                    <span style={{color: "forestgreen"}}>{currentTemplateName}</span>
                </div>
                <form className="settings-form template-form-padding" onSubmit={applyTemplate}>
                    <select className="settings-select">
                        {templateOptions}
                    </select>
                    <input type="submit" value="Apply Template" />
                </form>

                <form className="settings-form" onSubmit={editTemplate}>
                    <select onChange={handleSaveTemplateBtn} className="settings-select">
                        {templateOptions}
                    </select>
                    <input type="submit" value="Edit Template" />
                </form>
                <button className="save-template-btn template-form-padding" onClick={saveTemplate} disabled={saveDisabled}>Save Template</button>

                <form className="settings-form" onSubmit={createTemplate}>
                    <input className="create-template-input" type="text" placeholder="Template Name..." />
                    <input type="submit" value="Create Template" />
                </form>
            </div>  
            <textarea className="edit-template-area" placeholder="JSON template will populate here upon selection...">
            </textarea>
        </div>
    </>
}