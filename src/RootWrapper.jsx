import React, { useState, useEffect } from "react"
import App from "./App"
import Navbar from "./components/Navbar"
import Settings from "./Settings"
import { isLocalDev, getRestEndpoint } from "./Utils"
import testTemplate from "../public/DevTemplates/Dark-Encoder2 Dev.json"
// import testTemplate from "../public/devTemplates/Multiplex Light Dev Template.json"
const endpoint = getRestEndpoint()

export default function RootWrapper() {
    //set up initial state with template
    const [currentTemplate, setCurrentTemplate] = useState([])
    const [templateName, setTemplateName] = useState(
        localStorage.getItem("useDefaultTemplate") === "true"
            ? localStorage.getItem("defaultTemplate")
            : localStorage.getItem("templateName")
    )
    const [navBtns, setNavBtns] = useState([])
    const [isSettings, setIsSettings] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [currentPageName, setCurrentPageName] = useState("")

    if (localStorage.getItem("defaultTemplate") === undefined) {
        localStorage.setItem(
            "defaultTemplate",
            "Dark Prod Template (Read-only)"
        )
    }

    async function handleChangeTemplate() {
        await getTemplate()
    }

    function changeRoute(routeName) {
        setCurrentPageName(routeName)
    }

    function openSettings() {
        setIsSettings(true)
        setCurrentPageName("Settings")
    }

    async function replaceJSVarsInTemplate(template) {
        let response
        let jsVariables
        if (isLocalDev) {
            response = await import(`${location.origin}/JSIncludes`)
            jsVariables = response.jsVariables
        } else {
            response = await import(
                `${location.origin}/${location.pathname}/JSIncludes.js`
            )
            jsVariables = response.jsVariables
        }
        let jsVarsObjEntries = Object.entries(jsVariables)
        let JSONString = JSON.stringify(template)

        for (let [key, val] of jsVarsObjEntries) {
            let formattedKey = `@${key}@`

            JSONString = JSONString.replaceAll(formattedKey, val)
        }

        return JSON.parse(JSONString)
    }

    async function getTemplate() {
        //TODO: probably preprocess js include file here before applying template
        let useDefaultTemplate = localStorage.getItem("useDefaultTemplate")
        let template =
            useDefaultTemplate === "true"
                ? localStorage.getItem("defaultTemplate")
                : localStorage.getItem("templateName")

        if (template) {
            if (isLocalDev) {
                let json = testTemplate
                let formattedTemplate = await replaceJSVarsInTemplate(json)
                setCurrentTemplate(JSON.stringify(formattedTemplate))
                setNavBtns(formattedTemplate.template.navbar.routes)
                setCurrentPageName(
                    formattedTemplate.template.navbar.routes[0].routeName
                )
                setIsLoading(false)
            } else {
                try {
                    let response = await fetch(
                        `${endpoint}/REST/templates/${template}`
                    )
                    let json = await response.json()
                    let formattedTemplate = await replaceJSVarsInTemplate(json)

                    setCurrentTemplate(JSON.stringify(formattedTemplate))
                    setNavBtns(formattedTemplate.template.navbar.routes)

                    if (isSettings) {
                        setCurrentPageName("Settings")
                    } else {
                        setCurrentPageName(
                            formattedTemplate.template.navbar.routes[0]
                                .routeName
                        )
                    }
                } catch (err) {
                    alert(
                        "There was a problem with the JSON file. Please choose another."
                    )
                    setCurrentTemplate([])
                    setNavBtns([])
                    openSettings(true)
                    setIsLoading(false)
                }
                setIsLoading(false)
            }
        } else {
            //set json template to fallback if none are chosen
            let fallbackTemplateName = isLocalDev
                ? "Dark Dev Template"
                : "Dark Prod Template (Read-only)"

            useDefaultTemplate === "true"
                ? localStorage.setItem("defaultTemplate", fallbackTemplateName)
                : localStorage.setItem("templateName", fallbackTemplateName)
            setTemplateName(fallbackTemplateName)

            // setCurrentTemplate([])
            // setNavBtns([])
            // openSettings(true)
            // setIsLoading(false)
        }

        if (
            localStorage.getItem("cloudServer") === "" ||
            localStorage.getItem("cloudServer") === undefined ||
            localStorage.getItem("cloudServer") === null
        ) {
            localStorage.setItem("cloudServer", "LivePOST")
        }
    }

    useEffect(() => {
        getTemplate()
    }, [templateName])

    useEffect(() => {
        const navBtnDOMObj = document.getElementsByClassName("nav-btn")
        //highlight link
        for (let i = 0; i < navBtnDOMObj.length; i++) {
            if (navBtnDOMObj[i].innerText === currentPageName) {
                navBtnDOMObj[i].classList.add("selected-route")
                if (isSettings) {
                    setIsSettings(false)
                    document
                        .querySelector(".settings-btn")
                        .classList.remove("selected-route")
                }
            }
        }
    }, [currentPageName])

    return (
        <>
            {isLoading ? (
                <div className="roller-container">
                    <div className="lds-roller">
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
                </div>
            ) : (
                <>
                    <Navbar
                        changeRoute={changeRoute}
                        openSettings={openSettings}
                        currentPageName={currentPageName}
                        navBtns={navBtns}
                    />
                    {isSettings ? (
                        <Settings
                            endpoint={endpoint}
                            handleChangeTemplate={handleChangeTemplate}
                        />
                    ) : (
                        <App
                            openSettings={openSettings}
                            currentPageName={currentPageName}
                            currentTemplate={JSON.parse(currentTemplate)}
                        />
                    )}
                </>
            )}
        </>
    )
}
