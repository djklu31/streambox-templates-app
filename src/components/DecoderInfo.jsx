import React from "react"

export default function DecoderInfo({ decoderInfo }) {
    console.log(decoderInfo)

    function printoutQuality(timeElapsed, percentLost, forcePending) {
        let firstIndex
        let secondIndex
        let minsElapsed

        if (timeElapsed === null || typeof timeElapsed === "undefined") {
            forcePending = true
        } else {
            firstIndex = parseInt(timeElapsed.indexOf("hr")) + 2
            secondIndex = parseInt(timeElapsed.indexOf("min"))
            minsElapsed = parseInt(
                timeElapsed.substring(firstIndex, secondIndex).trim()
            )
        }

        if (forcePending || minsElapsed < 1) {
            return <span class="quality-badge pending-quality">Pending</span>
        } else if (percentLost <= 2) {
            return <span class="quality-badge good-quality">Good</span>
        } else if (percentLost > 2 && percentLost <= 8) {
            return <span class="quality-badge fair-quality">Fair</span>
        } else {
            return <span class="quality-badge bad-quality">Poor</span>
        }
    }

    return (
        <div className="device-record">
            <div className="device-record-text-wrapper">
                <div className="device-record-text-top">
                    {/* <div>Owner: Not Assigned</div> */}
                    <div>
                        IP: {decoderInfo.getAttribute("ip")}:
                        {decoderInfo.getAttribute("port")}
                    </div>
                    <div>
                        Duration:
                        {decoderInfo.getAttribute("time_elapsed_for_decoder")}
                    </div>
                </div>
                <div className="device-record-text-bottom">
                    <div>
                        Quality:
                        {printoutQuality(
                            decoderInfo.getAttribute(
                                "time_elapsed_for_decoder"
                            ),
                            decoderInfo.getAttribute("perc"),
                            decoderInfo.getAttribute("force_pending") == 1
                        )}
                    </div>
                    {/* <div>Email: joe@streambox.com</div> */}
                </div>
            </div>
            <button className="disconnect-btn">Disconnect</button>
        </div>
    )
}
