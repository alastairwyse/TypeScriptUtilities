/*
 * Copyright 2019 Alastair Wyse (https://github.com/alastairwyse/TypeScriptUtilities/)
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IDateTimeProvider } from './idate-time-provider';
import { ILogger } from './ilogger';
import { DefaultDateTimeProvider } from './default-date-time-provider';
import { LogLevel } from './log-level';

/**
 * @name LoggerBase
 * @description Provides common functionality for implementations of the ILogger interface.
 */
export abstract class LoggerBase implements ILogger {

    /** The minimum level of log entries to write.  Log entries with a level of importance lower than this will not be written. */
    protected minimumLogLevel: LogLevel;
    /** The levels/heirarchy of each log entry from lowest to highest importance. */
    protected logLevelOrder: LogLevel[];
    /** The string to use to separate fields (e.g. date/time stamp, log level, log text) within a log entry. */
    protected separatorString: string;
    /** A Moment.js-compatible format string to use to format dates and times in the resulting logging information. */
    protected dateTimeFormat: string;
    /** An implementation of interface IDateTimeProvider, to provide the formatted current date and time. */
    protected dateTimeProvider: IDateTimeProvider;

    /**
     * @param {LogLevel} minimumLogLevel - The minimum level of log entries to write.  Log entries with a level of importance lower than this will not be written.
     * @param {string} separatorString - The string to use to separate fields (e.g. date/time stamp, log level, log text) within a log entry.
     * @param {string} dateTimeFormat - A Moment.js-compatible format string to use to format dates and times in the resulting logging information.
     * @param {IDateTimeProvider | null} dateTimeProvider - (Optional) An implementation of interface IDateTimeProvider, to provide the formatted current date and time.
     */
    constructor(minimumLogLevel: LogLevel, separatorString: string = "|", dateTimeFormat: string = "YYYY-MM-DDTHH:mm:ss.SSSZ", dateTimeProvider: IDateTimeProvider | null = null) {
        this.minimumLogLevel = minimumLogLevel;
        this.logLevelOrder = [ LogLevel.Debug, LogLevel.Information, LogLevel.Warning, LogLevel.Error, LogLevel.Critical ];
        this.separatorString = separatorString;
        this.dateTimeFormat = dateTimeFormat;
        if (dateTimeProvider === null)
            this.dateTimeProvider = new DefaultDateTimeProvider();
        else
            this.dateTimeProvider = dateTimeProvider;
    }

    /**
     * @name Log
     * @description Writes the log information.
     * 
     * @param {LogLevel} level - The level of importance of the log event.
     * @param {string} message - The details of the log event.
     * @param {Error | null} error - (Optional) The error which caused the log event.
     */
    abstract Log(level: LogLevel, message: string, error: Error | null) : void;

   /**
     * @name InitializeLogEntry
     * @description Creates the first part of a log entry string (current date and separator character).
     * 
     * @returns {string} - The first part of a log entry string.
     */
    protected InitializeLogEntry() : string {
        let returnString = this.dateTimeProvider.GetCurrentDateTime(this.dateTimeFormat) + " " + this.separatorString + " ";

        return returnString;
    }

    /**
     * @name AppendLogLevel
     * @description Appends the specified log level to an existing log entry.
     * 
     * @param {string} logEntry - The existing log entry.
     * @param {LogLevel} logLevel - The log level to append.
     * 
     * @returns {string} - The log entry with the level appended.
     */
    protected AppendLogLevel(logEntry: string, logLevel: LogLevel) : string {
        return logEntry + logLevel + " " + this.separatorString + " ";
    }

    /**
     * @name AppendLogMessage
     * @description Appends the specified message to an existing log entry.
     * 
     * @param {string} logEntry - The existing log entry.
     * @param {string} logMessage - The log message to append.
     * 
     * @returns {string} - The log entry with the message appended.
     */
    protected AppendLogMessage(logEntry: string, logMessage: string) : string {
        return logEntry + logMessage;
    }

    /**
     * @name AppendError
     * @description Appends details from the the specified error to an existing log entry.
     * 
     * @param {string} logEntry - The existing log entry.
     * @param {Error} error - The error to append details of.
     * 
     * @returns {string} - The log entry with the message appended.
     */
    protected AppendError(logEntry: string, error: Error) : string {
        return logEntry + " " + this.separatorString + " " + error.message;
    }

    /**
     * @name LogLevelIsGreaterThanOrEqualToMinimum
     * @description Returns true if the specified log level has a greater or equal important compared to member 'minimumLogLevel'.
     * 
     * @param {LogLevel} logLevelToCompare - The log level to compare.
     * 
     * @returns {boolean} - True if the specified log level has a greater or equal important compared to member 'minimumLogLevel'.  False otherwise.
     */
    protected LogLevelIsGreaterThanOrEqualToMinimum(logLevelToCompare: LogLevel) : boolean {

        let minimumLogLevelIndex = -1;
        for (let i = 0; i < this.logLevelOrder.length; i++) {
            if (this.logLevelOrder[i] === this.minimumLogLevel)
                minimumLogLevelIndex = i;
        }
        if (minimumLogLevelIndex === -1)
            throw new Error(`Failed to find parameter 'logLevelToCompare' value '${logLevelToCompare}' in member 'minimumLogLevel'.`);
        for (let i = minimumLogLevelIndex; i <= this.logLevelOrder.length; i++) {
            if (this.logLevelOrder[i] === logLevelToCompare)
                return true;
        }

        return false;
    }
}