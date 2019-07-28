# NuGet Extensions

[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()
[![version](https://img.shields.io/npm/v/nuget-extensions.svg)]()
[![downloads](https://img.shields.io/npm/dt/nuget-extensions.svg)]()

A CLI to extend the NuGet CLI with some handy features. Namely, the addition of an NPM-style link command. Also, a feature called "build short-circuiting" that uses file watching to copy newly available dlls directly into your built product.

You might also try the [VSCode extension](https://marketplace.visualstudio.com/items?itemName=randymarsh77.nuget-extensions-vscode).

### Status

Alpha version, approaching MVP. See [issues](https://github.com/randymarsh77/nuget-extensions/issues) for specifics.

### Usage

- Build a version of your NuGet packages, probably Debug with symbols included.
- Run `nuget-extensions link` in the output directory where the `.nupkg` files are located.
- Run `nuget-extensions link MyProject.csproj,path/to/MyOtherProject.csproj` in a directory where `nuget install` would otherwise install the package to.
- Run `nuget-extensions watch --short-circuit-build some/output/path` in the same (^) directory where `some/output/path` is where your executable will load the dll from.
- Build and debug your projects.

Note that you must currently re-link the projects in order to re-install the packages when there are new builds. This can be done automatically using `watch`.

### License

MIT
