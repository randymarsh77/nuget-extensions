import { parseSolution } from '../src/solution';

describe('Solution Tests', function() {
	it('Parses Simple Solution', function() {
		const projects = parseSolution('tests/data/SimpleSolution.sln');

		expect(projects).toEqual([
			{
				name: 'SimpleProject',
				path: 'SimpleProject.csproj',
			},
			{
				name: 'SimpleProject.Tests',
				path: 'SimpleProject.Tests.csproj',
			},
		]);
	});
});
