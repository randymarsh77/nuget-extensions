# NuGet Extensions

[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()
[![Travis - macOS](https://img.shields.io/travis/randymarsh77/nuget-extensions?label=macOS)](https://travis-ci.org/randymarsh77/nuget-extensions)
[![Appveyor - Windows](https://img.shields.io/appveyor/ci/randymarsh77/nuget-extensions?label=Windows)](https://ci.appveyor.com/project/randymarsh/nuget-extensions)
[![codebeat badge](https://codebeat.co/badges/c16bbce0-4382-4e9f-b4ee-b2b8a7a38ac0)](https://codebeat.co/projects/github-com-randymarsh77-nuget-extensions)
[![coverage](https://img.shields.io/codecov/c/github/randymarsh77/nuget-extensions.svg)](https://codecov.io/gh/randymarsh77/nuget-extensions)

This is a monorepo for NuGet Extensions and contains the following packages:

[VSCode](packages/vscode/README.md)

[![version](https://vsmarketplacebadge.apphb.com/version-short/randymarsh77.nuget-extensions-vscode.svg)]()
[![installs](https://img.shields.io/visual-studio-marketplace/i/randymarsh77.nuget-extensions-vscode.svg)]()
[![downloads](https://img.shields.io/visual-studio-marketplace/d/randymarsh77.nuget-extensions-vscode.svg)]()

[Lib](packages/lib/README.md)

[![NPM](https://img.shields.io/npm/v/nuget-extensions-lib.svg)]()
[![downloads](https://img.shields.io/npm/dt/nuget-extensions-lib.svg)]()

[CLI](packages/cli/README.md)

[![NPM](https://img.shields.io/npm/v/nuget-extensions.svg)]()
[![downloads](https://img.shields.io/npm/dt/nuget-extensions.svg)]()

### Status

Alpha version, approaching MVP. See [issues](https://github.com/randymarsh77/nuget-extensions/issues) for specifics.

### What and Why

This is primarily `npm link` for the C# ecosystem. One thing that the JS community got right with package development was enabling a simple mechanism to develop both a consuming and dependent package in context. .NET development in regards to package management tooling has lagged behind JS equivalents, but has also come a long way in recent history. .NET Core brings significant improvements to the PM systems, along with new innovations, like SourceLink. Today, it is still a challenge to develop multiple projects simultaneously when the dependencies are consumed via NuGet; especially when the projects are a mix of .NET Core, full .NET, `packages.config`, and `PackageReference`. This project aims to provide a layer of additional tooling to act as a shim while the native .NET PM system gains ground.

### Goals

Currently, in order to iterate on a package dependency in the context of it's consumer you may need to do one or all of the following:

- Alter the build/package process in order to generate a package or .dll that can be used in a development environment.
- Alter the consumer project file to specify a different version, location, or style of reference (for every project).
- Alter the consumer environment to pull/install/get your locally built package.
- Manually copy/move files and clear any number of package caches.

The goal of this project is to eliminate the manual parts of this process in a generic way, so you, as a developer, don't need to jump through these hoops, which can be quite tedious. The approach is one that works within the confines of the system, in a way that can be automated, controlled, and switched on and off without effort or time.

### Usage Strategy

The [VSCode](packages/vscode/README.md) extension is available to provide a simple UI and built-in commands to perform the required steps. The [CLI](packages/cli/README.md) is available for easy automation of these steps, if desired.

The basic idea is:

- Build the dependent package. Include symbols and build in Debug if debugging is desired.
- `Register` the package. The VSCode extension will detect any NuGet packages in the workspace, and prompt. This step adds an entry into a central repository for what packages are available.
- `Link` to the registered package. The VSCode extension will prompt for a solution or csproj file as input, and cross-check the references against the available packages.
- Build the consumer. You're done.

Furthermore:

- `Watch` is available to watch for package changes (when you rebuild the dependent package), and will ensure that the latest build is always available to your consumer. If desired, `Watch` can also be configured so that a rebuild of the consumer is not required.

To clean up:

- `Unlink` is available.
- `Unregister` is available.
- `Stop watching` is available.

### Specifics

See the specific project's readme for specifics.

[VSCode](packages/vscode/README.md)
[CLI](packages/cli/README.md)
[Lib](packages/lib/README.md)

### License

MIT
