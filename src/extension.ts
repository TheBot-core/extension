import * as vscode from 'vscode';
import WebSocket = require('ws');
import { TokenProvider } from './authentication';
import { websocket_url } from './constants';
import { ConnectionSocket } from './socket';
import { TreeFunction, TreeProvider } from './tree_provider';
import { secondsToDhms } from './util';
import { WebSellClient } from './web_shell_client';


export function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "thebot" is now active!');

	var status_bar_item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	status_bar_item.show();
	context.subscriptions.push(status_bar_item);

	status_bar_item.text = "Connecting...";
	status_bar_item.command = undefined;

	var sock = new ConnectionSocket(websocket_url, undefined);
	sock.initialize().then((socket: WebSocket) => {
		socket.onclose = _ => {
			status_bar_item.text = "Lost connection!";
			status_bar_item.command = "thebot.reconnect";

		};

		var token_provider = new TokenProvider(sock);

		if(token_provider.token === undefined) {
			status_bar_item.text = "Token required!";
			status_bar_item.command = undefined;

			vscode.window.showInformationMessage("Please set the TheBot token!", "Set token", "Log in").then(selection => {
				switch (selection) {
					case "Set token":
						vscode.window.showInputBox({
							title: "TheBot token"
						}).then(async value => {
							vscode.workspace.getConfiguration().update("thebot.token", value);
							vscode.commands.executeCommand("workbench.action.reloadWindow");
						});
						break;
					
					case "Log in":
						token_provider.new_token(sock, (msg: string) => {
							vscode.window.showInformationMessage(msg);
						}).then(new_token => {
							console.log(new_token);

							vscode.window.showInputBox({
								title: "TheBot username"
							}).then(async username => {
								if(username !== undefined) {
									await token_provider.set_username(sock, username);
								}

								vscode.commands.executeCommand("workbench.action.reloadWindow");
							});
						});
				
					default:
						break;
				}
			});
		} else {
			status_bar_item.text = "Connected!";
			status_bar_item.command = "thebot.reconnect";

			var login_text_item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
			login_text_item.show();
			
			token_provider.login_text(sock).then(text => {
				login_text_item.text = text;
			});

			context.subscriptions.push(login_text_item);

			var thee_provider = new TreeProvider();

			thee_provider.functions.push(new TreeFunction("Logout", "thebot.logout"));
			thee_provider.functions.push(new TreeFunction("Reconnect", "thebot.reconnect"));
			thee_provider.functions.push(new TreeFunction("Set username", "thebot.username"));
			thee_provider.functions.push(new TreeFunction("Uptime", "thebot.uptime"));
			thee_provider.functions.push(new TreeFunction("Send command", "thebot.send_cmd"));

			context.subscriptions.push(vscode.window.registerTreeDataProvider("thebot.control", thee_provider));

			var wsc = new WebSellClient(websocket_url, token_provider.token, (msg: string) => {
				interface WebShellClientMessage {
					type: string,
					result: string
				}

				var msg_obj = JSON.parse(msg) as WebShellClientMessage;

				switch (msg_obj.type) {
					case "text":
						vscode.window.showInformationMessage(msg_obj.result);
						break;
					
					case "image":
						vscode.window.showInformationMessage("Photo message: " + msg_obj.result, "Open").then(open => {
							if(open === "Open") {
								vscode.env.openExternal(vscode.Uri.parse(msg_obj.result));
							}
						});
						break;

					case "sticker":
						vscode.window.showInformationMessage("Sticker message: " + msg_obj.result, "Open").then(open => {
							if(open === "Open") {
								vscode.env.openExternal(vscode.Uri.parse(msg_obj.result));
							}
						});
						break;

					case "audio":
						vscode.window.showInformationMessage("Audio message: " + msg_obj.result, "Open").then(open => {
							if(open === "Open") {
								vscode.env.openExternal(vscode.Uri.parse(msg_obj.result));
							}
						});
						break;

					default:
						break;
				}
			});

			context.subscriptions.push(vscode.commands.registerCommand("thebot.logout", () => {
				vscode.workspace.getConfiguration().update("thebot.token", undefined);
				vscode.commands.executeCommand("workbench.action.reloadWindow");
			}));

			context.subscriptions.push(vscode.commands.registerCommand("thebot.reconnect", () => {
				sock.websocket?.close();
				status_bar_item.text = "Reconnecting...";

				sock.initialize().then(s => {
					s.onclose = _ => {
						status_bar_item.text = "Lost connection!";
						status_bar_item.command = "thebot.reconnect";
					
					};

					status_bar_item.text = "Connected!";
					status_bar_item.command = "thebot.reconnect";
				});
			}));

			context.subscriptions.push(vscode.commands.registerCommand("thebot.username", () => {
				vscode.window.showInputBox({
					title: "TheBot username"
				}).then(async username => {
					if(username !== undefined) {
						await token_provider.set_username(sock, username);
					}

					vscode.commands.executeCommand("workbench.action.reloadWindow");
				});
			}));

			context.subscriptions.push(vscode.commands.registerCommand("thebot.uptime", () => {
				interface ApiUptime {
					uptime: number;
				}

				sock.socket_call("api/uptime", {}).then((uptime: Object) => {
					vscode.window.showInformationMessage(secondsToDhms((uptime as ApiUptime).uptime / 1000));
				});
			}));

			context.subscriptions.push(vscode.commands.registerCommand("thebot.send_cmd", () => {
				vscode.window.showInputBox({
					title: "Command to send"
				}).then(async cmd => {
					if(cmd !== undefined) {
						await wsc.execute(cmd);
					}
				});
			}));
		}
	});
}

export function deactivate() {}
