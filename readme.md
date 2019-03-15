# NuGet Extensions

[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()
[![NPM](https://img.shields.io/npm/v/nuget-extensions.svg)]()
[![codebeat badge](https://codebeat.co/badges/c16bbce0-4382-4e9f-b4ee-b2b8a7a38ac0)](https://codebeat.co/projects/github-com-randymarsh77-nuget-extensions)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

A CLI to extend the NuGet CLI with some handy features. Namely, the addition of an NPM-style link command. Also, a feature called "build short-circuiting" that uses file watching to copy newly available dlls directly into your built product.

### Status

Initial Alpha version. Assumes packages.config and Reference includes using a HintPath. Does not support PackageReference. Very limited options.

### Usage

- Build a version of your NuGet packages, probably Debug with symbols included.
- The NuGet version can be anything (`0.0.0-debug`, for example).
- The assembly version must be `0.0.0.0` (current limitation).
- Run `nuget-extensions link` in the output directory where the `.nupkg` files are located.
- Run `nuget-extensions link MyProject.csproj,path/to/MyOtherProject.csproj` in a directory where `nuget install` would otherwise install the package to.
- Run `nuget-extensions watch --short-circuit-build some/output/path` in the same (^) directory where `some/output/path` is where your executable will load the dll from.
- Build and debug your projects.

Note that you must currently re-link the projects in order to re-install the packages when there are new builds. This can be done automatically using `watch`.

### License

MIT
