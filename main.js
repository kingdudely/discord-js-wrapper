function run(func){
    let wpRequire;
    webpackChunkdiscord_app.push([
      [Date.now()], // chunk ID. using the current time like this works fine
      {}, // modules mapped `id: (wpModule, wpExports, wpRequire) => {}`. these chunks can be loaded by `wpRequire(id)`
      _wpRequire => (wpRequire = _wpRequire), // callback that runs when this chunk is loaded (it will run immediately after calling push(). assigning wpRequre here to an outside variable makes it convenient to use
    ]);
    for (var i in wpRequire.c){
        let exports = wpRequire.c[i].exports;
        if (typeof(exports?.[func]) == "function"){
            return exports?.[func]();
        } else if (wpRequire.c[i].id == func){
            return wpRequire.c[i].id;
        }
    }
}

if (messages == undefined){
    var messages = [];
}

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
    constructor(token = run("getToken"), url = window.location.href){ // channelID = res(url).substr(res(url).lastIndexOf("/") + 1)
        this.token = token;
        this.url = res(url);
        this.channelID = url.substr(url.lastIndexOf("/") + 1);
        this.guildID = url.substr(url.substr(0, url.lastIndexOf("/")).lastIndexOf("/") + 1, url.lastIndexOf("/") - url.substr(0, url.lastIndexOf("/")).lastIndexOf("/") - 1);
    }
}

async function message(method, message, config, replyMsgID, messageID) {
    var nomsgid = messageID == undefined;
    if (nomsgid){
        if (method == msg.send){
            messageID = Date.now();
        } else {
            if (messages.length){
                messageID = messages[messages.length - 1];
            } else {
                console.error("ERROR: NUMBER OF PREVIOUS MESSAGES SENT WITH MSG.SEND IS 0\n\nSEND A MESSAGE WITH MSG.SEND FIRST AND THEN USE MSG.EDIT/MSG.DELETE WITHOUT MESSAGE ID TO MANIPULATE THE MOST RECENT MESSAGE")
                return null;
            }
        }
    }
    var body = {
        "mobile_network_type": "unknown",
        "content": message,
        "nonce": parseInt(messageID),
        "tts": false,
        "flags": 0
    }
    var vldrID = await fetch("https://discord.com/api/v9/channels/" + config.channelID + "/messages/" + replyMsgID, {
        method: "PATCH",
        headers: {
            "authorization": config.token
        }
    }) // valid reply message ID
    .then(response => response.json())
    .then(data => {
        if (replyMsgID){
            body["message_reference"] = {
                "message_id": replyMsgID,
                "channel_id": config.channelID,
                "guild_id": ((config.guildID == "@me") ? null : config.guildID)
            }
        }
    })
    .catch(error => {});
    var request = await fetch("https://discord.com/api/v9/channels/" + config.channelID + "/messages" + ((method == msg.delete || method == msg.edit) ? "/" + messageID : ""), {
        "headers": {
            "authorization": config.token,
            "content-type": "application/json",
        },
        "referrer": config.url,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": JSON.stringify(body),
        "method": method,
        "mode": "cors",
        "credentials": "include"
    });

    if (method == msg.send){
        var json = await request.json();
        messages[((messages.length != undefined) ? messages.length : 0)] = json.id;
    } else if (method == msg.delete) {
        messages.pop();
    }
}
