globalThis.Discord = {
	get modules() {
		return webpackChunkdiscord_app.push([[Symbol()], {}, m => m])?.c ?? {} // Math.random() or Date.now()
	},

	apiUrl: "https://discord.com/api/v9",

	User: class {
		id = {
			message: null
		}

		fetchApi = async (api, method, body) => 
			(await fetch(Discord.apiUrl + api, {
				headers: {
					authorization: this.token,
					"content-type": "application/json",
				},
				body: JSON.stringify(body),
				method
			})).json();

		setIDsFromURL(url = window.location.href) {
			[, this.id.guild, this.id.channel] = new URL(url).pathname.split("/").filter(Boolean);
		}

		constructor(token = Object.values(Discord.modules).map(x => x?.exports?.default ?? x?.exports).filter(Boolean).find(m => m?.getToken)?.getToken()) {
			this.setIDsFromURL();
			this.token = token;

			Object.defineProperty(this.id, "user", { get: () => atob(this.token.split(".")[0]) })
		}

		actions = {
			block: userID => this.fetchApi("/users/@me/relationships/" + userID, "PUT", { type: 2 }),
			unblock: userID => this.fetchApi("/users/@me/relationships/" + userID, "DELETE"),
		}

		messages = {
			getLastMessage: async () => (await this.fetchApi(`/channels/${this.id.channel}/messages?limit=1`))?.[0].id,
			getLastUserMessage: async () => (await this.fetchApi(`/channels/${this.id.channel}/messages?limit=100`)).find(message => message?.author.id === this.id.user)?.id ?? (await this.fetchApi(`/channels/${this.id.channel}/messages/search?author_id=` + this.id.user))?.messages[0][0].id,

			send: content => this.fetchApi(`/channels/${this.id.channel}/messages`, "POST", {
				content,
				mobile_network_type: "unknown",
				nonce: Date.now(),
				tts: false,
				flags: 0
			}),

			delete: () => this.fetchApi(`/channels/${this.id.channel}/messages/` + this.id.message, "DELETE"),

			edit: content => this.fetchApi(`/channels/${this.id.channel}/messages/` + this.id.message, "PATCH", {
				content,
				mobile_network_type: "unknown",
				nonce: Date.now(),
				tts: false,
				flags: 0
			}),

			reply: content => this.fetchApi(`/channels/${this.id.channel}/messages`, "POST", {
				content,
				mobile_network_type: "unknown",
				message_reference: {
					message_id: this.id.message,
					channel_id: this.id.channel,
					guild_id: +this.id.guild ? this.id.guild : null // guildID !== "@me"
				},
				nonce: Date.now(),
				tts: false,
				flags: 0
			}),

			react: emoji => this.fetchApi(`/channels/${this.id.channel}/messages/${this.id.message}/reactions/${encodeURIComponent(emoji)}/%40me?location=Message`, "PUT"),
			unreact: emoji => this.fetchApi(`/channels/${this.id.channel}/messages/${this.id.message}/reactions/${encodeURIComponent(emoji)}/%40me?location=Message`, "DELETE"),
		};
	}
}
