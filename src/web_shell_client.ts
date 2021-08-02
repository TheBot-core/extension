import { ConnectionSocket } from "./socket";

export class WebSellClient extends ConnectionSocket {
	timeout: NodeJS.Timeout | undefined;
	send_message: Function;

	constructor(url: String, token: String, send_message: Function) {
		super(url, token);

		this.send_message = send_message;
	}

	async execute(msg: String): Promise<void> {
		return new Promise(async (resolve, reject) => {
			if (!this.websocket) {
				await this.initialize();
			}

			if(this.timeout) {
				clearTimeout(this.timeout);
			}

			this.timeout = setTimeout(() => {
				console.log("Closing unneeded socket!");
				if (this.websocket) {
					this.websocket.close();
					delete this.websocket;
				}
				this.timeout = undefined;
			}, 1000 * 30);

			if(this.websocket) {
				this.websocket.onmessage = msg => {
					console.log(msg);
					this.send_message(msg.data);
				};

				this.websocket.send(JSON.stringify({
					route: "api/shell",
					token: this.token,
					command: msg
				}));
			}

			resolve();
		});
	}
}