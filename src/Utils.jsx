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