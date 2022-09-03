import React from "react"
import NavBtn from "./NavBtn"

export default function Navbar(props) {
    let navBtns

    if (props.navBtns.length === 0) {
        navBtns = ""
    } else {
        navBtns = props.navBtns.map((route, index) => (
            <NavBtn
                key={`nav-btn-${index}`}
                currentPageName={props.currentPageName}
                changeRoute={props.changeRoute}
                navBtn={route.routeName}
            />
        ))
    }

    return (
        <div className="navbar">
            <header>
                <nav>
                    <img
                        className="streambox-logo"
                        src="/images/streambox-logo.svg"
                    />

                    <div className="routes-btns">{navBtns}</div>

                    <div className="logout-section">
                        <a
                            className="settings-btn"
                            onClick={props.openSettings}
                        >
                            Settings
                        </a>
                        Logged in:&nbsp;<span>Kenny</span>
                        <a className="logout-btn" href="/">
                            Logout
                        </a>
                    </div>
                </nav>
            </header>
        </div>
    )
}
