import winston from "winston";

const { combine, json, prettyPrint } = winston.format;

export const logger = winston.createLogger({
	level: "info",
	format: combine(json(), prettyPrint()),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({ filename: "error.log", level: "error" }),
	],
});
