# NuGet Extensions

The `nuget-extensions` CLI ([available on NPM](https://www.npmjs.com/package/nuget-extensions)) provides some useful features when developing C# projects that have NuGet package dependencies. This extension helps optimize your workflow and provides an easy way to share that workflow with other developers on your team.

_Note: This is an early alpha version. There are limitations. Please see the GitHub repository for issue tracking._

## Requirements

- `nuget` must be in your path and runnable.
- Currently assumes the linked packages have an assembly version of `0.0.0.0` ([Issue](https://github.com/randymarsh77/nuget-extensions/issues/6)). So, you need to build your packages with this version.
- Currently assumes the target framework is .Net 4.7.2 ([Issue](https://github.com/randymarsh77/nuget-extensions/issues/5)). There isn't really a workaround for this.

## Features

Open the command pallette and register NuGet packages to be locally linked (similar to `npm link`).

![](https://raw.githubusercontent.com/randymarsh77/nuget-extensions/master/packages/vscode/images/RegisterPackages.gif)

<hr>

Next, link your code to local builds of your NuGet dependencies for the purpose of viewing source and debugging.

<hr>

![](https://raw.githubusercontent.com/randymarsh77/nuget-extensions/master/packages/vscode/images/LinkProjects.gif)

<hr>

Finally, short circuit your downstream build process if you're building API and binary compatible changes. Watch will start a file watching task. When the build output of linked packages changes, those packages will be re-installed and optionally injected into your application.

<hr>

![](https://raw.githubusercontent.com/randymarsh77/nuget-extensions/master/packages/vscode/images/WatchLinks.gif)

## Extension Settings

This extension contributes the following settings:

- `NuGet Extensions.defaultShortCircuitPaths`: When set, running Watch will turn on short circuiting to these paths, comma separated.

### Status

Initial Alpha version. Very limited options. See [issues](https://github.com/randymarsh77/nuget-extensions/issues) for specifics.

### Usage

- Build a version of your NuGet packages, probably Debug with symbols included.
- The NuGet version can be anything (`0.0.0-debug`, for example).
- The assembly version must be `0.0.0.0` (current limitation).
- Use the `Register` command to register this package.
- Use `Link` command to reference the debug version in your projects.
- Use `Watch` command to automatically re-install the package. Works well if you provide a value for `defaultShortCircuitPaths`.
- Build and debug your projects.
