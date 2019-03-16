# NuGet Extensions

The `nuget-extensions` CLI ([available on NPM](https://www.npmjs.com/package/nuget-extensions)) provides some useful features when developing C# projects that have NuGet package dependencies. This extension helps optimize your workflow and provides an easy way to share that workflow with other developers on your team.

_Note: This is an early alpha version. There are limitations. Please see the GitHub repository for issue tracking._

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

## Requirements

`nuget` must be in your path and runnable.

## Extension Settings

This extension contributes the following settings:

- `NuGet Extensions.defaultShortCircuitPaths`: When set, running Watch will turn on short circuiting to these paths, comma separated.
