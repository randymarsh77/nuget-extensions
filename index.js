#!/usr/bin/env node

const { link } = require('./linker');
const { registerPackages, readRegistry, writeRegistry } = require('./registry');

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
	}).argv;
