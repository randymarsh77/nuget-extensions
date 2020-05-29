using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Linq;
using Faithlife.Utility;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace NuGetPackageInfo
{
	class Program
	{
		static void Main(string[] args)
		{
			var info = new InfoDto();

			var zipPath = args[0];
			var extractPath = Path.Combine(Path.GetTempPath(), nameof(NuGetPackageInfo), Guid.NewGuid().ToString());

			ZipFile.ExtractToDirectory(zipPath, extractPath);

			var files = Directory.EnumerateFiles(extractPath).ToList();
			var suffix = ".nuspec";
			var nuspec = files
				.Select(x =>
				{
					var fileName = Path.GetFileName(x);
					return x.EndsWith(suffix)
						? fileName.Substring(0, fileName.Length - suffix.Length)
						: null;
				})
				.WhereNotNull()
				.FirstOrDefault()
				?? throw new FormatException("Couldn't read .nuspec");

			var lib = Directory.EnumerateDirectories(extractPath).FirstOrDefault(x => x.EndsWith("lib"))
				?? throw new FormatException("No lib directory");

			var targets = Directory.EnumerateDirectories(lib)
				.Select(framework =>
				{
					var dlls = Directory.EnumerateFiles(framework)
						.Where(x => x.EndsWith(".dll"))
						.Select(GetLastPathComponent)
						.ToList();
					var dll = dlls.Count == 1
						? dlls.First()
						: (dlls.FirstOrDefault(x => x == $"{nuspec}.dll")
							?? throw new FormatException("Unable to determine main dll"));
					return (framework, dll);
				}).Select(x =>
				{
					var (framework, dll) = x;
					return new InfoDto.Target
					{
						Framework = GetLastPathComponent(framework),
						AssemblyVersion = ReadAssemblyVersion(Path.Combine(framework, dll)),
					};
				}).ToList();

			info.Targets = targets;

			try
			{
				Directory.Delete(extractPath, true);
			}
			catch (UnauthorizedAccessException)
			{
				// TODO: Why are the files still locked?
			}

			Console.WriteLine(JsonConvert.SerializeObject(info, JsonSettings));
		}

		private static string ReadAssemblyVersion(string dllPath)
		{
			var info = FileVersionInfo.GetVersionInfo(dllPath);
			return info.FileVersion;
		}

		private static string GetLastPathComponent(string path) =>
			path.Reverse().Substring(0, path.Reverse().IndexOf(Path.DirectorySeparatorChar)).Reverse();

		private sealed class InfoDto
		{
			public IReadOnlyList<Target> Targets { get; set; }

			public sealed class Target
			{
				public string Framework { get; set; }
				public string AssemblyVersion { get; set; }
			}
		}

		private static readonly JsonSerializerSettings JsonSettings = new JsonSerializerSettings
		{
			ContractResolver = new DefaultContractResolver
			{
				NamingStrategy = new CamelCaseNamingStrategy()
			},
			Formatting = Formatting.Indented,
		};
	}
}
