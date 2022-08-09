import React, {useState, useEffect} from 'react'
import App from './App'
import Navbar from './components/Navbar'
import Settings from './Settings'

export default function RootWrapper() {
    //set up initial state with template
    // const [currentTemplate, setCurrentTemplate] = useState(customTemplate)
    // const navBtns = currentTemplate.template.navbar.routes
    const [currentTemplate, setCurrentTemplate] = useState([])
    const [templateName, setTemplateName] = useState(localStorage.getItem('templateName'))
    const [navBtns, setNavBtns] = useState([])
    const [isSettings, setIsSettings] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    // const [currentPageName, setCurrentPageName] = useState(navBtns[0].routeName)
    const [currentPageName, setCurrentPageName] = useState("")

    function handleChangeTemplate(selectedTemplate) {
        setTemplateName(selectedTemplate)
    }

    function changeRoute(routeName) {
        setCurrentPageName(routeName)
    }

    function openSettings() {
        setIsSettings(true)
        setCurrentPageName("Settings")
        document.querySelector(".settings-btn").classList.add("selected-route")
    }

    async function getTemplate() {
        if (localStorage.getItem("templateName")) {
            let response = await fetch(`http://localhost:5005/templates/${localStorage.getItem("templateName")}`)
            let json = await response.json();

            //if bad json template, go on to next
            setCurrentTemplate(JSON.stringify(json))
            setNavBtns(json.template.navbar.routes)
            if (isSettings) {
                setCurrentPageName("Settings")
            } else {
                setCurrentPageName(json.template.navbar. routes[0].routeName)
            }
            setIsLoading(false)
        } else {
            //if no templates are set in storage, set the first one. if none exist on the server throw an alert
            let response = await fetch('http://localhost:5005/templates')
            let json = await response.json();
            
            if (json.templates && (json.templates).length > 0) {
                //set json template to first template
                const firstTemplate = json.templates[0]
                localStorage.setItem("templateName", firstTemplate)
                getTemplate()
            } else if (currentTemplate === "none") {
                alert("No templates found on server")
            }
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
                    document.querySelector(".settings-btn").classList.remove("selected-route")
                }
            }
        }
    }, [currentPageName])
    
    return (
        <>
            {isLoading ? "IS LOADING" : 
                <>
                    <Navbar changeRoute={changeRoute} openSettings={openSettings} currentPageName={currentPageName} navBtns={navBtns}/>
                    {isSettings ? <Settings handleChangeTemplate={handleChangeTemplate} /> :
                    <App currentPageName={currentPageName} currentTemplate={JSON.parse(currentTemplate)} />}
                </>
            }
        </>
    )
}