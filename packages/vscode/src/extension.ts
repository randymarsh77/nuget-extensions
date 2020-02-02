import * as vscode from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';
import { readRegistry, ILogger } from 'nuget-extensions-lib';
import { startWatchTask, stopWatchTask } from './commands/watch';
import { executeRegisterCommand } from './commands/register';
import { executeUnregisterCommand } from './commands/unregister';
import { executeLinkCommand } from './commands/link';
import { executeUnlinkCommand } from './commands/unlink';

const telemetryId = 'nuget-extensions-vscode';
const telemetryAppVersion = '0.0.13';
const telemetryKey = '';

interface IReporter {
	sendTelemetryException: (e: Error) => void;
	dispose: () => void;
}

const fakeReporter: IReporter = {
	sendTelemetryException: () => {},
	dispose: () => {},
};

const reportException = async (
	func: (logger: ILogger) => Promise<void>,
	logger: ILogger,
	reporter: IReporter
) => {
	try {
		await func(logger);
	} catch (e) {
		reporter.sendTelemetryException(e);
	}
};

let dispose = () => {};

export function activate(context: vscode.ExtensionContext) {
	const channel = vscode.window.createOutputChannel('NuGet Extensions (general)');
	const logger = {
		log: (x: string) => channel.appendLine(x),
		error: (x: string) => channel.appendLine(`ERROR: ${x}`),
	};
	const reporter: IReporter =
		telemetryKey.length !== 0
			? new TelemetryReporter(telemetryId, telemetryAppVersion, telemetryKey)
			: fakeReporter;
	dispose = () => {
		reporter.dispose();
	};

	context.subscriptions.push(
		vscode.commands.registerCommand('extension.nugex.register', async () => {
			reportException(executeRegisterCommand, logger, reporter);
		}),
		vscode.commands.registerCommand('extension.nugex.unregister', async () => {
			reportException(executeUnregisterCommand, logger, reporter);
		}),
		vscode.commands.registerCommand('extension.nugex.link', async () => {
			reportException(executeLinkCommand, logger, reporter);
		}),
		vscode.commands.registerCommand('extension.nugex.unlink', async () => {
			reportException(executeUnlinkCommand, logger, reporter);
		}),
		vscode.commands.registerCommand('extension.nugex.list', async () => {
			reportException(
				async () => {
					vscode.window.showInformationMessage(JSON.stringify(readRegistry(), null, 2));
				},
				logger,
				reporter
			);
		}),
		vscode.commands.registerCommand('extension.nugex.startWatchTask', async () => {
			reportException(
				async () => {
					startWatchTask(context);
				},
				logger,
				reporter
			);
		}),
		vscode.commands.registerCommand('extension.nugex.stopWatchTask', async () => {
			reportException(
				async () => {
					stopWatchTask(context);
				},
				logger,
				reporter
			);
		}),
		reporter
	);
}

export function deactivate() {
	if (dispose) {
		dispose();
	}
}
