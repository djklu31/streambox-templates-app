import React, {useState, useEffect} from 'react'
import App from './App'
import Navbar from './components/Navbar'
//import customTemplate from '/public/templates/devTemplate.json' //dev template
import customTemplate from '/public/templates/template.json' //prod template
//import customTemplate from '/public/templates/temporaryTemplate.json'

export default function RootWrapper() {
    //set up initial state with template
    const [currentTemplate, setCurrentTemplate] = useState(customTemplate)

    const navBtns = currentTemplate.template.navbar.routes
    const [currentPageName, setCurrentPageName] = useState(navBtns[0].routeName)

    function changeRoute(routeName) {
        setCurrentPageName(routeName)
    }

    useEffect(() => {
        const navBtnDOMObj = document.getElementsByClassName("nav-btn")
        //highlight link
        for (let i = 0; i < navBtnDOMObj.length; i++) {
            if (navBtnDOMObj[i].innerText === currentPageName) {
                navBtnDOMObj[i].classList.add("selected-route")
            }
        }
    }, [currentPageName])
    
    return (
        <>
            <Navbar changeRoute={changeRoute} currentPageName={currentPageName} navBtns={navBtns}/>
            <App currentPageName={currentPageName} currentTemplate={customTemplate} />
        </>
    )
}