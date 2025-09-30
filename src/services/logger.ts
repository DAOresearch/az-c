import winston from "winston";

const { combine, timestamp, json, prettyPrint } = winston.format;

export const logger = winston.createLogger({
	level: "info",
	format: combine(timestamp(), json(), prettyPrint()),
	transports: [
		// Log all info and above to combined.log
		new winston.transports.File({ filename: "combined.log", level: "info" }),
		// Log errors to separate error.log file
		new winston.transports.File({ filename: "error.log", level: "error" }),
	],
});
