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
    md5,
} from "../Utils"
import Modal from "react-modal"

export default function SessionsPanel(props) {
    let [showEmailPage, setShowEmailPage] = useState(false)
    let [selectedOptions, setSelectedOptions] = useState([])
    let localStorageEmails = JSON.parse(localStorage.getItem("storedEmails"))
    let [isFromClearSession, setIsFromClearSession] = useState(false)
    const [modalIsOpen, setModalIsOpen] = useState(false)
    const [colorspaceOptions, setColorspaceOptions] = useState([])
    const [proto, setProto] = useState("0")
    // const [chatPassExists, setChatPassExists] = useState("")

    let sessionDashXML = props.sessionDashXML
    let buttons = props.buttons || []

    if (buttons.length > 0) {
        buttons = buttons.map((button) => button.toLowerCase())
    }

    let selectedColorspaceId = "0"
    let session_id = ""
    let ldmpSettings = ""
    if (isFromClearSession) {
        if (sessionDashXML === "none" || sessionDashXML === "") {
            setIsFromClearSession(false)
        } else {
            let parser = new DOMParser()
            let xmlDoc = parser.parseFromString(sessionDashXML, "text/xml")
            let parsedXML = xmlDoc.getElementsByTagName("body")[0]
            const encKey = parsedXML.getAttribute("enc_key")

            if (localStorage.getItem("lastSessionFromClear") === encKey) {
                sessionDashXML = "none"
            }
        }
    }

    let customHost = props.customHost
    let customPort = props.customPort

    let opts = []
    if (localStorageEmails) {
        opts = localStorageEmails
    }

    let [emailOptions, setEmailOptions] = useState(opts)

    const endpoint = location.origin

    //modal setting
    Modal.setAppElement("#root")
    const customStyles = {
        content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            padding: "50px",
            backgroundColor: "rgb(28, 28, 30)",
            color: "rgb(240, 240, 240)",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
        },
    }

    async function handleCreateNewSessionBtnWrapper() {
        let sessionIDElems =
            document.getElementsByClassName("session-id-readout")
        let res = await props.handleCreateNewSessionBtn()

        if (res !== undefined && res !== null && res !== "Invalid Login") {
            for (let elem of sessionIDElems) {
                elem.innerHTML = `<span style="color: green">Creating...</span>`

                if (document.querySelector(".close-session-btn")) {
                    document.querySelector(".close-session-btn").style.display =
                        "none"

                    setTimeout(() => {
                        document.querySelector(
                            ".close-session-btn"
                        ).style.display = "initial"
                        // setChatPassExists("")
                    }, 7000)
                }
            }
        }
        setIsFromClearSession(false)
    }

    function clearSession() {
        let sessionDRM = localStorage.getItem("sessionDRM")
        localStorage.setItem("lastSessionFromClear", sessionDRM)
        localStorage.removeItem("sessionDRM")
        // localStorage.removeItem("sessionId")
        localStorage.removeItem("sessionTitle")
        setShowEmailPage(false)
        setIsFromClearSession(true)
        // setChatPassExists("")
    }

    function sendInvites() {
        const hostName = localStorage.getItem("hostName")
        const emailTitle = document.querySelector(
            ".email-page-title-input"
        ).value
        let sessionID = document.querySelector(
            ".session-id-readout"
        ).textContent
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
        // let login = localStorage.getItem("cloudLogin")
        // let hashedPass = localStorage.getItem("cloudPass")

        async function getColorspaceOptions() {
            let response = await fetch(
                `http://${localStorage.getItem(
                    "cloudServer"
                )}.streambox.com/ls/GetColorspaceListXML.php`
            )

            const xmlResponse = await response.text()

            let parser = new DOMParser()
            let xmlDoc = parser.parseFromString(xmlResponse, "text/xml")
            let parsedXML = xmlDoc.getElementsByTagName("body")[0].childNodes
            let options = []
            let childNodes = parsedXML[0].childNodes

            for (let node of childNodes) {
                let option = (
                    <option value={node.getAttribute("id")}>
                        {node.getAttribute("name")}
                    </option>
                )
                options.push(option)
            }

            setColorspaceOptions(options)
        }

        //setColorspaceForSessionID("100815", "8")
        // setSessionLdmpParams("100815", {
        //     proto: 1,
        //     MPUDP_ACK_TO: "69",
        //     codecPacketSize: "969",
        //     MPUDP_SND_TO: "69696",
        //     MPUDP_CWND: "700;8000",
        //     MPUDP_CWND_MIN: "+60",
        //     MPUDP_CWND_MAX: "+5",
        // })

        // setChatPass("$Z8VU38", "YOOOOOOOOOOO")

        getColorspaceOptions()
    }, [])

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

    function openAdvancedSettings() {
        setModalIsOpen(true)
    }

    function closeAdvancedSettngs() {
        setModalIsOpen(false)
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
                    let route = ""

                    if (customPort !== undefined) {
                        route = `/REST/encoder/${customPort}/metadata.json`
                    } else {
                        route = "/REST/encoder/metadata.json"
                    }

                    response = await fetch(
                        (customHost !== undefined ? customHost : endpoint) +
                            route
                    )
                } else {
                    let route = ""

                    if (customPort !== undefined) {
                        route = `/REST/encoder/${customPort}/metadata`
                    } else {
                        route = "/REST/encoder/metadata"
                    }

                    response = await fetch(
                        (customHost !== undefined ? customHost : endpoint) +
                            route
                    )
                }
                let metadataResult = await response.json()

                let networkObj = metadataResult.current_stat.filter(
                    (res) => res.cname === "Meta_Network1"
                )

                const apiDRM = networkObj[0]["val"]

                let temporaryRoute = ""

                if (customPort !== undefined) {
                    temporaryRoute = `/REST/encoder/${customPort}/network`
                } else {
                    temporaryRoute = "/REST/encoder/network"
                }

                const apiServerIP = await getPropertyFromAPI(
                    "decoderIP",
                    temporaryRoute,
                    customHost
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
                                localStorage.getItem("sessionDRM"),
                                customPort,
                                customHost
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
                            await setDecoderIPToServerIP(
                                sessionServerIP,
                                customPort,
                                customHost
                            )
                        }
                    }
                }

                let route = ""

                if (customPort !== undefined) {
                    route = `/REST/encoder/${customPort}/action`
                } else {
                    route = "/REST/encoder/action"
                }

                await POSTData(
                    (customHost !== undefined ? customHost : endpoint) + route,
                    {
                        action_list: ["start"],
                    }
                ).then((data) => {
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
                        Session ID:{" "}
                        <span className="session-id-top">
                            <span className="session-id-readout">none</span>
                        </span>
                    </div>

                    {buttons.includes("create") ? (
                        <button
                            className="sessions-panel-top-btns"
                            onClick={handleCreateNewSessionBtnWrapper}
                            disabled
                        >
                            Create New Session
                        </button>
                    ) : (
                        ""
                    )}
                    {buttons.includes("advanced") ? (
                        <button
                            className="sessions-panel-top-btns"
                            onClick={openAdvancedSettings}
                            disabled
                        >
                            Advanced
                        </button>
                    ) : (
                        ""
                    )}
                    {buttons.includes("invite") ? (
                        <button className="sessions-panel-top-btns" disabled>
                            Invite to Session...
                        </button>
                    ) : (
                        ""
                    )}
                </div>
                <hr />
                <div className="msg-wrapper">
                    <div className="no-session-msg">Logging Into Server...</div>
                </div>
            </div>
        )
    }
    if (sessionDashXML === "none") {
        return (
            <div className="sessions-panel-container">
                <div className="sessions-panel-top">
                    <div>
                        Session ID:{" "}
                        <span className="session-id-top">
                            <span className="session-id-readout">none</span>
                        </span>
                    </div>
                    {buttons.includes("create") ? (
                        <button
                            className="sessions-panel-top-btns"
                            onClick={handleCreateNewSessionBtnWrapper}
                        >
                            Create New Session
                        </button>
                    ) : (
                        ""
                    )}
                    {buttons.includes("advanced") ? (
                        <button
                            className="sessions-panel-top-btns"
                            onClick={openAdvancedSettings}
                            disabled
                        >
                            Advanced
                        </button>
                    ) : (
                        ""
                    )}
                    {buttons.includes("invite") ? (
                        <button className="sessions-panel-top-btns" disabled>
                            Invite to Session...
                        </button>
                    ) : (
                        ""
                    )}
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
        let wrongLogin = false
        let decoderInfo
        let styles
        let decInfoArray
        let sessionIsLive
        let sessionServerIP
        let sessionID
        let lastSessionFromClear
        let decKey
        let encKey
        let localStorageSessionDRM = localStorage.getItem("sessionDRM")

        if (
            parsedXML.getAttributeNames().length === 0 ||
            localStorageSessionDRM === "Invalid Login"
        ) {
            if (localStorageSessionDRM === "Invalid Login") {
                localStorage.removeItem("sessionDRM")
                // localStorage.removeItem("sessionId")
            }
            wrongLogin = true
        } else {
            decoderInfo = xmlDoc.getElementsByTagName("body")[0].childNodes

            styles = {
                option: (provided) => ({
                    ...provided,
                    color: "black",
                }),
            }
            decInfoArray = []

            sessionIsLive = parsedXML.getAttribute("session_islive")
            sessionServerIP = parsedXML.getAttribute("session_transporter_ip")
            sessionID = parsedXML.getAttribute("dec_key")
            localStorage.setItem("sessionServerIP", sessionServerIP)

            //will always run whenever server refreshes
            setDecoderIPToServerIP(sessionServerIP, customPort, customHost)

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

            lastSessionFromClear = localStorage.getItem("lastSessionFromClear")
            decKey = parsedXML.getAttribute("dec_key")
            encKey = parsedXML.getAttribute("enc_key")

            if (encKey === lastSessionFromClear) {
                let sessionIDElems =
                    document.getElementsByClassName("session-id-readout")

                for (let elem of sessionIDElems) {
                    elem.innerHTML = `<span style="color: green">Creating...</span>`

                    if (document.querySelector(".close-session-btn")) {
                        document.querySelector(
                            ".close-session-btn"
                        ).style.display = "none"

                        setTimeout(() => {
                            document.querySelector(
                                ".close-session-btn"
                            ).style.display = "initial"
                        }, 7000)
                    }
                }
            }
            selectedColorspaceId = parsedXML.getAttribute("colorspace_id")
            session_id = parsedXML.getAttribute("session_id")

            // if (chatPassExists === "") {
            //     setChatPassExists(
            //         parsedXML.getAttribute("chat_pass") !== ""
            //             ? "true"
            //             : "false"
            //     )
            // }

            ldmpSettings = JSON.parse(
                parsedXML.getAttribute("session_ldmp_params") !== ""
                    ? parsedXML.getAttribute("session_ldmp_params")
                    : parsedXML.getAttribute("user_ldmp_params")
            )
        }

        function setupProtoRadios() {
            if (ldmpSettings.proto == 1) {
                handleLDMPClick()
            } else {
                handleUDPClick()
            }
            document.getElementById("MPUDP_ACK_TO").value =
                ldmpSettings.MPUDP_ACK_TO
            document.getElementById("MPUDP_SND_TO").value =
                ldmpSettings.MPUDP_SND_TO
            document.getElementById("MPUDP_CWND").value =
                ldmpSettings.MPUDP_CWND
            document.getElementById("MPUDP_CWND_MIN").value =
                ldmpSettings.MPUDP_CWND_MIN
            document.getElementById("MPUDP_CWND_MAX").value =
                ldmpSettings.MPUDP_CWND_MAX
            document.getElementById("codecPacketSize").value =
                ldmpSettings.codecPacketSize
        }

        function handleUDPClick() {
            document.getElementById("proto_udp").checked = true
            document.getElementById("proto_ldmp").checked = false
            document.querySelector(".ldmp-settings-body").style.display = "none"
            setProto("0")
        }

        function handleLDMPClick() {
            document.getElementById("proto_ldmp").checked = true
            document.getElementById("proto_udp").checked = false
            document.querySelector(".ldmp-settings-body").style.display =
                "initial"
            setProto("1")
        }

        async function setColorspaceForSessionID() {
            let login = localStorage.getItem("cloudLogin")
            let hashedPass = localStorage.getItem("cloudPass")
            const sessionId = session_id
            const colorspaceId = document.getElementById(
                "set-colorspace-select"
            ).selectedOptions[0].value

            let response = await fetch(
                `http://${localStorage.getItem(
                    "cloudServer"
                )}.streambox.com/ls/SetColorspaceXML.php?colorspace_id=${colorspaceId}&session_id=${sessionId}&login=${login}&hashedPass=${hashedPass}`
            )
            let result = await response.text()

            if (
                result ===
                '<?xml version="1.0" encoding="UTF-8"?>\n<body result="success"/>\n'
            ) {
                alert("Colorspace set")
            } else {
                alert("Something went wrong setting colorspace")
            }
        }

        async function setSessionLdmpParams() {
            let login = localStorage.getItem("cloudLogin")
            let hashedPass = localStorage.getItem("cloudPass")
            const sessionId = session_id
            let sessionLdmpParams = {
                proto: proto,
                MPUDP_ACK_TO: document.getElementById("MPUDP_ACK_TO").value,
                codecPacketSize:
                    document.getElementById("codecPacketSize").value,
                MPUDP_SND_TO: document.getElementById("MPUDP_SND_TO").value,
                MPUDP_CWND: document.getElementById("MPUDP_CWND").value,
                MPUDP_CWND_MIN: document.getElementById("MPUDP_CWND_MIN").value,
                MPUDP_CWND_MAX: document.getElementById("MPUDP_CWND_MAX").value,
            }

            sessionLdmpParams = JSON.stringify(sessionLdmpParams)
            let response = await fetch(
                `http://${localStorage.getItem(
                    "cloudServer"
                )}.streambox.com/ls/SetSessionLdmpXML.php?session_ldmp_params=${sessionLdmpParams}&session_id=${sessionId}&login=${login}&hashedPass=${hashedPass}`
            )
            let result = await response.text()

            if (
                result ===
                '<?xml version="1.0" encoding="UTF-8"?>\n<body session_ldmp_update_result="Updated LDMP parameters for session."/>\n'
            ) {
                alert("LDMP Parameters set")
            } else {
                alert("LDMP Parameters not set")
            }
        }

        async function setChatPass() {
            const sessionDRM = localStorage.getItem("sessionDRM")
            const chatPass = document.getElementById("set-chatpass-input").value
            let login = localStorage.getItem("cloudLogin")
            let hashedPass = localStorage.getItem("cloudPass")
            const hashedChatPass = md5(chatPass)
            let response = await fetch(
                `http://${localStorage.getItem(
                    "cloudServer"
                )}.streambox.com/ls/SetChatPassXML.php?hashed_chat_pass=${hashedChatPass}&enc_key=${sessionDRM}&login=${login}&hashedPass=${hashedPass}`
            )
            let result = await response.text()

            if (
                result ===
                '<?xml version="1.0" encoding="UTF-8"?>\n<body result="success"/>\n'
            ) {
                alert("Chat password set")
                // setChatPassExists("true")
            } else {
                alert("Something went wrong setting chat password")
            }
        }

        return wrongLogin ? (
            <div className="wrong-login-msg">
                Invalid API Call Login/Password
            </div>
        ) : showEmailPage ? (
            <div>
                <div className="sessions-panel-top">
                    <div>
                        Session ID:{" "}
                        <span className="session-id-top">
                            {sessionID !== "" ? (
                                <span className="session-id-readout-wrapper">
                                    <span className="session-id-readout">
                                        {decKey}
                                    </span>
                                    <button
                                        className="close-session-btn"
                                        onClick={clearSession}
                                    >
                                        x
                                    </button>
                                </span>
                            ) : (
                                "Not Found"
                            )}
                        </span>
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
                            {sessionID !== "" ? (
                                <span className="session-id-readout-wrapper">
                                    <span className="session-id-readout">
                                        {decKey}
                                    </span>
                                    <button
                                        className="close-session-btn"
                                        onClick={clearSession}
                                    >
                                        x
                                    </button>
                                </span>
                            ) : (
                                "Not Found"
                            )}
                        </span>
                    </div>

                    {buttons.includes("create") ? (
                        <button
                            className="sessions-panel-top-btns"
                            onClick={handleCreateNewSessionBtnWrapper}
                        >
                            Create New Session
                        </button>
                    ) : (
                        ""
                    )}
                    {buttons.includes("advanced") ? (
                        <button
                            className="sessions-panel-top-btns"
                            onClick={openAdvancedSettings}
                        >
                            Advanced
                        </button>
                    ) : (
                        ""
                    )}
                    {buttons.includes("invite") ? (
                        <button
                            className="sessions-panel-top-btns"
                            onClick={() => handleClick("openEmailPage")}
                        >
                            Invite to Session...
                        </button>
                    ) : (
                        ""
                    )}

                    <Modal
                        isOpen={modalIsOpen}
                        onAfterOpen={setupProtoRadios}
                        onRequestClose={closeAdvancedSettngs}
                        style={customStyles}
                        contentLabel="Advanced Settings"
                    >
                        {/* <form>
                            <input />
                            <button>tab navigation</button>
                            <button>stays</button>
                            <button>inside</button>
                            <button>the modal</button>
                        </form> */}
                        <button
                            id="close-btn-modal"
                            className="sessions-panel-top-btns"
                            onClick={closeAdvancedSettngs}
                        >
                            close
                        </button>
                        <h2>Color Space</h2>
                        <div>
                            <select
                                id="set-colorspace-select"
                                defaultValue={selectedColorspaceId}
                            >
                                {colorspaceOptions}
                            </select>
                        </div>
                        <div>
                            <button
                                className="sessions-panel-top-btns modal-btn"
                                onClick={setColorspaceForSessionID}
                            >
                                Save Colorspace
                            </button>
                        </div>
                        <hr />
                        <h2>LDMP Settings</h2>
                        <div>
                            <p>
                                <label for="proto_udp">
                                    <input
                                        type="radio"
                                        id="proto_udp"
                                        value="0"
                                        onClick={handleUDPClick}
                                    />
                                    UDP (Default)
                                </label>

                                <label for="proto_ldmp">
                                    <input
                                        type="radio"
                                        id="proto_ldmp"
                                        value="1"
                                        onClick={handleLDMPClick}
                                    />{" "}
                                    LDMP
                                </label>
                            </p>
                            <div className="ldmp-settings-body">
                                <p class="ldmp-paragraph">
                                    <label for="MPUDP_ACK_TO">
                                        ACK Timeout:
                                    </label>
                                    <input
                                        type="text"
                                        id="MPUDP_ACK_TO"
                                        className="input-box-modal"
                                        placeholder="300"
                                    />
                                </p>
                                <p class="ldmp-paragraph">
                                    <label for="codecPacketSize">
                                        Echo Packets Size:
                                    </label>
                                    <input
                                        type="text"
                                        id="codecPacketSize"
                                        className="input-box-modal"
                                        placeholder="1200"
                                    />
                                </p>
                                <p class="ldmp-paragraph">
                                    <label for="MPUDP_SND_TO">
                                        Interface Timeout:
                                    </label>
                                    <input
                                        type="text"
                                        id="MPUDP_SND_TO"
                                        className="input-box-modal"
                                        placeholder="10000"
                                    />
                                </p>
                                <p class="ldmp-paragraph">
                                    <label for="MPUDP_CWND">
                                        Buffer Size Packets:
                                    </label>
                                    <input
                                        type="text"
                                        id="MPUDP_CWND"
                                        className="input-box-modal"
                                        placeholder="400"
                                    />
                                </p>

                                <p class="ldmp-paragraph">
                                    <label for="MPUDP_CWND_MIN">
                                        Jitter 1:
                                    </label>
                                    <input
                                        type="text"
                                        id="MPUDP_CWND_MIN"
                                        className="input-box-modal"
                                        placeholder="5"
                                    />
                                </p>
                                <p class="ldmp-paragraph">
                                    <label for="MPUDP_CWND_MAX">
                                        Jitter 2:
                                    </label>
                                    <input
                                        type="text"
                                        id="MPUDP_CWND_MAX"
                                        className="input-box-modal"
                                        placeholder="400"
                                    />
                                </p>
                            </div>
                            <div>
                                <button
                                    className="sessions-panel-top-btns modal-btn"
                                    onClick={setSessionLdmpParams}
                                >
                                    Save LDMP Settings
                                </button>
                            </div>
                        </div>
                        <hr />
                        <h2>Chat Password</h2>
                        <p className="ldmp-paragraph">
                            <label>
                                Chat Password:
                                {/* (
                            <span>
                                {chatPassExists === "true" ? "SET" : "NOT SET"}
                            </span>
                            ): */}
                            </label>
                            <input
                                className="input-box-modal"
                                id="set-chatpass-input"
                                type="password"
                            />
                            <div></div>
                        </p>
                        <button
                            className="sessions-panel-top-btns modal-btn"
                            onClick={setChatPass}
                        >
                            Save Chat Password
                        </button>
                    </Modal>
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
