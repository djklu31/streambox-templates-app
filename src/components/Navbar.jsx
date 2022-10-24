import React from "react"
import NavBtn from "./NavBtn"
import { isLocalDev, logout, getRestEndpoint } from "../Utils"

export default function Navbar(props) {
    let navBtns
    const endpoint = getRestEndpoint()

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

    async function findCorrectImage() {
        let svgPromise
        let pngPromise
        let jpgPromise

        if (isLocalDev) {
            svgPromise = fetch("/images/logo.svg")
            pngPromise = fetch("/images/logo/logo.png")
            jpgPromise = fetch("/images/logo/logo.jpg")
        } else {
            svgPromise = fetch(endpoint + "/sbuiauth/logo/logo.svg")
            pngPromise = fetch(endpoint + "/sbuiauth/logo/logo.png")
            jpgPromise = fetch(endpoint + "/sbuiauth/logo/logo.jpg")
        }

        let [svgRes, pngRes, jpgRes] = await Promise.all([
            svgPromise,
            pngPromise,
            jpgPromise,
        ])

        const logo = document.querySelector(".logo")
        let endpointString

        if (isLocalDev) {
            endpointString = "/images/"
        } else {
            endpointString = endpoint + "/sbuiauth/logo/"
        }

        if (svgRes.statusText === "OK") {
            logo.src = endpointString + "logo.svg"
        } else if (pngRes.statusText === "OK") {
            logo.src = endpointString + "logo.png"
        } else if (jpgRes.statusText === "OK") {
            logo.src = endpointString + "logo.jpg"
        }

        console.log(`End ignore this`)
    }

    console.log(`Ignore following fetch errors regarding logos.
      This is a result of UI reaching out to find a "heartbeat" to support mutiple extensions:`)

    findCorrectImage()

    async function logoutWrapper() {
        logout()
    }

    return (
        <div className="navbar">
            <header>
                <nav>
                    <img className="logo" />

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
                        <a className="logout-btn" onClick={logoutWrapper}>
                            Logout
                        </a>
                    </div>
                </nav>
            </header>
        </div>
    )
}
