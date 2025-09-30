import path from "node:path";
import winston from "winston";
import { PATHS } from "@/testing/config/paths";

const { combine, timestamp, json, prettyPrint } = winston.format;

export const logger = winston.createLogger({
	level: "info",
	format: combine(timestamp(), json(), prettyPrint()),
	transports: [
		// Log all info and above to combined.log
		new winston.transports.File({
			filename: path.join(PATHS.logs, "combined.log"),
			level: "info",
		}),
		// Log errors to separate error.log file
		new winston.transports.File({
			filename: path.join(PATHS.logs, "error.log"),
			level: "error",
		}),
	],
});

export const testLogger = winston.createLogger({
	defaultMeta: { service: "test" },
	level: "info",
	format: combine(timestamp(), json(), prettyPrint()),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			filename: path.join(PATHS.logs, "test.log"),
			level: "info",
		}),
	],
});
