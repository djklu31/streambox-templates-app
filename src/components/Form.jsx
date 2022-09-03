import React from "react"

export default function Form(props) {
    return <form onSubmit={props.handleFormSubmit}>{props.mappedFields}</form>
}
