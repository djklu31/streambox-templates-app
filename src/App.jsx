import React, {useState, useEffect} from "react"
import Navbar from "./components/Navbar"
import Container from "./components/Container"
import customTemplate from './templates/template.json'
import { nanoid } from 'nanoid'

export default function App() {
  //set up initial state
  const [currentTemplate, setCurrentTemplate] = useState(customTemplate)

  const navBtns = currentTemplate.template.navbar.routes
  const [currentPageName, setCurrentPageName] = useState(navBtns[0].routeName)
  const [currentContainers, setCurrentContainers] = useState([]);

  //watch for route changes
  useEffect(() => {
    const fullRouteObj = navBtns.filter((navBtn) => navBtn.routeName === currentPageName)
    const navBtnDOMObj = document.getElementsByClassName("nav-btn")
    const routeContainers = fullRouteObj[0].containers.map((container) => <Container key={nanoid()} container={container}/>)
    setCurrentContainers(routeContainers);

    for (let i = 0; i < navBtnDOMObj.length; i++) {
      if (navBtnDOMObj[i].innerText === currentPageName) {
        //highlight link and set co state
        navBtnDOMObj[i].classList.add("selected-route")
      }
    }

  }, [currentPageName])


  function changeRoute(routeName) {
    setCurrentPageName(routeName)
  }

  let innerClassList = "containers"
  let outerClassList = "outer-container"

  if (currentContainers.length < 4) {
    innerClassList += " flex-container"
    outerClassList += " flex-outer-container"
  }

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
