import * as fs from 'fs';
import * as path from 'path';
import home from 'user-home';
import mergeWith from 'lodash.mergewith';
import { IProjectFileChange } from './csproj';

function resolveEnvironment() {
	const nugexDataDir = process.env.NUGEX_DIR || path.join(home, '.nugex');
	const linksPath = path.join(nugexDataDir, 'links.json');
	return { linksPath, nugexDataDir };
}

export interface ILinks {
	[key: string]: IProjectFileChange[];
}

export function readLinks(): ILinks {
	const { linksPath } = resolveEnvironment();
	if (!fs.existsSync(linksPath)) {
		return {};
	}
	const data = fs.readFileSync(linksPath).toString('utf-8');
	return (data && JSON.parse(data)) || {};
}

export function writeLinks(links: ILinks) {
	const { linksPath, nugexDataDir } = resolveEnvironment();
	if (!fs.existsSync(nugexDataDir)) {
		fs.mkdirSync(nugexDataDir);
	}
	fs.writeFileSync(linksPath, JSON.stringify(links, null, 2));
}

export function mergeLinks(a: ILinks, b: ILinks): ILinks {
	return mergeWith(a, b, (arr1, arr2) => (arr1 || []).concat(arr2 || []));
}

export function pruneLinks(links: ILinks): ILinks {
	const pruned: ILinks = {};
	for (const key in links) {
		if (links[key].length !== 0) {
			pruned[key] = links[key];
		}
	}
	return pruned;
}
