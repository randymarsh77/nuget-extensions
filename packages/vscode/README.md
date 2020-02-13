# NuGet Extensions

This is primarily `npm link` for the C# ecosystem. See the [project readme](https://github.com/randymarsh77/nuget-extensions) for specific details.

_Note: This is an alpha version. Please see the GitHub repository for issue tracking. Don't hesitate to comment on what is important to you._

## Requirements

The extension farms out to both `nuget` and `dotnet`, so they must be in your path and runnable.

## Changelog

### vNext

- Fix crash reporting.

### 0.1.0

- Show an error dialog when tools are missing instead of crashing.
- Optimize and minimze distributed files for a smaller install and better performance.

### 0.0.13

- Added crash logging and telemetry in order to improve the software. This telemetry can be disabled using VSCode's global telemetry setting. Information collected is:
  - Version numbers of NuGet, dotnet, node
  - Which commands are executed

### 0.0.12

- Fixes for macOS Catalina and NuGet v5.x

### 0.0.11

- Support for Windows
- Support for PackageReference
- Removed limitations on package version and targets
- Support registering single packages instead of just entire directories

## Features and Usage

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
