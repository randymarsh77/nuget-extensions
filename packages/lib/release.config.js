module.exports = {
	branches: ['master'],
	tagFormat: 'lib@v${version}',
	plugins: [
		[
			'filtered-commit-analyzer',
			{
				preset: 'angular',
				filterRules: {
					scope: 'lib',
				},
			},
		],
	],
};
