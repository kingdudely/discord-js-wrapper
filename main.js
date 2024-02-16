var msg = {
    "send": "POST",
    "delete": "DELETE",
    "edit": "PATCH"
}

String.prototype.lastIndexNotOf = function(searchString) {
    for (var i = this.length; i > 0; i--) {
        for (var x = 0; x < searchString.length; x++) {
            if (searchString.substr(x, 1) != this.substr(i - 1, 1) && x + 1 == searchString.length) {
                return i;
            }
        }
    }
    return -1;
}

function res(url) { // removeextraslash
    var lino = url.lastIndexNotOf("/")
    return url.substr(0, (lino != -1) ? lino : undefined);
}
class config {
    constructor(token = "", url = window.location.href, channelID = res(url).substr(res(url).lastIndexOf("/") + 1)){
        this.token = token;
        this.url = url;
        this.channelID = channelID;
    }
}

function message(method, message, config, messageID = Date.now()) {
    fetch("https://discord.com/api/v9/channels/" + config.channelID + "/messages" + ((method == msg.delete || method == msg.edit) ? "/" + messageID : ""), {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.9",
            "authorization": config.token,
            "cache-control": "no-cache",
            "content-type": "application/json",
            "pragma": "no-cache",
            "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Microsoft Edge\";v=\"121\", \"Chromium\";v=\"121\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-debug-options": "bugReporterEnabled",
            "x-discord-locale": "en-US",
            "x-discord-timezone": "America/New_York",
            "x-super-properties": "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiQ2hyb21lIiwiZGV2aWNlIjoiIiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCkgQXBwbGVXZWJLaXQvNTM3LjM2IChLSFRNTCwgbGlrZSBHZWNrbykgQ2hyb21lLzEyMS4wLjAuMCBTYWZhcmkvNTM3LjM2IEVkZy8xMjEuMC4wLjAiLCJicm93c2VyX3ZlcnNpb24iOiIxMjEuMC4wLjAiLCJvc192ZXJzaW9uIjoiMTAiLCJyZWZlcnJlciI6IiIsInJlZmVycmluZ19kb21haW4iOiIiLCJyZWZlcnJlcl9jdXJyZW50IjoiIiwicmVmZXJyaW5nX2RvbWFpbl9jdXJyZW50IjoiIiwicmVsZWFzZV9jaGFubmVsIjoic3RhYmxlIiwiY2xpZW50X2J1aWxkX251bWJlciI6MjY2MTU5LCJjbGllbnRfZXZlbnRfc291cmNlIjpudWxsfQ=="
        },
        "referrer": config.url,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": JSON.stringify({
            "mobile_network_type": "unknown",
            "content": message,
            "nonce": parseInt(messageID),
            "tts": false,
            "flags": 0
        }),
        "method": method,
        "mode": "cors",
        "credentials": "include"
    });
}
