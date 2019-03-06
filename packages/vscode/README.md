# NuGet Extensions

`nuget-extensions` CLI ([available on NPM](https://www.npmjs.com/package/nuget-extensions)) provides some useful features when developing C# projects that have NuGet package dependencies. This extension helps optimize your workflow and provides an easy way to share that workflow with other developers on your team.

## Features

- Register NuGet packages to be locally linked (similar to `npm link`).
- Link your code to local builds of your NuGet dependencies for the purpose of viewing source and debugging.
- Automatically short circuit your downstream build process if you're building API and binary compatible changes.

## Requirements

`nuget` must be in your path and runnable.

## Extension Settings

This extension contributes the following settings:

* `NuGet Extensions.defaultPackageDirectories`: When registering local packages, use all packages in these directories, comma separated.
* `NuGet Extensions.defaultSolutions`: When linking to packages, projects in these solutions will provide the targets to link, comma separated.
* `NuGet Extensions.defaultProjects`: When linking to packages, these projects will provide the targets to link, comma separated.
* `NuGet Extensions.defaultShortCircuitPaths`: When set, running Watch will turn on short circuiting to these paths, comma separated.
