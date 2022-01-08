/*
 * Copyright 2022 Alastair Wyse (https://github.com/alastairwyse/TypeScriptUtilities/)
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

import { ILogger } from './ilogger';
import { LogLevel } from './log-level';

/**
 * @name CompositeLogger
 * @desc Implementation of ILogger which holds and logs to multiple loggers (following the GoF Composite pattern).
 */
export class CompositeLogger implements ILogger {

    /**
     * @param {Array<ILogger>} loggers - The collection of loggers to broadcast log entries to.
     * 
     * @throws {Error} - Parameter 'loggers' cannot be empty.
     */
    constructor(protected loggers: Array<ILogger>) {
        if (loggers.length === 0)
            throw new Error(`Parameter 'loggers' cannot be empty.`);
    }

    /**
     * @name Log
     * @desc Writes the log information.
     * 
     * @param {LogLevel} level - The level of importance of the log event.
     * @param {string} message - The details of the log event.
     * @param {Error} [error] - (Optional) The error which caused the log event.
     */
     public Log(level: LogLevel, message: string, error?: Error): void {
        for (let i: number = 0; i < this.loggers.length; i++) {
            this.loggers[i].Log(level, message, error);
        }
    }
}