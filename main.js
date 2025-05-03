{
    const apiUrl = "https://discord.com/api/v9";

    var Discord = {
        get: function (name) {
            let webpackRequire; // get all webpack modules

            webpackChunkdiscord_app.push([
                [Date.now()],
                {},
                result => webpackRequire = result,
            ]);

            for (const { exports, id } of Object.values(webpackRequire.c)) {
                if (typeof(exports?.[name]) === "function") {
                    return exports[name];
                }
                else if (id === name) {
                    return exports;
                }
                /*
                try {
                    return exports[name]();
                }
                catch {
                    if (id === name) {
                        return exports;
                    }
                } 
                */
            }
        },

        User: class {
            #fetchApi(api, method, body) {
                return fetch(apiUrl + api, {
                    "headers": {
                        "authorization": this.token,
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(body),
                    method
                })
            };

            get userID() { // readonly
                return atob(this.token.split(".")[0]);
            }

            constructor(token = Discord.get("getToken")()) {
                [, this.guildID, this.channelID] = new URL(window.location.href).pathname.split("/").filter(Boolean);
                this.token = token;

                this.messages.getLastUserMessage().then(messageID => {    
                    this.messageID = messageID;
                })
            }

            actions = {
                block: userID => {
                    this.#fetchApi("/users/@me/relationships/" + userID, "PUT", {
                        "type": 2,
                    });
                },

                unblock: userID => {
                    this.#fetchApi("/users/@me/relationships/" + userID, "DELETE");
                }
            }

            messages = {
                getLastMessage: async () => {
                    return this.#fetchApi(`/channels/${this.channelID}/messages?limit=1`)
                        .then(data => data.json())
                        .then(response => response?.[0].id);
                },

                getLastUserMessage: async () => {
                    return (await this.#fetchApi(`/channels/${this.channelID}/messages?limit=100`)
                        .then(data => data.json())
                        .then(response => response.find(message => message?.author.id === this.userID)?.id)
                    )

                        ??

                        this.#fetchApi(`/channels/${this.channelID}/messages/search?author_id=` + this.userID)
                            .then(data => data.json())
                            .then(response => response?.messages[0][0].id);
                },

                send: text => {
                    this.#fetchApi(`/channels/${this.channelID}/messages`, "POST", {
                        "mobile_network_type": "unknown",
                        "content": text,
                        "nonce": Date.now(),
                        "tts": false,
                        "flags": 0
                    });
                },

                delete: () => {
                    this.#fetchApi(`/channels/${this.channelID}/messages/` + this.messageID, "DELETE")
                },

                edit: text => {
                    this.#fetchApi(`/channels/${this.channelID}/messages/` + this.messageID, "PATCH", {
                        "mobile_network_type": "unknown",
                        "content": text,
                        "nonce": Date.now(),
                        "tts": false,
                        "flags": 0
                    });
                },

                reply: text => {
                    this.#fetchApi(`/channels/${this.channelID}/messages`, "POST", {
                        "mobile_network_type": "unknown",
                        "message_reference": {
                            "message_id": this.messageID,
                            "channel_id": this.channelID,
                            "guild_id": this.guildID !== "@me" && this.guildID // : null
                        },
                        "content": text,
                        "nonce": Date.now(),
                        "tts": false,
                        "flags": 0
                    });
                },

                react: emoji => {
                    this.#fetchApi(`/channels/${this.channelID}/messages/${this.messageID}/reactions/${encodeURIComponent(emoji)}/%40me?location=Message`, "PUT")
                },

                unreact: emoji => {
                    this.#fetchApi(`/channels/${this.channelID}/messages/${this.messageID}/reactions/${encodeURIComponent(emoji)}/%40me?location=Message`, "DELETE")
                },
            };
        }
    }
}
