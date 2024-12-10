const { createLogger, format, transports } = require("winston");
require('dotenv').config({ path: '../.env' });

let filePath = process.env.ENVIORNMENT === "localdev" ? "logs/myapp.log" : "/var/log/myapp.log";

const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  level: "debug",
  transports: [
    new transports.Console(),
    new transports.File({
      filename: filePath,
    }),
  ],
});

module.exports = { logger };