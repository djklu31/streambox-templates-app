//set environment: true - local development, false - production
export let isLocalDev = false

export function debounce(callback, delay = 60000) {
    let timeout

    return () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            console.log("Restarting live reload")
            callback()
        }, delay)
    }
}

export function getRestEndpoint() {
    if (isLocalDev) {
        const hostname = "184.106.155.61"
        //moving port number
        const port = "8899"
        return `http://${hostname}:${port}`
    } else {
        return location.origin
    }
}

export async function logout() {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    let user
    let token

    if (urlParams.get("user") && urlParams.get("token")) {
        user = urlParams.get("user")
        token = urlParams.get("token")
    } else {
        //check local storage
        if (localStorage.getItem("user") && localStorage.getItem("token")) {
            user = localStorage.getItem("user")
            token = localStorage.getItem("token")
        }
    }
    const endpoint = location.origin

    let formData = new FormData()
    formData.append("username", user)
    formData.append("token", token)
    formData.append("fromreact", 1)
    formData.append("islogout", 1)

    let response
    if (isLocalDev) {
        response = await fetch("http://localhost:5005" + "/sbuiauth/auth.php", {
            method: "POST",
            body: formData,
        })
    } else {
        response = await fetch(endpoint + "/sbuiauth/auth.php", {
            method: "POST",
            body: formData,
        })
    }

    let json = await response.text()
    let [logoutStatus] = JSON.parse(json)

    if (logoutStatus === "logout success") {
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        window.location = `${location.origin}/sbuiauth`
    } else {
        alert("Something went wrong with the authentication server")
    }
}

//check if any url params present for userid
//if no url params passed in, check if local storage set with these vals
//if there are, then check against the 'db'
//if they match, then set local storage with these vals
//logout should destroy local storage for userid and token
export async function authenticate() {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    let user
    let token

    if (urlParams.get("user") && urlParams.get("token")) {
        user = urlParams.get("user")
        token = urlParams.get("token")
    } else {
        //check local storage
        if (localStorage.getItem("user") && localStorage.getItem("token")) {
            user = localStorage.getItem("user")
            token = localStorage.getItem("token")
        } else {
            return false
        }
    }

    const endpoint = location.origin

    let formData = new FormData()
    formData.append("username", user)
    formData.append("token", token)
    formData.append("fromreact", 1)

    let response
    if (isLocalDev) {
        response = await fetch("http://localhost:5005" + "/sbuiauth/auth.php", {
            method: "POST",
            body: formData,
        })
    } else {
        response = await fetch(endpoint + "/sbuiauth/auth.php", {
            method: "POST",
            body: formData,
        })
    }

    let json = await response.text()
    let [loginStatus] = JSON.parse(json)

    if (loginStatus === "login success") {
        //set local storage
        localStorage.setItem("user", user)
        localStorage.setItem("token", token)
        return true
    } else if (loginStatus === "login failure") {
        localStorage.removeItem("user")
        localStorage.removeItem("token")
        return false
    } else {
        alert("Something went wrong with the authentication server")
    }
}
