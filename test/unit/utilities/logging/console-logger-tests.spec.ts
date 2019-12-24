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

 
import { MockDateTimeProviderImplementation } from './mock-date-time-provider-implementation';
import { IDateTimeProvider } from '../../../../src/utilities/logging/idate-time-provider';
import { IConsole } from '../../../../src/utilities/logging/iconsole';
import { ConsoleLogger } from '../../../../src/utilities/logging/console-logger';
import { LogLevel } from '../../../../src/utilities/logging/log-level';

/**
 * @name MockConsoleImplementation
 * @description Mock implementation of IConsole for testing.
 */
class MockConsoleImplementation implements IConsole {

    public ConsoleEntries: string[];

    constructor() {
        this.ConsoleEntries = new Array<string>();
    }

    Log(message: string): void {
        this.ConsoleEntries.push(message);
    }
}

/**
 * @desc Unit tests for the ConsoleLogger class.
 */
describe("ConsoleLogger Tests", () => {
    let mockDateTimeProvider: IDateTimeProvider;
    let mockConsole: MockConsoleImplementation;
    let testConsoleLogger: ConsoleLogger;

    beforeEach(() => {
        mockDateTimeProvider = new MockDateTimeProviderImplementation();
        mockConsole = new MockConsoleImplementation();
        testConsoleLogger = new ConsoleLogger(
            LogLevel.Information, 
            "|", 
            "YYYY-MM-DDTHH:mm:ss.SSSZ", 
            mockDateTimeProvider, 
            mockConsole
        );
    });

    afterEach(() => { 
    });

    it("Log(): Success test.", done => {
        testConsoleLogger.Log(LogLevel.Information, "Test message", new Error("Test error"));

        expect(mockConsole.ConsoleEntries.length).toBe(1);
        expect(mockConsole.ConsoleEntries[0]).toBe("2019-11-30T17:43:00.000+09:00 | Information | Test message | Test error");
        done();
    });
    
    it("Log(): Call to Log() with 'level' parameter less than minimum log level does not log.", done => {
        testConsoleLogger.Log(LogLevel.Debug, "Test message", new Error("Test error"));

        expect(mockConsole.ConsoleEntries.length).toBe(0);
        done();
    });
});