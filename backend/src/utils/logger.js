const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  static log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta,
    };

    const logFile = path.join(logsDir, `${level}.log`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');

    if (process.env.NODE_ENV === 'development') {
      console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}`, meta);
    }
  }

  static info(message, meta) {
    this.log('info', message, meta);
  }

  static error(message, meta) {
    this.log('error', message, meta);
  }

  static warn(message, meta) {
    this.log('warn', message, meta);
  }

  static debug(message, meta) {
    this.log('debug', message, meta);
  }
}

module.exports = Logger;
