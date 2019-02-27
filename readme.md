# NuGex

[![license](https://img.shields.io/github/license/mashape/apistatus.svg)]()

A CLI to extend the NuGet CLI with some handy features. Namely, the addition of an NPM-style link command.

### Status

Initial Alpha version. Assumes packages.config and Reference includes using a HintPath. Does not support PackageReference. Very limited options.

### Usage

- Build a version of your NuGet packages, probably Debug with symbols included.
- The NuGet version can be anything (`0.0.0-debug`, for example).
- The assembly version must be `0.0.0.0` (current limitation).
- Run `nugex link` in the output directory where the `.nupkg` files are located.
- Run `nugex link MyProject.csproj,path/to/MyOtherProject.csproj` in a directory where `nuget install` would otherwise install the package to.
- Build and debug your projects.

Note that you must currently re-link the projects in order to re-install the packages when there are new builds.

### License

MIT
