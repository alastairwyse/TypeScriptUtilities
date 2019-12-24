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

import { IConsole } from './iconsole';
import { DefaultConsole } from './default-console';
import { LogLevel } from './log-level';
import { LoggerBase } from './logger-base';
import { IDateTimeProvider } from './idate-time-provider';

/**
 * @name ConsoleLogger
 * @description Implementation of ILogger which writes to the browser/system console.
 */
export class ConsoleLogger extends LoggerBase {

    protected consoleImplementation: IConsole;

    /**
     * @param {LogLevel} minimumLogLevel - The minimum level of log entries to write.  Log entries with a level of importance lower than this will not be written.
     * @param {string} separatorString - The string to use to separate fields (e.g. date/time stamp, log level, log text) within a log entry.
     * @param {string} dateTimeFormat - A Moment.js-compatible format string to use to format dates and times in the resulting logging information.
     * @param {IDateTimeProvider | null} dateTimeProvider - (Optional) An implementation of interface IDateTimeProvider, to provide the formatted current date and time.
     * @param {IConsole | null} consoleImplementation - (Optional) An implementation of interface IConsole.  Used for mocking in unit tests.
     */
    constructor(
        minimumLogLevel: LogLevel, 
        separatorString: string = "|", 
        dateTimeFormat: string = "YYYY-MM-DDTHH:mm:ss.SSSZ", 
        dateTimeProvider: IDateTimeProvider | null = null, 
        consoleImplementation: IConsole | null = null
    ) {
        super(minimumLogLevel, separatorString, dateTimeFormat, dateTimeProvider);
        if (consoleImplementation === null)
            this.consoleImplementation = new DefaultConsole();
        else
            this.consoleImplementation = consoleImplementation;
    }

    public Log(level: LogLevel, message: string, error: Error | null) : void {

        let logEntry: string = super.InitializeLogEntry();
        logEntry = super.AppendLogLevel(logEntry, level);
        logEntry = super.AppendLogMessage(logEntry, message);
        if (error !== null) {
            logEntry = super.AppendError(logEntry, error);
        }

        if (super.LogLevelIsGreaterThanOrEqualToMinimum(level) === true) {
            this.consoleImplementation.Log(logEntry);
        }
    }
}