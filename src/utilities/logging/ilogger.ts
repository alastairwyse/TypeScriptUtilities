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

import { LogLevel } from './log-level';

/**
 * @name ILogger
 * @description Defines methods to record log events and information about an application (e.g. operational information, status, error/exception information, debug, etc...).
 */
export interface ILogger {

    /**
     * @name Log
     * @description Writes the log information.
     * 
     * @param {LogLevel} level - The level of importance of the log event.
     * @param {string} message - The details of the log event.
     * @param {Error | null} error - (Optional) The error which caused the log event.
     */
    Log(level: LogLevel, message: string, error: Error | null) : void;
}