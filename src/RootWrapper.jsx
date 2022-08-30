import React, { useState, useEffect } from "react";
import App from "./App";
import Navbar from "./components/Navbar";
import Settings from "./Settings";
//import customTemplate from '/public/templates/devTemplate.json' //dev template

export default function RootWrapper() {
    //is this in dev environment or prod?
    let isLocalDev = false;

    //set up initial state with template
    //const [currentTemplate, setCurrentTemplate] = useState(customTemplate)
    //const navBtns = currentTemplate.template.navbar.routes
    const [currentTemplate, setCurrentTemplate] = useState([]);
    const [templateName, setTemplateName] = useState(
        localStorage.getItem("templateName")
    );
    const [navBtns, setNavBtns] = useState([]);
    const [isSettings, setIsSettings] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    //const [isLoading, setIsLoading] = useState(false)
    //const [currentPageName, setCurrentPageName] = useState(navBtns[0].routeName)
    const [currentPageName, setCurrentPageName] = useState("");
    let endpoint = "";

    //if developing on local machine
    if (isLocalDev) {
        const hostname = "54.151.83.113";
        //moving port number
        const port = "5481";
        endpoint = `http://${hostname}:${port}`;
    } else {
        endpoint = location.origin;
    }

    function handleChangeTemplate(selectedTemplate) {
        setTemplateName(selectedTemplate);
    }

    function changeRoute(routeName) {
        setCurrentPageName(routeName);
    }

    function openSettings() {
        setIsSettings(true);
        setCurrentPageName("Settings");
    }

    async function getTemplate() {
        if (localStorage.getItem("templateName")) {
            try {
                let response = await fetch(
                    `${endpoint}/REST/templates/${localStorage.getItem(
                        "templateName"
                    )}`
                );
                let json = await response.json();

                setCurrentTemplate(JSON.stringify(json));
                setNavBtns(json.template.navbar.routes);

                if (isSettings) {
                    setCurrentPageName("Settings");
                } else {
                    setCurrentPageName(
                        json.template.navbar.routes[0].routeName
                    );
                }
            } catch (err) {
                alert(
                    "There was a problem with the JSON file. Please choose another."
                );
                setCurrentTemplate([]);
                setNavBtns([]);
                openSettings(true);
                setIsLoading(false);
            }
            setIsLoading(false);
        } else {
            //if no templates are set in storage, set the first one. if none exist on the server throw an alert
            // let response = await fetch(`${endpoint}/REST/templates/_list`)
            // let json = await response.json();
            // console.log(json)
            setCurrentTemplate([]);
            setNavBtns([]);
            openSettings(true);
            setIsLoading(false);

            // if (json.templates && (json.templates).length > 0) {
            //     //set json template to first template
            //     const firstTemplate = json.templates[0]
            //     localStorage.setItem("templateName", firstTemplate)
            //     getTemplate()
            // } else if (currentTemplate === "none") {
            //     alert("No templates found on server")
            // }
        }
    }

    // useEffect(async () => {
    //     //check authorization
    //     const response = await fetch(`http://${hostname}:${port}/REST/templates/_list`)
    //     const status = await response.text()
    //     console.log(status)
    // }, [])

    useEffect(() => {
        getTemplate();
    }, [templateName]);

    useEffect(() => {
        const navBtnDOMObj = document.getElementsByClassName("nav-btn");
        //highlight link
        for (let i = 0; i < navBtnDOMObj.length; i++) {
            if (navBtnDOMObj[i].innerText === currentPageName) {
                navBtnDOMObj[i].classList.add("selected-route");
                if (isSettings) {
                    setIsSettings(false);
                    document
                        .querySelector(".settings-btn")
                        .classList.remove("selected-route");
                }
            }
        }
    }, [currentPageName]);

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
                    {/* <App currentPageName={currentPageName} currentTemplate={currentTemplate} />} */}
                </>
            )}
        </>
    );
}
