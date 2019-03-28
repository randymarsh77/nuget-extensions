# NuGet Extensions

[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()
[![build](https://img.shields.io/travis/randymarsh77/nuget-extensions.svg)](https://travis-ci.org/randymarsh77/nuget-extensions)
[![codebeat badge](https://codebeat.co/badges/c16bbce0-4382-4e9f-b4ee-b2b8a7a38ac0)](https://codebeat.co/projects/github-com-randymarsh77-nuget-extensions)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

This is a monorepo for NuGet Extensions and contains the following packages:

[Lib](packages/lib/readme.md)

[![NPM](https://img.shields.io/npm/v/nuget-extensions-lib.svg)]()
[![downloads](https://img.shields.io/npm/dt/nuget-extensions-lib.svg)]()

[CLI](packages/cli/readme.md)

[![NPM](https://img.shields.io/npm/v/nuget-extensions.svg)]()
[![downloads](https://img.shields.io/npm/dt/nuget-extensions.svg)]()

[VSCode](packages/vscode/readme.md)

[![version](https://img.shields.io/github/tag/randymarsh77/nuget-extensions.svg)]()
[![installs](https://img.shields.io/visual-studio-marketplace/i/randymarsh77.nuget-extensions-vscode.svg)]()
[![downloads](https://img.shields.io/visual-studio-marketplace/d/randymarsh77.nuget-extensions-vscode.svg)]()

### Status

Initial Alpha version. Very limited options. See [issues](https://github.com/randymarsh77/nuget-extensions/issues) for specifics.

### Usage

- Build a version of your NuGet packages, probably Debug with symbols included.
- The NuGet version can be anything (`0.0.0-debug`, for example).
- The assembly version must be `0.0.0.0` (current limitation).
- Run `nuget-extensions link` in the output directory where the `.nupkg` files are located. Or, use the VSCode extension `Register` command.
- Run `nuget-extensions link MyProject.csproj,path/to/MyOtherProject.csproj` in a directory where `nuget install` would otherwise install the package to. Or, use the VSCode `Link` command.
- Run `nuget-extensions watch --short-circuit-build some/output/path` in the same (^) directory where `some/output/path` is where your executable will load the dll from. Or, use the VSCode `Watch` command.
- Build and debug your projects.

### License

MIT
