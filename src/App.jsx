import React, { useState, useEffect, useRef } from "react"
import Container from "./components/Container"
import { authenticate } from "./Utils"

export default function App(props) {
    //set up initial state with template
    const currentTemplate = props.currentTemplate
    const navBtns = currentTemplate.template.navbar.routes
    const currentPageName = props.currentPageName

    const [currentContainers, setCurrentContainers] = useState([])
    const containerStyles = useRef([navBtns[0].containersStyle])
    const [backgroundFetchCount, setBackgroundFetchCount] = useState(0)

    const combinedApiArray = []
    let presetObj
    const backgroundRefreshTime = currentTemplate.template.backgroundRefreshTime
        ? currentTemplate.template.backgroundRefreshTime
        : 5000 //timer to fetch background data in milliseconds

    const endpoint = location.origin

    let isMultichannelPage = navBtns[0].isMultichannelPage

    useEffect(() => {
        if (typeof currentTemplate.template.darkMode !== "undefined") {
            if (currentTemplate.template.darkMode === true) {
                document.body.classList.add("dark-mode")
            } else {
                document.body.classList.remove("dark-mode")
            }
        } else {
            document.body.classList.remove("dark-mode")
        }
    }, [])

    //watch for route changes or refreshes
    useEffect(() => {
        const fullRouteObj = navBtns.filter(
            (navBtn) => navBtn.routeName === currentPageName
        )
        //index of apiSrcs matches routeContainers
        const apiSrcs = fullRouteObj[0].containers.map(
            (container) => container.apiSrc
        )

        containerStyles.current = fullRouteObj[0].containersStyle

        //fetch all api objects for this page and plop into an array
        async function fetchApiPages(apiSrcs) {
            let authorized = await authenticate()
            if (!authorized) {
                //authenticate with remote server
                //window.location = `${endpoint}/sbuiauth/`

                //authenticate with local server
                window.location = "http://localhost:5005/sbuiauth/"
                return
            }

            let fullEndpoint
            let response
            let jsonResult
            startTimer()

            for (let sources of apiSrcs) {
                if (sources) {
                    if (typeof sources === "object" && sources.length > 1) {
                        let tempObj = {
                            current_stat: [],
                        }
                        for (let source of sources) {
                            fullEndpoint = endpoint + source
                            response = await fetch(fullEndpoint)
                            jsonResult = await response.json()

                            if (jsonResult.current_stat) {
                                tempObj.current_stat = [
                                    ...tempObj.current_stat,
                                    ...jsonResult.current_stat,
                                ]
                            } else if (jsonResult.preset_list) {
                                presetObj = jsonResult
                            }
                        }
                        combinedApiArray.push(tempObj)
                    } else {
                        //if just a single string
                        fullEndpoint = endpoint + sources
                        try {
                            response = await fetch(fullEndpoint)
                            jsonResult = await response.json()
                            combinedApiArray.push(jsonResult)
                        } catch (err) {
                            alert(
                                "There's a problem with an endpoint in the chosen JSON file.  Please choose a valid JSON file."
                            )
                            props.openSettings()
                            clearTimer()
                            return
                        }
                    }
                } else {
                    combinedApiArray.push(null)
                }
            }
        }

        //when all api pages are put into a variable, set containers and pass our api objects down
        fetchApiPages(apiSrcs).then(() => {
            const routeContainers = fullRouteObj[0].containers.map(
                (container, index) => {
                    if (presetObj) {
                        return (
                            <Container
                                presetObj={presetObj}
                                openSettings={props.openSettings}
                                key={"container-" + index}
                                clearTimer={clearTimer}
                                startTimer={startTimer}
                                triggerBackgroundFetch={triggerBackgroundFetch}
                                apiObj={combinedApiArray[index]}
                                container={container}
                            />
                        )
                    } else {
                        return (
                            <Container
                                key={"container-" + index}
                                openSettings={props.openSettings}
                                clearTimer={clearTimer}
                                startTimer={startTimer}
                                triggerBackgroundFetch={triggerBackgroundFetch}
                                apiObj={combinedApiArray[index]}
                                container={container}
                            />
                        )
                    }
                }
            )

            setCurrentContainers(routeContainers)
        })

        return () => {
            clearTimer()
        }
    }, [currentPageName, backgroundFetchCount])

    let timer

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
        setBackgroundFetchCount((prev) => prev + 1)
    }

    //style rules for if less than 4 containers
    let innerClassList = "containers"
    let outerClassList = "outer-container"
    let style = {}

    if (isMultichannelPage) {
        innerClassList = " multichannel-inner"
        outerClassList = " multichannel-outer"
    }

    if (containerStyles.current) {
        if (typeof containerStyles.current.numberOfColumns !== "undefined") {
            style = {
                gridTemplateColumns: `repeat(${containerStyles.current.numberOfColumns}, 1fr)`,
            }
            if (containerStyles.current.numberOfColumn == 1) {
                innerClassList += " flex-container"
                outerClassList += " flex-outer-container"
            }
        }
    } else {
        innerClassList += " flex-container"
        outerClassList += " flex-outer-container"
    }

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
