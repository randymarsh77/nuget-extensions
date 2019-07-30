import { readFileSync } from 'fs';

export interface IProjectInfo {
	path: string;
	name: string;
}

export function parseSolution(path: string): IProjectInfo[] {
	const solution = readFileSync(path, 'utf-8');

	const projects: IProjectInfo[] = [];

	const nextProjectExp = new RegExp(/Project\([^]*?=([^]*?)EndProject/gm);
	let match;
	do {
		match = nextProjectExp.exec(solution);
		if (match && match[1]) {
			const [name, path, _] = match[1].split(',').map(x =>
				x
					.replace('"', '')
					.replace('"', '')
					.trim()
			);
			if (path.endsWith('.csproj')) {
				projects.push({
					name,
					path,
				});
			}
		}
	} while (match);

	return projects;
}
