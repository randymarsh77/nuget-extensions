#!/usr/bin/env node

import * as yargs from 'yargs';
import {
	link,
	registerPackagesInDirectory,
	readRegistry,
	writeRegistry,
	watch,
} from 'nuget-extensions-lib';

/* tslint:disable:no-console */
const logger = {
	log: console.log,
	error: console.error,
};
/* tslint:enable:no-console */

const _ = yargs
	.usage('Usage: $0 <command> [options]')
	.command(
		'link [projects]',
		'Link some packages. Passing no arguments will register packages in the current directory as link targets.',
		command =>
			command.positional('projects', {
				type: 'string',
				describe:
					'If specified, links all registered packages to the specified project file(s). Specify multiple projects using a comma separated list.',
			}),
		argv => {
			if (argv.projects) {
				link(argv.projects.split(','), { logger });
			} else {
				registerPackagesInDirectory(process.cwd(), { logger });
			}
		}
	)
	.command('reset', 'Reset the registry.', {
		handler: () => {
			writeRegistry({});
		},
	})
	.command('list', 'List linked packages.', {
		handler: () => logger.log(JSON.stringify(readRegistry(), null, 2)),
	})
	.command(
		'watch',
		'Watch for file changes in linked package directories, automatically re-install the updated packages.',
		command =>
			command.option('short-circuit-build', {
				type: 'string',
				describe:
					'If specified, the automatically re-installed package dlls will also be copied to the specified location.',
			}),
		argv => {
			watch({
				shortCircuitBuild: argv['short-circuit-build'],
				logger,
			});
		}
	).argv;
