import { join } from 'path';
import * as vscode from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';
import { readRegistry, ILogger, getEnvironmentSnapshot, IReporter } from 'nuget-extensions-lib';
import { startWatchTask, stopWatchTask } from './commands/watch';
import { executeRegisterCommand } from './commands/register';
import { executeUnregisterCommand } from './commands/unregister';
import { executeLinkCommand } from './commands/link';
import { executeUnlinkCommand } from './commands/unlink';
import { telemetryId, telemetryKey, telemetryAppVersion } from './telemetry';

const fakeReporter: IReporter = {
	sendTelemetryEvent: () => {},
	sendTelemetryException: () => {},
	dispose: async () => {},
};

const wrap = async (
	func: (logger: ILogger) => Promise<void>,
	{ logger, reporter, event }: { logger: ILogger; reporter: IReporter; event?: string }
) => {
	const env = getEnvironment(reporter);
	if (!env) {
		return;
	}

	try {
		if (event) {
			reporter.sendTelemetryEvent(event, env);
		}
		await func(logger);
	} catch (e) {
		logger.error(e.message);
		reporter.sendTelemetryException(e, env);
	}
};

const getEnvironment = (reporter: IReporter) => {
	try {
		return getEnvironmentSnapshot();
	} catch (e) {
		reporter.sendTelemetryException(e);
		vscode.window.showErrorMessage(
			`It looks like you don't have some of the required tools installed. You need dotnet and nuget in your path. ${e}`
		);
		return null;
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
			wrap(executeRegisterCommand, { logger, reporter, event: 'register' });
		}),
		vscode.commands.registerCommand('extension.nugex.unregister', async () => {
			wrap(executeUnregisterCommand, { logger, reporter, event: 'unregister' });
		}),
		vscode.commands.registerCommand('extension.nugex.link', async () => {
			wrap(executeLinkCommand, { logger, reporter, event: 'link' });
		}),
		vscode.commands.registerCommand('extension.nugex.unlink', async () => {
			wrap(executeUnlinkCommand, { logger, reporter, event: 'unlink' });
		}),
		vscode.commands.registerCommand('extension.nugex.list', async () => {
			wrap(
				async () => {
					vscode.window.showInformationMessage(JSON.stringify(readRegistry(), null, 2));
				},
				{
					logger,
					reporter,
					event: 'list',
				}
			);
		}),
		vscode.commands.registerCommand('extension.nugex.startWatchTask', async () => {
			wrap(
				async () => {
					startWatchTask(context);
				},
				{
					logger,
					reporter,
					event: 'startWatch',
				}
			);
		}),
		vscode.commands.registerCommand('extension.nugex.stopWatchTask', async () => {
			wrap(
				async () => {
					stopWatchTask(context);
				},
				{
					logger,
					reporter,
					event: 'stopWatch',
				}
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
