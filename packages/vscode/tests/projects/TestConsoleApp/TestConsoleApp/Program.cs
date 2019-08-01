using System;
using Faithlife.Utility;

namespace TestConsoleApp
{
	class Program
	{
		static void Main(string[] args)
		{
			using (Scope.Create(() => Console.WriteLine("World!")))
				Console.Write("Hello ");
			Console.Read();
		}
	}
}
