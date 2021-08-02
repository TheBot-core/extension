import { Command, Event, ProviderResult, TreeDataProvider, TreeItem } from "vscode";

export class TreeProvider implements TreeDataProvider<TreeFunction> {
	onDidChangeTreeData?: Event<void | TreeFunction | null | undefined> | undefined;

	functions: Array<TreeFunction> = [];
	
	getTreeItem(element: TreeFunction): TreeItem | Thenable<TreeItem> {
		return element;
	}
	getChildren(element?: TreeFunction): ProviderResult<TreeFunction[]> {
		return new Promise((resolve, reject) => {
			resolve(this.functions);
		});
	}
}

export class TreeFunction extends TreeItem {
	constructor(label: string, command: string) {
		super(label);
		if(!!this.command) {
			this.command.command = command;
		} else {
			this.command = new ( class implements Command {
				title: string;
				command: string;
				tooltip?: string | undefined;
				arguments?: any[] | undefined;

				constructor(title: string, command: string) {
					this.title = title;
					this.command = command;
				}
			})(label, command);
		}
	}
}