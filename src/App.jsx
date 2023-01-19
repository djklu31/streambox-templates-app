import React, { useState, useEffect, useRef } from "react"
import Container from "./components/Container"
import {
    attemptLogin,
    authenticate,
    getStreamingStatus,
    isLocalDev,
    setNetwork1Api,
    replaceJSONParams,
} from "./Utils"
import { POSTData } from "./Utils"

export default function App(props) {
    //set up initial state with template
    const currentTemplate = props.currentTemplate
    const navBtns = currentTemplate.template.navbar.routes
    const currentPageName = props.currentPageName

    const [currentContainers, setCurrentContainers] = useState([])
    const containerStyles = useRef([navBtns[0].containersStyle])
    const [backgroundFetchCount, setBackgroundFetchCount] = useState(0)
    const [sessionDashXML, setSessionDashXML] = useState("")
    const [templateVariables] = useState(
        currentTemplate.template.templateVariables !== undefined
            ? currentTemplate.template.templateVariables
            : {}
    )

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

        // if (typeof currentTemplate.template.templateVariables !== undefined) {
        //     setTemplateVariables(currentTemplate.template.templateVariables)
        // }
    }, [])

    //watch for route changes or refreshes
    useEffect(() => {
        const fullRouteObj = navBtns.filter(
            (navBtn) => navBtn.routeName === currentPageName
        )
        // let customHost = ""
        //index of apiSrcs matches routeContainers
        const apiSrcs = fullRouteObj[0].containers.map((container) => {
            // if (container.host !== undefined) {
            //     let objectEntries = Object.entries(templateVariables)

            //     if (objectEntries.length > 0) {
            //         for (let [key, val] of objectEntries) {
            //             let searchKey = `@${key}@`
            //             if (searchKey === container.host) {
            //                 customHost = val
            //             }
            //         }
            //     }
            // }
            return container.apiSrc
        })

        containerStyles.current = fullRouteObj[0].containersStyle

        //fetch all api objects for this page and plop into an array
        async function fetchApiPages(apiSrcs) {
            let authorized = await authenticate()
            if (!authorized) {
                if (isLocalDev) {
                    window.location = "http://localhost:5005/sbuiauth/"
                } else {
                    window.location = `${endpoint}/sbuiauth/`
                }
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
                            source = replaceJSONParams(
                                source,
                                templateVariables
                            )

                            // if (customHost !== "") {
                            //     fullEndpoint = "http://" + customHost + source
                            // } else {
                            fullEndpoint = source
                            // }

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
                        fullEndpoint = sources
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
                                templateVariables={templateVariables}
                                sessionDashXML={sessionDashXML}
                                handleCreateNewSessionBtn={
                                    handleCreateNewSessionBtn
                                }
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
                                templateVariables={templateVariables}
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

    //get session info from sb live
    useEffect(() => {
        async function attemptLoginDashboard() {
            if ((await attemptLogin()) === "success") {
                if (localStorage.getItem("sessionDRM")) {
                    //hook up to SB Live
                    async function getSessionDashboard() {
                        let sessionDRM = localStorage.getItem("sessionDRM")
                        const controller = new AbortController()
                        sessionDRM = sessionDRM.substring(1, sessionDRM.length)
                        //timeout if no signal for 10 seconds
                        const timeoutId = setTimeout(
                            () => controller.abort(),
                            15000
                        )
                        let login = localStorage.getItem("cloudLogin")
                        let hashedPass = localStorage.getItem("cloudPass")
                        let response = await fetch(
                            `https://${localStorage.getItem(
                                "cloudServer"
                            )}.streambox.com/ls/GetSessionDashboardXML.php?SESSION_DRM=${sessionDRM}&login=${login}&hashedPass=${hashedPass}`,
                            {
                                method: "GET",
                                signal: controller.signal,
                                headers: {
                                    "Content-type":
                                        "application/x-www-form-urlencoded",
                                },
                            }
                        ).catch((e) => {
                            document.querySelector(
                                ".no-session-msg"
                            ).textContent = "The Server is Down..."
                        })
                        const xmlResponse = await response.text()
                        setSessionDashXML(xmlResponse)
                    }
                    getSessionDashboard()
                } else {
                    setSessionDashXML("none")
                }
            } else {
                localStorage.removeItem("sessionServerIP")
                document.querySelector(
                    ".no-session-msg"
                ).innerHTML = `Log into Streambox Cloud in Settings`
            }
        }

        attemptLoginDashboard()
    }, [backgroundFetchCount])

    async function handleCreateNewSessionBtn() {
        let res = await createNewSession()
        setBackgroundFetchCount(true)
        return res
    }

    //create new session
    async function createNewSession() {
        let encKey = ""
        if ((await getStreamingStatus()) == 1) {
            if (
                confirm(
                    "In order to create a new session, the current streaming session needs to be stopped.  Is this okay?"
                ) == true
            ) {
                await POSTData(endpoint + "/REST/encoder/action", {
                    action_list: ["stop"],
                }).then((data) => {
                    console.log("Streaming stopped" + JSON.stringify(data))
                })

                encKey = await createSession()
            }
        } else {
            encKey = await createSession()
        }

        async function createSession() {
            var sessionName = prompt(
                "What would you like to name your session? (For email purposes)"
            )

            if (
                sessionName === null ||
                sessionName === undefined ||
                sessionName === ""
            ) {
                alert(
                    "Session name cannot be blank.  Please click 'Create New Session' again."
                )
            } else {
                let userId = localStorage.getItem("user_id")
                let login = localStorage.getItem("cloudLogin")
                let hashedPass = localStorage.getItem("cloudPass")
                const controller = new AbortController()
                //timeout if no signal for 10 seconds
                const timeoutId = setTimeout(() => controller.abort(), 15000)
                let response = await fetch(
                    `https://${localStorage.getItem(
                        "cloudServer"
                    )}.streambox.com/ls/CreateNewSessionXML.php?USER_ID=${userId}&SESSION_NAME=${sessionName}&login=${login}&hashedPass=${hashedPass}`,
                    {
                        method: "GET",
                        signal: controller.signal,
                        headers: {
                            "Content-type": "application/x-www-form-urlencoded",
                        },
                    }
                ).catch((e) => {
                    document.querySelector(".no-session-msg").textContent =
                        "The Server is Down..."
                })
                const xmlResponse = await response.text()

                let parser = new DOMParser()
                let xmlDoc = parser.parseFromString(xmlResponse, "text/xml")
                let parsedXML = xmlDoc.getElementsByTagName("body")[0]

                if (parsedXML.getAttributeNames().length !== 0) {
                    let enc_key = parsedXML.getAttribute("enc_key")

                    localStorage.setItem("sessionDRM", enc_key)
                    localStorage.setItem("sessionTitle", sessionName)

                    setNetwork1Api(enc_key)

                    return enc_key
                } else {
                    localStorage.setItem("sessionDRM", "Invalid Login")
                    return "Invalid Login"
                }
            }
        }
        return encKey
    }

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
