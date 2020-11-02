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

import * as moment from 'moment';
import { IBufferFlushStrategy } from '../../../../src/utilities/buffering/ibuffer-flush-strategy';
import { IBufferFlushAction } from '../../../../src/utilities/buffering/ibuffer-flush-action';
import { LogLevel } from '../../../../src/utilities/logging/log-level';
import { ISessionIdProvider } from '../../../../src/utilities/logging/isession-id-provider';
import { IDateTimeProvider } from '../../../../src/common/javascript-abstractions/idate-time-provider';
import { MockDateTimeProviderImplementation } from './mock-date-time-provider-implementation';
import { IBuffer } from '../../../../src/utilities/buffering/ibuffer';
import { BufferedLogger } from '../../../../src/utilities/logging/buffered-logger';

 /**
 * @desc Unit tests for the BufferedLogger class.
 */
describe("BufferedLogger Tests", () => {
    let mockSessionIdProvider : ISessionIdProvider;
    let mockDateTimeProvider: IDateTimeProvider;
    let mockFlushStrategy: IBufferFlushStrategy<string>;
    let mockFlushAction: IBufferFlushAction<string>;
    let mockBuffer: IBuffer<string>;
    let testBufferedLogger: BufferedLogger;
    const testSessionId = "2293f78e-e5c7-4ea9-b51c-be23be100790";
    const testUserId = "user1234";

    beforeEach(() => {
        mockFlushStrategy = jest.genMockFromModule("../../../../src/utilities/logging/isession-id-provider");
        mockFlushAction = jest.genMockFromModule("../../../../src/utilities/buffering/ibuffer-flush-action");
        mockSessionIdProvider = jest.genMockFromModule("../../../../src/utilities/service-layer-interface/ihttp-client");
        mockSessionIdProvider.GenerateId = jest.fn();
        (<any>(mockSessionIdProvider.GenerateId)).mockReturnValue(testSessionId);
        mockDateTimeProvider = new MockDateTimeProviderImplementation(moment("2019-11-30 17:43:00.000+09:00"));
        mockBuffer = jest.genMockFromModule("../../../../src/utilities/buffering/ibuffer");
        mockBuffer.Add = jest.fn();
        testBufferedLogger = new BufferedLogger(
            mockFlushStrategy, 
            mockFlushAction, 
            LogLevel.Information, 
            mockSessionIdProvider, 
            "|", 
            "YYYY-MM-DDTHH:mm:ss.SSSZ", 
            testUserId, 
            mockDateTimeProvider, 
            mockBuffer
        )
    });

    it("Log(): Include error success test.", done => {
        testBufferedLogger.Log(LogLevel.Information, "Test message", new Error("Test error"));

        expect(mockBuffer.Add).toBeCalledTimes(1);
        expect((<any>(mockBuffer.Add)).mock.calls[0][0]).toBe("user1234 | 2293f78e-e5c7-4ea9-b51c-be23be100790 | 2019-11-30T17:43:00.000+09:00 | Information | Test message | Test error");
        done();
    });

    it("Log(): Exclude error success test.", done => {
        testBufferedLogger.Log(LogLevel.Information, "Test message");

        expect(mockBuffer.Add).toBeCalledTimes(1);
        expect((<any>(mockBuffer.Add)).mock.calls[0][0]).toBe("user1234 | 2293f78e-e5c7-4ea9-b51c-be23be100790 | 2019-11-30T17:43:00.000+09:00 | Information | Test message");
        done();
    });
    
    it("Log(): Call to Log() with 'level' parameter less than minimum log level does not log.", done => {
        testBufferedLogger.Log(LogLevel.Debug, "Test message", new Error("Test error"));

        expect(mockBuffer.Add).toBeCalledTimes(0);
        done();
    });

    it("Flush(): Success test.", done => {
        mockBuffer.Flush = jest.fn();

        testBufferedLogger.Flush();

        expect(mockBuffer.Flush).toBeCalledTimes(1);
        done();
    });
});