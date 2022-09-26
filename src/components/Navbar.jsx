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

    async function findCorrectImage() {
        const svgPromise = fetch("/images/logo.svg")
        const pngPromise = fetch("/images/logo.png")
        const jpgPromise = fetch("/images/logo.jpg")

        let [svgRes, pngRes, jpgRes] = await Promise.all([
            svgPromise,
            pngPromise,
            jpgPromise,
        ])

        const logo = document.querySelector(".logo")

        if (svgRes.statusText === "OK") {
            logo.src = "/images/logo.svg"
        } else if (pngRes.statusText === "OK") {
            logo.src = "/images/logo.png"
        } else if (jpgRes.statusText === "OK") {
            logo.src = "/images/logo.jpg"
        }
    }

    findCorrectImage()

    function logout() {
        //TODO: change to real remote url
        localStorage.removeItem("user")
        localStorage.removeItem("pass")
        window.location = `${location.origin}/sbuiauth`
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
                        <a className="logout-btn" onClick={logout}>
                            Logout
                        </a>
                    </div>
                </nav>
            </header>
        </div>
    )
}
