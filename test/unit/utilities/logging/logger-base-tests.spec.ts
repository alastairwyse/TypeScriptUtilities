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

import { MockSessionIdProviderImplementation } from './mock-session-id-provider-implementation';
import { MockDateTimeProviderImplementation } from './mock-date-time-provider-implementation';
import { ISessionIdProvider } from '../../../../src/utilities/logging/isession-id-provider';
import { IDateTimeProvider } from '../../../../src/utilities/logging/idate-time-provider'; 
import { LoggerBase } from '../../../../src/utilities/logging/logger-base';
import { LogLevel } from '../../../../src/utilities/logging/log-level';

/**
 * @name LoggerImplementation
 * @description Implementation of LoggerBase with protected methods made public so they can be unit tested.
 */
class LoggerImplementation extends LoggerBase {

    public Log(level: LogLevel, message: string, error?: Error): void {
        throw new Error("Method not implemented.");
    }

    public InitializeLogEntry(): string {
        return super.InitializeLogEntry();
    }

    public AppendLogLevel(logEntry: string, logLevel: LogLevel) : string {
        return super.AppendLogLevel(logEntry, logLevel);
    }

    public AppendLogMessage(logEntry: string, logMessage: string) : string {
        return super.AppendLogMessage(logEntry, logMessage);
    }

    public AppendError(logEntry: string, error: Error) : string {
        return super.AppendError(logEntry, error);
    }

    public LogLevelIsGreaterThanOrEqualToMinimum(logLevelToCompare: LogLevel) : boolean {
        return super.LogLevelIsGreaterThanOrEqualToMinimum(logLevelToCompare);
    }
}

/**
 * @desc Unit tests for the LoggerBase class.
 */
describe("LoggerBase Tests", () => {
    let mockSessionIdProvider: ISessionIdProvider  
    let mockDateTimeProvider: IDateTimeProvider;
    let testLoggerBase: LoggerImplementation;
    const testSessionId = "2293f78e-e5c7-4ea9-b51c-be23be100790";
    const testUserId = "user1234";

    // TODO: Figure out how to get Jest mocks working on Moment, so I don't have to write my own mock implementations

    beforeEach(() => {
        mockSessionIdProvider = new MockSessionIdProviderImplementation(testSessionId);
        mockDateTimeProvider = new MockDateTimeProviderImplementation();
        testLoggerBase = new LoggerImplementation(LogLevel.Debug, "|", "YYYY-MM-DDTHH:mm:ssZ", mockSessionIdProvider, testUserId, mockDateTimeProvider);
    });

    afterEach(() => { 
    });

    it("InitializeLogEntry(): Include userId success test.", done => {
        let result: string = testLoggerBase.InitializeLogEntry();
        expect(result).toBe("user1234 | 2293f78e-e5c7-4ea9-b51c-be23be100790 | 2019-11-30T17:43:00.000+09:00 | ");
        done();
    });

    it("InitializeLogEntry(): Exclude userId success test.", done => {
        testLoggerBase = new LoggerImplementation(LogLevel.Debug, "|", "YYYY-MM-DDTHH:mm:ssZ", mockSessionIdProvider, undefined, mockDateTimeProvider);
        let result: string = testLoggerBase.InitializeLogEntry();
        expect(result).toBe("2293f78e-e5c7-4ea9-b51c-be23be100790 | 2019-11-30T17:43:00.000+09:00 | ");
        done();
    });

    it("InitializeLogEntry(): String session id success test.", done => {
        testLoggerBase = new LoggerImplementation(LogLevel.Debug, "|", "YYYY-MM-DDTHH:mm:ssZ", "overridden-session-id", testUserId, mockDateTimeProvider);
        let result: string = testLoggerBase.InitializeLogEntry();
        expect(result).toBe("user1234 | overridden-session-id | 2019-11-30T17:43:00.000+09:00 | ");
        done();
    });

    it("AppendLogLevel(): Success test.", done => {
        let result: string = testLoggerBase.InitializeLogEntry();

        result = testLoggerBase.AppendLogLevel(result, LogLevel.Warning);

        expect(result).toBe("user1234 | 2293f78e-e5c7-4ea9-b51c-be23be100790 | 2019-11-30T17:43:00.000+09:00 | Warning | ");
        done();
    });

    it("AppendLogMessage(): Success test.", done => {
        let result: string = testLoggerBase.InitializeLogEntry();
        result = testLoggerBase.AppendLogLevel(result, LogLevel.Critical);

        result = testLoggerBase.AppendLogMessage(result, "Call timed out attempting to connect to URL 'www.example.com'.");

        expect(result).toBe("user1234 | 2293f78e-e5c7-4ea9-b51c-be23be100790 | 2019-11-30T17:43:00.000+09:00 | Critical | Call timed out attempting to connect to URL 'www.example.com'.");
        done();
    }); 

    it("AppendError(): Success test.", done => {
        let result: string = testLoggerBase.InitializeLogEntry();
        result = testLoggerBase.AppendLogLevel(result, LogLevel.Critical);
        result = testLoggerBase.AppendLogMessage(result, "Call timed out attempting to connect to URL 'www.example.com'.");
        let testError = new Error("Error text.");

        result = testLoggerBase.AppendError(result, testError);

        expect(result).toBe("user1234 | 2293f78e-e5c7-4ea9-b51c-be23be100790 | 2019-11-30T17:43:00.000+09:00 | Critical | Call timed out attempting to connect to URL 'www.example.com'. | Error text.");
        done();
    }); 
    
    it("LogLevelIsGreaterThanOrEqualToMinimum(): Success tests.", done => {
        testLoggerBase = new LoggerImplementation(LogLevel.Warning, "|", "YYYY-MM-DDTHH:mm:ssZ", mockSessionIdProvider, testUserId, mockDateTimeProvider);
        expect(testLoggerBase.LogLevelIsGreaterThanOrEqualToMinimum(LogLevel.Debug)).toBe(false);
        expect(testLoggerBase.LogLevelIsGreaterThanOrEqualToMinimum(LogLevel.Information)).toBe(false);
        expect(testLoggerBase.LogLevelIsGreaterThanOrEqualToMinimum(LogLevel.Warning)).toBe(true);
        expect(testLoggerBase.LogLevelIsGreaterThanOrEqualToMinimum(LogLevel.Error)).toBe(true);
        expect(testLoggerBase.LogLevelIsGreaterThanOrEqualToMinimum(LogLevel.Critical)).toBe(true);
        done();
    }); 
});