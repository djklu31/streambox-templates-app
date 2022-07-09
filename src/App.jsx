import React, {useState, useEffect} from "react"
import Navbar from "./components/Navbar"
import Container from "./components/Container"
//dev template
import customTemplate from '/public/templates/devTemplate.json'

//prod template
//import customTemplate from '/public/templates/template.json'
import { nanoid } from 'nanoid'

export default function App() {
  //set up initial state with template
  const [currentTemplate, setCurrentTemplate] = useState(customTemplate)

  const navBtns = currentTemplate.template.navbar.routes
  const [currentPageName, setCurrentPageName] = useState(navBtns[0].routeName)
  const [currentContainers, setCurrentContainers] = useState([])
  const [containerStyles, setContainerStyles] = useState([navBtns[0].containersStyle])
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

    setContainerStyles(fullRouteObj[0].containersStyle)

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

        for (let sources of apiSrcs) {
          if (sources) {
            if (typeof sources === "object" && sources.length > 1) {
              let tempObj = {
                "current_stat": [

                ]
              }
              for (let source of sources) {
                fullEndpoint = endpoint + source;
                response = await fetch(fullEndpoint)
                jsonResult = await response.json()
                tempObj.current_stat = [...tempObj.current_stat, ...jsonResult.current_stat];
              }
              combinedApiArray.push(tempObj)
            } else {
              //if just a single string
              fullEndpoint = endpoint + sources;
              response = await fetch(fullEndpoint)
              jsonResult = await response.json()
              combinedApiArray.push(jsonResult)
            }
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
  let style = {}

  if (containerStyles) {
    if (typeof containerStyles.numberOfColumns !== "undefined") {
      style = {
        gridTemplateColumns: `repeat(${containerStyles.numberOfColumns}, 1fr)`
      }
    } 
  }

  // if (currentContainers.length < 4) {
  //   innerClassList += " flex-container"
  //   outerClassList += " flex-outer-container"
  // }
  return (
    <>
      <Navbar changeRoute={changeRoute} currentPageName={currentPageName} navBtns={navBtns}/>
      <div className={outerClassList}>
        <div className={innerClassList} style={style}>
          {currentContainers}
        </div>
      </div>
    </>
  )
}
