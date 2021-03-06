import React, {useState, useEffect} from "react"
import Container from "./components/Container"
import { nanoid } from 'nanoid'

export default function App(props) {
  //set up initial state with template
  const currentTemplate = props.currentTemplate
  const navBtns = currentTemplate.template.navbar.routes
  const currentPageName = props.currentPageName

  const [currentContainers, setCurrentContainers] = useState([])
  const [containerStyles, setContainerStyles] = useState([navBtns[0].containersStyle])
  const [backgroundFetchCount, setBackgroundFetchCount] = useState(0);
  
  const combinedApiArray = [];
  const backgroundRefreshTime = 3000 //timer to fetch background data in milliseconds

  const endpoint = location.origin

  if (typeof currentTemplate.template.darkMode !== "undefined") {
    if (currentTemplate.template.darkMode) {
      document.body.classList.add('dark-mode')
    }
  }

  //watch for route changes
  useEffect(() => {
    const fullRouteObj = navBtns.filter((navBtn) => navBtn.routeName === currentPageName)
    //index of apiSrcs matches routeContainers
    const apiSrcs = fullRouteObj[0].containers.map((container) => container.apiSrc)

    setContainerStyles(fullRouteObj[0].containersStyle)
  
    //fetch all api objects for this page and plop into an array
    async function fetchApiPages(apiSrcs) {
        let fullEndpoint
        let response      
        let jsonResult
        startTimer();

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
      const routeContainers = fullRouteObj[0].containers.map((container, index) => <Container key={nanoid()} triggerBackgroundFetch={triggerBackgroundFetch} apiObj={combinedApiArray[index]} container={container}/>)
      setCurrentContainers(routeContainers);
    })

    return () => {
      clearTimer()
    }
  }, [currentPageName, backgroundFetchCount])

  let timer;

  function startTimer() {
    clearTimer()
    timer = setInterval(() => {
      triggerBackgroundFetch()
    }, backgroundRefreshTime)
  }

  function clearTimer() {
    if (timer) {
      clearInterval(timer)
    }
  }

  function triggerBackgroundFetch() {
    setBackgroundFetchCount(backgroundFetchCount + 1)
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
      <div className={outerClassList}>
        <div className={innerClassList} style={style}>
          {currentContainers}
        </div>
      </div>
    </>
  )
}