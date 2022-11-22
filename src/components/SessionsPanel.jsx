import React, { useEffect, useState } from "react"
import Select from "react-select"
import DecoderInfo from "./DecoderInfo"
import { isLocalDev } from "../Utils"

export default function SessionsPanel(props) {
    let [showEmailPage, setShowEmailPage] = useState(false)
    let [selectedOptions, setSelectedOptions] = useState([])
    let [emailOptions, setEmailOptions] = useState(
        JSON.parse(localStorage.getItem("storedEmails"))
    )
    let sessionDashXML = props.sessionDashXML
    const endpoint = location.origin

    async function handleCreateNewSessionBtnWrapper() {
        let sessionIDElems = document.getElementsByClassName("session-id-top")
        for (let elem of sessionIDElems) {
            elem.innerHTML = `<span style="color: green">Creating new session...</span>`
        }

        await props.handleCreateNewSessionBtn()
    }

    function sendInvites() {
        const hostName = document.querySelector(".host-name-input").value
        const emailTitle = document.querySelector(
            ".email-page-title-input"
        ).value
        let sessionID = document.querySelector(".session-id-top").textContent
        sessionID = sessionID.substring(1, sessionID.length)

        let emailAddresses = selectedOptions.map((email) => email.value)

        if (hostName && emailTitle && emailAddresses.length > 0) {
            sendEmailsViaPHP(emailAddresses, hostName, emailTitle, sessionID)
        } else {
            alert(
                "Please enter a host name, session title and at least one email address."
            )
        }
    }

    function validateEmail(email) {
        var re = /\S+@\S+\.\S+/
        return re.test(email)
    }

    useEffect(() => {
        if (document.querySelector(".email-page-body-select")) {
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

                            console.log(storedEmails)
                            console.log(emailOptions)

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

    async function sendEmailsViaPHP(
        emailAddresses,
        hostName,
        emailTitle,
        sessionID
    ) {
        if (isLocalDev) {
            await fetch(
                `http://localhost:5005/sbuiauth/sendEmail.php?emailAddresses=${emailAddresses.join(
                    ","
                )}&hostName=${encodeURIComponent(
                    hostName
                )}&emailTitle=${encodeURIComponent(
                    emailTitle
                )}&sessionID=${sessionID}`
            )
        } else {
            await fetch(
                `${endpoint}/sbuiauth/sendEmail.php?emailAddresses=${emailAddresses.join(
                    ","
                )}&hostName=${encodeURIComponent(
                    hostName
                )}&emailTitle=${encodeURIComponent(
                    emailTitle
                )}&sessionID=${sessionID}`
            )
        }
    }

    const handleChange = (options) => {
        setSelectedOptions(options)
    }

    if (sessionDashXML === "") {
        return (
            <div className="sessions-panel-container">
                <div className="sessions-panel-top">
                    <div>
                        Session:{" "}
                        <span
                            className="session-id-top"
                            style={{ color: "red" }}
                        >
                            none
                        </span>
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
                <div id="no-session-msg">
                    <span>Fetching Session Dashboard Data...</span>
                </div>
            </div>
        )
    }
    if (sessionDashXML === "none") {
        return (
            <div className="sessions-panel-container">
                <div className="sessions-panel-top">
                    <div>
                        Session: <span className="session-id-top">none</span>
                    </div>
                    <button
                        className="sessions-panel-top-btns"
                        onClick={handleCreateNewSessionBtn}
                    >
                        Create New Session
                    </button>
                    <button className="sessions-panel-top-btns" disabled>
                        Invite to Session...
                    </button>
                </div>
                <hr />
                <div id="no-session-msg">Please create a new session</div>
            </div>
        )
    } else {
        let parser = new DOMParser()
        let xmlDoc = parser.parseFromString(sessionDashXML, "text/xml")
        let parsedXML = xmlDoc.getElementsByTagName("body")[0]
        let decoderInfo = xmlDoc.getElementsByTagName("body")[0].childNodes

        function handleClick(text) {
            if (text === "openEmailPage") {
                setShowEmailPage(true)
            } else if (text === "close") {
                setShowEmailPage(false)
            }
        }

        const styles = {
            option: (provided, state) => ({
                ...provided,
                color: "black",
            }),
        }

        let decInfoArray = []

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
                        Session:{" "}
                        <span className="session-id-top">
                            {parsedXML.getAttribute("dec_key")}
                        </span>
                    </div>
                    <input
                        placeholder=" Enter Host Name"
                        className="host-name-input"
                        type="text"
                    />
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
                        Session:{" "}
                        <span className="session-id-top">
                            {parsedXML.getAttribute("dec_key")}
                        </span>
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
                    <div id="no-session-msg">No Decoders Connected</div>
                )}
                {/* <div className="device-record">
                    <div className="device-record-text-wrapper">
                        <div className="device-record-text-top">
                            <div>Owner: Not Assigned</div>
                            <div>IP: 123.456.789</div>
                            <div>Duration: 0hr 31min</div>
                        </div>
                        <div className="device-record-text-bottom">
                            <div>
                                Quality:
                                <span className="quality-text-good">Good</span>
                            </div>
                            <div>Email: joe@streambox.com</div>
                        </div>
                    </div>
                    <button className="disconnect-btn">Disconnect</button>
                </div>
    
                <div className="device-record">
                    <div className="device-record-text-wrapper">
                        <div className="device-record-text-top">
                            <div>Owner: Not Assigned</div>
                            <div>IP: 123.456.789</div>
                            <div>Duration: 0hr 31min</div>
                        </div>
                        <div className="device-record-text-bottom">
                            <div>
                                Quality:
                                <span className="quality-text-fair">Fair</span>
                            </div>
                            <div>Email: joe@streambox.com</div>
                        </div>
                    </div>
                    <button className="disconnect-btn">Disconnect</button>
                </div>
    
                <div className="device-record">
                    <div className="device-record-text-wrapper">
                        <div className="device-record-text-top">
                            <div>Owner: Not Assigned</div>
                            <div>IP: 123.456.789</div>
                            <div>Duration: 0hr 31min</div>
                        </div>
                        <div className="device-record-text-bottom">
                            <div>
                                Quality:
                                <span className="quality-text-bad">Bad</span>
                            </div>
                            <div>Email: joe@streambox.com</div>
                        </div>
                    </div>
                    <button className="disconnect-btn">Disconnect</button>
                </div>
    
                <div className="device-record">
                    <div className="device-record-text-wrapper">
                        <div className="device-record-text-top">
                            <div>Owner: Not Assigned</div>
                            <div>IP: 123.456.789</div>
                            <div>Duration: 0hr 31min</div>
                        </div>
                        <div className="device-record-text-bottom">
                            <div>
                                Quality:
                                <span className="quality-text-good">Good</span>
                            </div>
                            <div>Email: joe@streambox.com</div>
                        </div>
                    </div>
                    <button className="disconnect-btn">Disconnect</button>
                </div>
    
                <div className="device-record">
                    <div className="device-record-text-wrapper">
                        <div className="device-record-text-top">
                            <div>Owner: Not Assigned</div>
                            <div>IP: 123.456.789</div>
                            <div>Duration: 0hr 31min</div>
                        </div>
                        <div className="device-record-text-bottom">
                            <div>
                                Quality:
                                <span className="quality-text-good">Good</span>
                            </div>
                            <div>Email: joe@streambox.com</div>
                        </div>
                    </div>
                    <button className="disconnect-btn">Disconnect</button>
                </div>
                <div className="device-record">
                    <div className="device-record-text-wrapper">
                        <div className="device-record-text-top">
                            <div>Owner: Not Assigned</div>
                            <div>IP: 123.456.789</div>
                            <div>Duration: 0hr 31min</div>
                        </div>
                        <div className="device-record-text-bottom">
                            <div>
                                Quality:
                                <span className="quality-text-fair">Fair</span>
                            </div>
                            <div>Email: joe@streambox.com</div>
                        </div>
                    </div>
                    <button className="disconnect-btn">Disconnect</button>
                </div>
    
                <div className="device-record">
                    <div className="device-record-text-wrapper">
                        <div className="device-record-text-top">
                            <div>Owner: Not Assigned</div>
                            <div>IP: 123.456.789</div>
                            <div>Duration: 0hr 31min</div>
                        </div>
                        <div className="device-record-text-bottom">
                            <div>
                                Quality:
                                <span className="quality-text-bad">Bad</span>
                            </div>
                            <div>Email: joe@streambox.com</div>
                        </div>
                    </div>
                    <button className="disconnect-btn">Disconnect</button>
                </div>
    
                <div className="device-record">
                    <div className="device-record-text-wrapper">
                        <div className="device-record-text-top">
                            <div>Owner: Not Assigned</div>
                            <div>IP: 123.456.789</div>
                            <div>Duration: 0hr 31min</div>
                        </div>
                        <div className="device-record-text-bottom">
                            <div>
                                Quality:
                                <span className="quality-text-good">Good</span>
                            </div>
                            <div>Email: joe@streambox.com</div>
                        </div>
                    </div>
                    <button className="disconnect-btn">Disconnect</button>
                </div>
                <div className="device-record">
                    <div className="device-record-text-wrapper">
                        <div className="device-record-text-top">
                            <div>Owner: Not Assigned</div>
                            <div>IP: 123.456.789</div>
                            <div>Duration: 0hr 31min</div>
                        </div>
                        <div className="device-record-text-bottom">
                            <div>
                                Quality:
                                <span className="quality-text-fair">Fair</span>
                            </div>
                            <div>Email: joe@streambox.com</div>
                        </div>
                    </div>
                    <button className="disconnect-btn">Disconnect</button>
                </div>
    
                <div className="device-record">
                    <div className="device-record-text-wrapper">
                        <div className="device-record-text-top">
                            <div>Owner: Not Assigned</div>
                            <div>IP: 123.456.789</div>
                            <div>Duration: 0hr 31min</div>
                        </div>
                        <div className="device-record-text-bottom">
                            <div>
                                Quality:
                                <span className="quality-text-bad">Bad</span>
                            </div>
                            <div>Email: joe@streambox.com</div>
                        </div>
                    </div>
                    <button className="disconnect-btn">Disconnect</button>
                </div>
    
                <div className="device-record">
                    <div className="device-record-text-wrapper">
                        <div className="device-record-text-top">
                            <div>Owner: Not Assigned</div>
                            <div>IP: 123.456.789</div>
                            <div>Duration: 0hr 31min</div>
                        </div>
                        <div className="device-record-text-bottom">
                            <div>
                                Quality:
                                <span className="quality-text-good">Good</span>
                            </div>
                            <div>Email: joe@streambox.com</div>
                        </div>
                    </div>
                    <button className="disconnect-btn">Disconnect</button>
                </div> */}
            </div>
        )
    }
}
