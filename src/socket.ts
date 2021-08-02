import WebSocket = require("ws");

export class ConnectionSocket {

	socket_url: String;
	token: String | undefined;
	is_in_call: Boolean;
	websocket: WebSocket | undefined = undefined;


	constructor(socket_url: String, token: String | undefined) {
		this.socket_url = socket_url;
		this.token = token;
		this.is_in_call = true;
	}

	async initialize(): Promise<WebSocket> {
		return new Promise((resolve, reject) => {
			this.websocket = new WebSocket(this.socket_url as string);
			this.websocket.onopen = _ => {
				console.log("Websocket for " + this.socket_url + " is ready!");
				this.is_in_call = false;
				resolve(this.websocket as WebSocket);
			};
		});
	}

	async socket_call(endpoint: String, data: Object): Promise<Object> {
		return new Promise((resolve, reject) => {
			if (this.is_in_call) {
				reject("Socket in call already!");
			}

			if(!!this.websocket) {
				this.websocket.onmessage = msg => {
					console.log("Websocket did recive: " + msg.data);
					resolve(JSON.parse(msg.data as any));
				};

				this.websocket.send(JSON.stringify({
					...{
						route: endpoint,
						token: this.token
					},
					...data
				}));
			} else {
				reject("Call initialize first!");
			}
		});
	}

	async wait_for_message(): Promise<Object> {
		return new Promise((resolve, reject) => {
			if (this.is_in_call) {
				reject("Socket in call already!");
			}

			if(!!this.websocket) {
				this.websocket.onmessage = msg => {
					console.log("Websocket did recive: " + msg.data);
					resolve(JSON.parse(msg.data as any));
				};
			} else {
				reject("Call initialize first!");
			}
		});
	}
}