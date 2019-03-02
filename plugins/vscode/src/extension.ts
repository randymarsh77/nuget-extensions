import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.nugex.link', () => {
			vscode.window.showInformationMessage('Sorry, not implemented yet :(');
		}),
	);
}

export function deactivate() {}
