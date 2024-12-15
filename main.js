String.prototype.lastIndexNotOf = function(searchString) {
    for (var i = this.length - 1; i >= 0; i--) {
        for (var x = 0; x < searchString.length; x++) {
            if (searchString.substr(x, 1) != this.substr(i - 1, 1) && x + 1 == searchString.length) {
                return i;
            }
        }
    }
    return -1;
}

String.prototype.splitNth = function(nth) {
    let result = [];

    for (let i = 0; i < this.length; i += nth) {
        result[i / nth] = this.substr(i, nth);
    }

    return result;
}

class message_url {
    constructor(url = window.location.href) {
        this.url = url;

        let _subdirectories = new URL(window.location.href).pathname.split("/").filter(subdirectory => subdirectory.length > 0);

        this.guildID = _subdirectories[1];
        this.channelID = _subdirectories[2];
    }
}

var discord = {
    run: function(func) {
        let wpRequire;
        webpackChunkdiscord_app.push([
            [Date.now()], // chunk ID. using the current time like this works fine
            {}, // modules mapped `id: (wpModule, wpExports, wpRequire) => {}`. these chunks can be loaded by `wpRequire(id)`
            _wpRequire => (wpRequire = _wpRequire), // callback that runs when this chunk is loaded (it will run immediately after calling push(). assigning wpRequre here to an outside variable makes it convenient to use
        ]);
        for (var i in wpRequire.c) {
            let exports = wpRequire.c[i].exports;
            if (typeof(exports?.[func]) == "function") {
                return exports?.[func]();
            } else if (wpRequire.c[i].id == func) {
                return wpRequire.c[i].id;
            }
        }
    },

    User: class {
        constructor(token = discord.run("getToken"), url_config = new message_url()) {
            this.token = token;
            this.id = atob(token.match("^[^.]+")[0]);
            this.url_config = url_config;

            this.actions = {
                block: async (id) => {
                    fetch(`https://discord.com/api/v9/users/@me/relationships/${id}`, {
                        "headers": {
                            "authorization": this.token,
                            "content-type": "application/json",
                        },
                        "body": "{\"type\":2}",
                        "method": "PUT",
                    })
                },

                unblock: async (id) => {
                    fetch(`https://discord.com/api/v9/users/@me/relationships/${id}`, {
                        "headers": {
                            "authorization": this.token,
                            "content-type": "application/json",
                        },
                        "method": "DELETE",
                    });
                }
            }

            this.message = {
                get_last_message: async () => {
                    let result = null;

                    let fetched = await fetch(`https://discord.com/api/v9/channels/${this.url_config.channelID}/messages?limit=1`, {
                        "headers": {
                            "authorization": this.token,
                        },
                        "method": "GET",
                    }).then(data => data.json()).then(response => {
                        if (response.length > 0) {
                            result = response[0].id;
                        }
                    });

                    return result;
                },

                get_last_user_message: async () => {
                    let result = null;

                    let fetched = await fetch(`https://discord.com/api/v9/channels/${this.url_config.channelID}/messages?limit=100`, {
                        "headers": {
                            "authorization": this.token,
                        },
                        "method": "GET",
                    }).then(data => data.json()).then(response => {
                        response = response.filter(message => message.author.id == this.id);
                        if (response.length > 0) {
                            result = response[0].id;
                        }
                    })

                    if (!result) {
                        let fetched1 = await fetch(`https://discord.com/api/v9/channels/${this.url_config.channelID}/messages/search?author_id=${this.id}`, {
                            "headers": {
                                "authorization": this.token,
                            },
                            "method": "GET",
                        }).then(data => data.json()).then(response => {
                            if (response.messages.length > 0) {
                                result = response.messages[0][0].id;
                            }
                        });
                    }
                    return result;
                },

                send: (text) => {
                    let body = {
                        "mobile_network_type": "unknown",
                        "content": text,
                        "nonce": Date.now(),
                        "tts": false,
                        "flags": 0
                    };

                    fetch(`https://discord.com/api/v9/channels/${this.url_config.channelID}/messages`, {
                        "headers": {
                            "authorization": this.token,
                            "content-type": "application/json",
                        },
                        "body": JSON.stringify(body),
                        "method": "POST",
                    });
                },

                delete: async (id) => {
                    if (!id) {
                        id = await this.message.get_last_user_message();
                    }

                    fetch(`https://discord.com/api/v9/channels/${this.url_config.channelID}/messages/${id}`, {
                        "headers": {
                            "authorization": this.token,
                            "content-type": "application/json",
                        },
                        "method": "DELETE",
                    });
                },

                edit: async (text, id) => {
                    if (!id) {
                        id = await this.message.get_last_user_message();
                    }

                    let body = {
                        "mobile_network_type": "unknown",
                        "content": text,
                        "nonce": Date.now(),
                        "tts": false,
                        "flags": 0
                    };

                    fetch(`https://discord.com/api/v9/channels/${this.url_config.channelID}/messages/${id}`, {
                        "headers": {
                            "authorization": this.token,
                            "content-type": "application/json",
                        },
                        "body": JSON.stringify(body),
                        "method": "PATCH",
                    });
                },

                reply: async (text, id) => {
                    if (!id) {
                        id = await this.message.get_last_message();
                    }

                    let body = {
                        "mobile_network_type": "unknown",
                        "message_reference": {
                            "message_id": id,
                            "channel_id": url_config.channelID,
                            "guild_id": ((url_config.guildID == "@me") ? null : url_config.guildID)
                        },
                        "content": text,
                        "nonce": Date.now(),
                        "tts": false,
                        "flags": 0
                    };

                    fetch(`https://discord.com/api/v9/channels/${this.url_config.channelID}/messages`, {
                        "headers": {
                            "authorization": this.token,
                            "content-type": "application/json",
                        },
                        "body": JSON.stringify(body),
                        "method": "POST",
                    });
                },

                react: async (emoji, id) => {
                    if (!id) {
                        id = await this.message.get_last_message();
                    }

                    fetch(`https://discord.com/api/v9/channels/${this.url_config.channelID}/messages/${id}/reactions/${encodeURI(emoji)}/%40me?location=Message`, {
                        "headers": {
                            "authorization": this.token,
                            "content-type": "application/json",
                        },
                        "method": "PUT",
                    })
                },

                unreact: async (emoji, id) => {
                    if (!id) {
                        id = await this.message.get_last_message();
                    }

                    fetch(`https://discord.com/api/v9/channels/${this.url_config.channelID}/messages/${id}/reactions/${encodeURI(emoji)}/%40me?location=Message`, {
                        "headers": {
                            "authorization": this.token,
                            "content-type": "application/json",
                        },
                        "method": "DELETE",
                    })
                },
            };
        }
    }
}
