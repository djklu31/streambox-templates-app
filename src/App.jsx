import React, {useState, useEffect} from "react"
import Navbar from "./components/Navbar"
import Container from "./components/Container"
import customTemplate from '/public/templates/devTemplate.json'
import { nanoid } from 'nanoid'

export default function App() {
  //set up initial state
  const [currentTemplate, setCurrentTemplate] = useState(customTemplate)

  const navBtns = currentTemplate.template.navbar.routes
  const [currentPageName, setCurrentPageName] = useState(navBtns[0].routeName)
  const [currentContainers, setCurrentContainers] = useState([])
  const combinedApiArray = [];
  //dev endpoint
  // const endpoint = "http://localhost:3000/"

  //prod endpoint
  const endpoint = location.origin

  if (typeof currentTemplate.template.darkMode !== "undefined") {
    if (currentTemplate.template.darkMode) {
      document.body.classList.add('dark-mode')
    }
  }

  //watch for route changes
  useEffect(() => {
    const fullRouteObj = navBtns.filter((navBtn) => navBtn.routeName === currentPageName)
    const navBtnDOMObj = document.getElementsByClassName("nav-btn")
    //index of apiSrcs matches routeContainers
    const apiSrcs = fullRouteObj[0].containers.map((container) => container.apiSrc)

    //highlight link
    for (let i = 0; i < navBtnDOMObj.length; i++) {
      if (navBtnDOMObj[i].innerText === currentPageName) {
        navBtnDOMObj[i].classList.add("selected-route")
      }
    }
  
    //fetch all api objects for this page and plop into an array
    async function fetchApiPages(apiSrcs) {
        let fullEndpoint
        let response      
        let jsonResult

        for (let src of apiSrcs) {
          if (src) {
            fullEndpoint = endpoint + src;
            response = await fetch(fullEndpoint)
            jsonResult = await response.json()
            combinedApiArray.push(jsonResult)
          } else {
            combinedApiArray.push(null);
          }
        }
    }

    //when all api pages are put into a variable, set containers and pass our api objects down
    fetchApiPages(apiSrcs).then(() => {
      const routeContainers = fullRouteObj[0].containers.map((container, index) => <Container key={nanoid()} apiObj={combinedApiArray[index]} container={container}/>)
      setCurrentContainers(routeContainers);
    })

  }, [currentPageName])

  function changeRoute(routeName) {
    setCurrentPageName(routeName)
  }

  //style rules for if less than 4 containers
  let innerClassList = "containers"
  let outerClassList = "outer-container"

  // if (currentContainers.length < 4) {
  //   innerClassList += " flex-container"
  //   outerClassList += " flex-outer-container"
  // }

  return (
    <>
      <Navbar changeRoute={changeRoute} currentPageName={currentPageName} navBtns={navBtns}/>
      <div className={outerClassList}>
        <div className={innerClassList}>
          {currentContainers}
        </div>
      </div>
    </>
  )
}
