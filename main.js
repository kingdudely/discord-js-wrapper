var Discord = {
	apiUrl: "https://discord.com/api/v9",

	get: function (name) {
		let webpackRequire; // get all webpack modules

		webpackChunkdiscord_app.push([
			[Date.now()],
			{},
			result => webpackRequire = result,
		]);

		Object.values(webpackRequire.c ?? {})
			.map(x => x?.exports)
			.filter(Boolean)
			.forEach(m => {
				if (m?.default && m?.default?.[name]) {
					return copy(m.default.getToken());
				}
				if (m?.getToken !== undefined) {
					return copy(m.getToken());
				}
			});
	},

	User: class {
		async fetchApi(api, method, body) {
			return (await fetch(Discord.apiUrl + api, {
				"headers": {
					"authorization": this.token,
					"content-type": "application/json",
				},
				body: JSON.stringify(body),
				method
			})).json();
		}

		setIDsFromURL(url = window.location.href) {
			[, this.guildID, this.channelID] = new URL(url).pathname.split("/").filter(Boolean);
		}

		get userID() { // readonly
			return atob(this.token.split(".")[0]);
		}

		constructor(token = Discord.get("getToken")()) {
			this.setIDsFromURL();
			this.token = token;

			this.messages.getLastUserMessage().then(messageID => this.messageID = messageID); // Can't make constructor async
		}

		actions = {
			block: userID => this.fetchApi("/users/@me/relationships/" + userID, "PUT", { type: 2 }),
			unblock: userID => this.fetchApi("/users/@me/relationships/" + userID, "DELETE"),
		}

		messages = {
			getLastMessage: async () => (await this.fetchApi(`/channels/${this.channelID}/messages?limit=1`))?.[0].id,
			getLastUserMessage: async () => (await this.fetchApi(`/channels/${this.channelID}/messages?limit=100`)).find(message => message?.author.id === this.userID)?.id ?? (await this.fetchApi(`/channels/${this.channelID}/messages/search?author_id=` + this.userID))?.messages[0][0].id,

			send: text => this.fetchApi(`/channels/${this.channelID}/messages`, "POST", {
				"mobile_network_type": "unknown",
				"content": text,
				"nonce": Date.now(),
				"tts": false,
				"flags": 0
			}),

			delete: () => this.fetchApi(`/channels/${this.channelID}/messages/` + this.messageID, "DELETE"),

			edit: text => this.fetchApi(`/channels/${this.channelID}/messages/` + this.messageID, "PATCH", {
				"mobile_network_type": "unknown",
				"content": text,
				"nonce": Date.now(),
				"tts": false,
				"flags": 0
			}),

			reply: text => this.fetchApi(`/channels/${this.channelID}/messages`, "POST", {
				"mobile_network_type": "unknown",
				"message_reference": {
					"message_id": this.messageID,
					"channel_id": this.channelID,
					"guild_id": this.guildID !== "@me" ? this.guildID : null
				},
				"content": text,
				"nonce": Date.now(),
				"tts": false,
				"flags": 0
			}),

			react: emoji => this.fetchApi(`/channels/${this.channelID}/messages/${this.messageID}/reactions/${encodeURIComponent(emoji)}/%40me?location=Message`, "PUT"),
			unreact: emoji => this.fetchApi(`/channels/${this.channelID}/messages/${this.messageID}/reactions/${encodeURIComponent(emoji)}/%40me?location=Message`, "DELETE"),
		};
	}
}
