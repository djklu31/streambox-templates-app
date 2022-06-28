import React from "react"
import NavBtn from "./NavBtn"
import {nanoid} from "nanoid"

export default function Navbar(props) {
    const navBtns = props.navBtns.map((route) => <NavBtn key={nanoid()} currentPageName={props.currentPageName} changeRoute={props.changeRoute} navBtn={route.routeName}/>);

    return (
        <div className="navbar">
            <header>
                <nav>
                    <img className="streambox-logo" src="/src/assets/images/streambox-logo.svg" />

                    <div className="routes-btns">
                        {navBtns}
                    </div>

                    <div className="logout-section">
                        Logged in:&nbsp;<span>Kenny</span><a className="logout-btn" href="/">Logout</a>
                    </div>
                </nav>
            </header>
        </div>
    )
}