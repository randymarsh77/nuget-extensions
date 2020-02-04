export interface IReporter {
	sendTelemetryEvent(
		eventName: string,
		properties?: {
			[key: string]: string;
		},
		measurements?: {
			[key: string]: number;
		}
	): void;
	sendTelemetryException(
		error: Error,
		properties?: {
			[key: string]: string;
		},
		measurements?: {
			[key: string]: number;
		}
	): void;
	dispose(): Promise<any>;
}
