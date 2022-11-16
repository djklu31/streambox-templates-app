import React, { useState } from "react"
import Select from "react-select"

export default function SessionsPanel(props) {
    let [showEmailPage, setShowEmailPage] = useState(false)

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

    let emailOptions = [
        {
            value: "dave@streambox.com",
            label: "dave@streambox.com",
        },
        { value: "kenny@streambox.com", label: "kenny@streambox.com" },
        { value: "alex@streambox.com", label: "alex@streambox.com" },
        { value: "taylor@streambox.com", label: "taylor@streambox.com" },
    ]

    console.log(props.sessionDashXML)

    return showEmailPage ? (
        <div>
            <div className="sessions-panel-top">
                <div>
                    Session: <span className="session-id-top">$ABCDE1</span>
                </div>
                <input
                    placeholder="Enter Host Name"
                    className="host-name-input"
                    type="text"
                />
                <button className="sessions-panel-top-btns">
                    Send All Invites
                </button>
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
                        placeholder="Color Review of 'Blazing Saddles'"
                    />
                </div>
                <div className="email-page-body">
                    <div className="email-page-body-section">
                        <span>Email:</span>
                        <Select
                            className="email-page-body-select"
                            options={emailOptions}
                            isMulti
                            name="emails"
                            styles={styles}
                            classNamePrefix="select"
                        />
                        <button className="send-invite-btn">Send Invite</button>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="sessions-panel-container">
            <div className="sessions-panel-top">
                <div>
                    Session: <span className="session-id-top">$ABCDE1</span>
                </div>
                <button className="sessions-panel-top-btns">
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
            </div>
        </div>
    )
}
