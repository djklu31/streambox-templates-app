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

//check if any url params present for userid
//if no url params passed in, check if local storage set with these vals
//if there are, then check against the 'db'
//if they match, then set local storage with these vals
//logout should destroy local storage for userid and pass
export async function authenticate() {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    let user
    let pass

    if (urlParams.get("user") && urlParams.get("pass")) {
        user = urlParams.get("user")
        pass = urlParams.get("pass")
    } else {
        //check local storage
        if (localStorage.getItem("user") && localStorage.getItem("pass")) {
            user = localStorage.getItem("user")
            pass = localStorage.getItem("pass")
        } else {
            return false
        }
    }

    const endpoint = location.origin

    let formData = new FormData()
    formData.append("username", user)
    formData.append("password", pass)
    formData.append("fromreact", true)

    const response = await fetch(endpoint + "/sbuiauth/auth.php", {
        method: "POST",
        body: formData,
    })

    let json = await response.text()
    let [loginStatus] = JSON.parse(json)

    if (loginStatus === "login success") {
        //set local storage
        localStorage.setItem("user", user)
        localStorage.setItem("pass", pass)
        return true
    } else if (loginStatus === "login failure") {
        localStorage.removeItem("user")
        localStorage.removeItem("pass")
        return false
    } else {
        alert("Something went wrong with the authentication server")
    }
}
