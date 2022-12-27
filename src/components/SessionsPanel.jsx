import React, { useEffect, useState } from "react"
import Select from "react-select"
import DecoderInfo from "./DecoderInfo"
import {
    debounce,
    setDecoderIPToServerIP,
    isLocalDev,
    getStreamingStatus,
    POSTData,
    setNetwork1Api,
    getPropertyFromAPI,
} from "../Utils"

export default function SessionsPanel(props) {
    let [showEmailPage, setShowEmailPage] = useState(false)
    let [selectedOptions, setSelectedOptions] = useState([])
    let localStorageEmails = JSON.parse(localStorage.getItem("storedEmails"))

    let sessionDashXML = props.sessionDashXML

    let opts = []
    if (localStorageEmails) {
        opts = localStorageEmails
    }

    let [emailOptions, setEmailOptions] = useState(opts)

    const endpoint = location.origin

    async function handleCreateNewSessionBtnWrapper() {
        let sessionIDElems = document.getElementsByClassName("session-id-top")
        let res = await props.handleCreateNewSessionBtn()

        if (res !== undefined && res !== null) {
            for (let elem of sessionIDElems) {
                elem.innerHTML = `<div style="color: green">Creating...</div>`
            }
        }
    }

    function clearSession() {
        localStorage.removeItem("sessionDRM")
        localStorage.removeItem("sessionTitle")
        document.querySelector(".session-id-top").textContent = "none"
        let btns = document.getElementsByClassName("sessions-panel-top-btns")
        if (btns.length > 0) {
            btns[1].disabled = true
        }

        document.querySelector(".no-session-msg").textContent =
            "Please create a new session"
        document.querySelector(".close-session-btn").style.display = "none"
    }

    function sendInvites() {
        const hostName = localStorage.getItem("hostName")
        const emailTitle = document.querySelector(
            ".email-page-title-input"
        ).value
        let sessionID = document.querySelector(".session-id-top").textContent
        sessionID = sessionID.substring(1, sessionID.length)

        let emailAddresses = selectedOptions.map((email) => email.value)

        if (hostName && emailTitle && emailAddresses.length > 0) {
            sendEmailsViaPHP(emailAddresses, hostName, emailTitle, sessionID)
        } else if (!hostName && emailTitle && emailAddresses.length > 0) {
            let host = prompt("Please enter a host name for this email")
            localStorage.setItem("hostName", host)

            sendEmailsViaPHP(emailAddresses, hostName, emailTitle, sessionID)
        } else {
            alert(
                "Please enter a host name, session title and at least one email address."
            )
        }
        setSelectedOptions([])
    }

    function validateEmail(email) {
        var re = /\S+@\S+\.\S+/
        return re.test(email)
    }

    useEffect(() => {
        if (document.querySelector(".email-page-body-select")) {
            getSessionLocalStorage()

            document
                .querySelector(".email-page-body-select")
                .addEventListener("keypress", function (event) {
                    if (event.key === "Enter") {
                        let email =
                            document.querySelector(".select__input").value

                        if (validateEmail(email)) {
                            let emailObj = {
                                value: email,
                                label: email,
                            }

                            let storedEmails = JSON.parse(
                                localStorage.getItem("storedEmails")
                            )

                            let emailExists = false

                            if (storedEmails) {
                                for (let thisEmail of storedEmails) {
                                    if (email === thisEmail.value) {
                                        emailExists = true
                                    }
                                }

                                if (storedEmails.length >= 10) {
                                    storedEmails.shift()
                                }
                            }

                            if (!emailExists) {
                                if (storedEmails) {
                                    localStorage.setItem(
                                        "storedEmails",
                                        JSON.stringify([
                                            ...storedEmails,
                                            emailObj,
                                        ])
                                    )
                                } else {
                                    localStorage.setItem(
                                        "storedEmails",
                                        JSON.stringify([emailObj])
                                    )
                                }

                                setEmailOptions(
                                    JSON.parse(
                                        localStorage.getItem("storedEmails")
                                    )
                                )
                            }
                        } else {
                            alert(
                                "The email entered is invalid. Please enter valid email."
                            )
                        }
                    }
                })
        }
    }, [showEmailPage])

    function getSessionLocalStorage() {
        // document.querySelector(".host-name-input").value =
        //     localStorage.getItem("hostName")
        document.querySelector(".email-page-title-input").value =
            localStorage.getItem("sessionTitle")
    }

    function handleClick(text) {
        if (text === "openEmailPage") {
            setShowEmailPage(true)
        } else if (text === "close") {
            setShowEmailPage(false)
        }
    }

    async function sendEmailsViaPHP(
        emailAddresses,
        hostName,
        emailTitle,
        sessionID
    ) {
        let response = ""
        if (isLocalDev) {
            response = await fetch(
                `http://localhost:5005/sbuiauth/sendEmail.php?emailAddresses=${emailAddresses.join(
                    ","
                )}&hostName=${encodeURIComponent(
                    hostName
                )}&emailTitle=${encodeURIComponent(
                    emailTitle
                )}&sessionID=${sessionID}`
            )
        } else {
            response = await fetch(
                `${endpoint}/sbuiauth/sendEmail.php?emailAddresses=${emailAddresses.join(
                    ","
                )}&hostName=${encodeURIComponent(
                    hostName
                )}&emailTitle=${encodeURIComponent(
                    emailTitle
                )}&sessionID=${sessionID}`
            )
        }
        document.querySelector(".send-invite-btn").textContent = "Sending..."
        let result = await response.text()
        alert(result)

        if ((await getStreamingStatus()) == 0) {
            if (
                confirm(
                    "Streaming is stopped. Would you like to start streaming?"
                ) == true
            ) {
                let response = ""
                if (isLocalDev) {
                    response = await fetch(
                        endpoint + "/REST/encoder/metadata.json"
                    )
                } else {
                    response = await fetch(endpoint + "/REST/encoder/metadata")
                }
                let metadataResult = await response.json()

                let networkObj = metadataResult.current_stat.filter(
                    (res) => res.cname === "Meta_Network1"
                )

                const apiDRM = networkObj[0]["val"]

                const apiServerIP = await getPropertyFromAPI(
                    "decoderIP",
                    "/REST/encoder/network"
                )
                const sessionServerIP = localStorage.getItem("sessionServerIP")

                if (
                    localStorage.getItem("sessionDRM") !== undefined &&
                    localStorage.getItem("sessionDRM") !== null &&
                    localStorage.getItem("sessionDRM") !== ""
                ) {
                    if (localStorage.getItem("sessionDRM") !== apiDRM) {
                        if (
                            confirm(
                                "There is a mismatch between the session DRM and DRM on the encoder.  Would you like to set the encoder DRM to the session DRM?"
                            ) == true
                        ) {
                            await setNetwork1Api(
                                localStorage.getItem("sessionDRM")
                            )
                        }
                    }
                }

                //TODO:  this check is probably redundant now
                if (
                    sessionServerIP !== undefined &&
                    sessionServerIP !== null &&
                    sessionServerIP !== ""
                ) {
                    if (sessionServerIP !== apiServerIP) {
                        if (
                            confirm(
                                `Decoder IP is not set to the correct server IP (${sessionServerIP}). Do you want to set this?`
                            ) == true
                        ) {
                            await setDecoderIPToServerIP(sessionServerIP)
                        }
                    }
                }

                await POSTData(endpoint + "/REST/encoder/action", {
                    action_list: ["start"],
                }).then((data) => {
                    console.log("Streaming started" + JSON.stringify(data))
                })
            }
        }
        handleClick("close")
    }

    const handleChange = (options) => {
        setSelectedOptions(options)
    }

    if (sessionDashXML === "") {
        return (
            <div className="sessions-panel-container">
                <div className="sessions-panel-top">
                    <div>
                        Session ID: <span className="session-id-top">none</span>
                    </div>
                    <button
                        className="sessions-panel-top-btns"
                        onClick={handleCreateNewSessionBtnWrapper}
                        disabled
                    >
                        Create New Session
                    </button>
                    <button className="sessions-panel-top-btns" disabled>
                        Invite to Session...
                    </button>
                </div>
                <hr />
                <div className="msg-wrapper">
                    <div className="no-session-msg">
                        Fetching Session Dashboard Data...
                    </div>
                </div>
            </div>
        )
    }
    if (sessionDashXML === "none") {
        return (
            <div className="sessions-panel-container">
                <div className="sessions-panel-top">
                    <div>
                        Session ID: <span className="session-id-top">none</span>
                    </div>
                    <button
                        className="sessions-panel-top-btns"
                        onClick={handleCreateNewSessionBtnWrapper}
                    >
                        Create New Session
                    </button>
                    <button className="sessions-panel-top-btns" disabled>
                        Invite to Session...
                    </button>
                </div>
                <hr />
                <div className="msg-wrapper">
                    <div className="no-session-msg">
                        Please create a new session
                    </div>
                </div>
            </div>
        )
    } else {
        let parser = new DOMParser()
        let xmlDoc = parser.parseFromString(sessionDashXML, "text/xml")
        let parsedXML = xmlDoc.getElementsByTagName("body")[0]
        let decoderInfo = xmlDoc.getElementsByTagName("body")[0].childNodes

        const styles = {
            option: (provided) => ({
                ...provided,
                color: "black",
            }),
        }

        let decInfoArray = []
        let sessionIsLive = parsedXML.getAttribute("session_islive")
        const sessionServerIP = parsedXML.getAttribute("session_transporter_ip")
        const sessionID = parsedXML.getAttribute("dec_key")
        localStorage.setItem("sessionServerIP", sessionServerIP)

        //will always run whenever server refreshes
        setDecoderIPToServerIP(sessionServerIP)

        if (decoderInfo) {
            // for (let decoder of decoderInfo) {
            if (decoderInfo[0].getElementsByTagName("dec")[0]) {
                for (let decInfo of decoderInfo[0].getElementsByTagName(
                    "dec"
                )) {
                    decInfoArray.push(<DecoderInfo decoderInfo={decInfo} />)
                }
            }
            // }
        }

        return showEmailPage ? (
            <div>
                <div className="sessions-panel-top">
                    <div>
                        Session ID:{" "}
                        <span className="session-id-top">
                            {sessionID !== ""
                                ? parsedXML.getAttribute("dec_key")
                                : "Not Found"}
                        </span>
                        <button
                            className="close-session-btn"
                            onClick={clearSession}
                        >
                            x
                        </button>
                    </div>
                    {/* <input
                        onChange={debounce(() => {
                            localStorage.setItem(
                                "hostName",
                                document.querySelector(".host-name-input").value
                            )
                        })}
                        placeholder=" Enter Host Name"
                        className="host-name-input"
                        type="text"
                    /> */}
                    {/* <button className="sessions-panel-top-btns">
                        Send All Invites
                    </button> */}
                    <button
                        className="sessions-panel-top-btns"
                        onClick={() => handleClick("close")}
                    >
                        Close
                    </button>
                </div>
                <hr />
                <div className="email-page-body-wrapper">
                    <div className="email-page-title">
                        <span>Title:</span>
                        <input
                            onChange={debounce(() => {
                                localStorage.setItem(
                                    "sessionTitle",
                                    document.querySelector(
                                        ".email-page-title-input"
                                    ).value
                                )
                            })}
                            className="email-page-title-input"
                            placeholder=" Color Review of 'Blazing Saddles'"
                        />
                    </div>
                    <div className="email-page-body">
                        <div className="email-page-body-section">
                            <span>Email:</span>
                            <Select
                                className="email-page-body-select"
                                options={emailOptions}
                                isMulti
                                onChange={handleChange}
                                name="emails"
                                styles={styles}
                                classNamePrefix="select"
                            />
                            <button
                                onClick={sendInvites}
                                className="send-invite-btn"
                            >
                                Send Invites
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        ) : (
            <div className="sessions-panel-container">
                <div className="sessions-panel-top">
                    <div>
                        Session ID:{" "}
                        <span className="session-id-top">
                            {sessionID !== ""
                                ? parsedXML.getAttribute("dec_key")
                                : "Not Found"}
                        </span>
                        <button
                            className="close-session-btn"
                            onClick={clearSession}
                        >
                            x
                        </button>
                    </div>
                    <button
                        className="sessions-panel-top-btns"
                        onClick={handleCreateNewSessionBtnWrapper}
                    >
                        Create New Session
                    </button>
                    <button
                        className="sessions-panel-top-btns"
                        onClick={() => handleClick("openEmailPage")}
                    >
                        Invite to Session...
                    </button>
                </div>
                <hr />
                {decInfoArray.length > 0 ? (
                    decInfoArray
                ) : (
                    <div className="msg-wrapper">
                        {sessionID !== "" ? (
                            <div className="no-session-msg">
                                {sessionIsLive == 1
                                    ? "No Decoders Connected"
                                    : "Waiting for Host to Start Session..."}
                            </div>
                        ) : (
                            <div className="no-session-msg">
                                Session DRM {localStorage.getItem("sessionDRM")}{" "}
                                is not found
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }
}
