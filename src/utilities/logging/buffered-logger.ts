/*
 * Copyright 2020 Alastair Wyse (https://github.com/alastairwyse/TypeScriptUtilities/)
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

import { JavaScriptStringConstants } from '../../common/javascript-string-constants'; 
import { ISessionIdProvider } from './isession-id-provider';
import { IDateTimeProvider } from '../../common/javascript-abstractions/idate-time-provider';
import { IBuffer } from '../buffering/ibuffer';
import { IBufferFlushStrategy } from '../buffering/ibuffer-flush-strategy';
import { IBufferFlushAction } from '../buffering/ibuffer-flush-action';
import { Buffer } from '../buffering/buffer';
import { LogLevel } from './log-level';
import { LoggerBase } from './logger-base';

/**
 * @name BufferedLogger
 * @desc Implementation of ILogger which stores log entries in a buffer before transfers them to a specified destination.
 */
export class BufferedLogger extends LoggerBase {

    /** The buffer for the log entries */
    protected buffer : IBuffer<string>;

    /**
     * @param {IBufferFlushStrategy<string>} flushStrategy - The flush strategy the buffer should use.
     * @param {IBufferFlushAction<string>} flushAction - The action to perform when the log buffer is flushed.
     * @param {LogLevel} minimumLogLevel - The minimum level of log entries to write.  Log entries with a level of importance lower than this will not be written.
     * @param {string} separatorString - The string to use to separate fields (e.g. date/time stamp, log level, log text) within a log entry.
     * @param {string} dateTimeFormat - A Moment.js-compatible format string to use to format dates and times in the resulting logging information.
     * @param {string | ISessionIdProvider} sessionIdOrProvider - A unique session id to include in the log entry, or an implementation of interface ISessionIdProvider, to provide unique session ids.
     * @param {string} [userId] - (Optional) A unique identifier for the current user.
     * @param {IDateTimeProvider} [dateTimeProvider] - (Optional) An implementation of interface IDateTimeProvider, to provide the formatted current date and time.
     * @param {IBuffer<string>} [bufferImplementation] - (Optional) An implementation of interface IBuffer<string>.  Used for mocking in unit tests.
     */
    constructor(
        flushStrategy: IBufferFlushStrategy<string>, 
        flushAction: IBufferFlushAction<string>, 
        minimumLogLevel: LogLevel, 
        sessionIdOrProvider: string | ISessionIdProvider, 
        separatorString: string = "|", 
        dateTimeFormat: string = "YYYY-MM-DDTHH:mm:ss.SSSZ", 
        userId?: string, 
        dateTimeProvider?: IDateTimeProvider, 
        bufferImplementation?: IBuffer<string>
    )
    {
        super(minimumLogLevel, sessionIdOrProvider, separatorString, dateTimeFormat, userId, dateTimeProvider);

        if (typeof(bufferImplementation) === JavaScriptStringConstants.Undefined)
            this.buffer = new Buffer(flushStrategy, flushAction);
        else
            this.buffer = <IBuffer<string>>bufferImplementation;
    }

    /** @inheritdoc */
    public Log(level: LogLevel, message: string, error?: Error) : void {

        if (super.LogLevelIsGreaterThanOrEqualToMinimum(level) === true) {
            let logEntry: string = super.InitializeLogEntry();
            logEntry = super.AppendLogLevel(logEntry, level);
            logEntry = super.AppendLogMessage(logEntry, message);
            if (typeof(error) !== JavaScriptStringConstants.Undefined) {
                logEntry = super.AppendError(logEntry, <Error>error);
            }
            this.buffer.Add(logEntry);
        }
    }

    /**
     * @name Flush
     * @desc Flushes the buffered log entries.
     */
    public Flush() : void {
        this.buffer.Flush();
    }
 }