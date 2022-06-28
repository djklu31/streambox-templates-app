import React from "react"

export default function NavBtn(props) {
    let classList = "nav-btn";

    if (props.currentPageName === props.navBtn) {
        classList = "nav-btn selected-route"
        console.log("PRESENT");
    }

    return (
        <a onClick={() => props.changeRoute(props.navBtn)} className={classList}>{props.navBtn}</a>
    )
}