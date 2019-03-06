import * as vscode from 'vscode';
import { link } from '../../../lib/src';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('extension.nugex.link', () => {
			const c = vscode.workspace.getConfiguration('NuGet Extensions');
			const p = c.get('defaultProjects');
			vscode.window.showInformationMessage(JSON.stringify(p));
			// link();
		}),
	);
}

export function deactivate() {}
