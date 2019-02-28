#!/usr/bin/env node

const { link } = require('./linker');
const { registerPackages, readRegistry, writeRegistry } = require('./registry');
const { watch } = require('./watcher');

require('yargs')
	.usage('Usage: $0 <command> [options]')
	.command(
		'link [projects]',
		'Link some packages. Passing no arguments will register packages in the current directory as link targets.',
		yargs => {
			yargs.positional('projects', {
				describe:
					'If specified, links all registered packages to the specified project file(s). Specify multiple projects using a comma separated list.',
			});
		},
		argv => {
			if (argv.projects) {
				link(argv.projects.split(','));
			} else {
				registerPackages(process.cwd());
			}
		}
	)
	.command('reset', 'Reset the registry.', () => {
		writeRegistry({});
	})
	.command('list', 'List linked packages.', () => {
		console.log(JSON.stringify(readRegistry(), null, 2));
	})
	.command(
		'watch',
		'Watch for file changes in linked package directories, automatically re-install the updated packages.',
		yargs => {
			yargs.option('short-circuit-build', {
				describe:
					'If specified, the automatically re-installed package dlls will also be copied to the specified location.',
			});
		},
		argv => {
			watch(argv);
		}
	).argv;
