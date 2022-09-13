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

    function logout() {
        //TODO: change to real remote url
        localStorage.removeItem("user")
        localStorage.removeItem("pass")
        window.location = "http://localhost:5005/sbauth"
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
                        Logged in:&nbsp;
                        <span>{localStorage.getItem("user")}</span>
                        <a className="logout-btn" onClick={logout}>
                            Logout
                        </a>
                    </div>
                </nav>
            </header>
        </div>
    )
}
