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

import { JavaScriptStringConstants } from '../../../../src/common/javascript-string-constants';
import { IBuffer } from '../../../../src/utilities/buffering/ibuffer';
import { IEventLoop } from '../../../../src/common/javascript-abstractions/ievent-loop';
import { TimedLoopBufferFlushStrategy } from '../../../../src/utilities/buffering/timed-loop-buffer-flush-strategy';

/**
 * @desc Unit tests for the TimedLoopBufferFlushStrategy class.
 */
describe("TimedLoopBufferFlushStrategy Tests", () => {
    let mockBuffer: IBuffer<number>; 
    let mockEventLoop: IEventLoop;
    let testTimedLoopBufferFlushStrategy: TimedLoopBufferFlushStrategy<number>;

    beforeEach(() => {
        mockBuffer = jest.genMockFromModule("../../../../src/utilities/buffering/ibuffer");
        mockEventLoop = jest.genMockFromModule("../../../../src/common/javascript-abstractions/ievent-loop");
        mockEventLoop.SetTimeout = jest.fn();
        testTimedLoopBufferFlushStrategy = new TimedLoopBufferFlushStrategy<number>(10000, mockEventLoop);
        testTimedLoopBufferFlushStrategy.Buffer = mockBuffer;
    });

    it("Constructor(): 'flushInterval' parameter less than 1 throws exception.", done => {
        expect(() => {
            testTimedLoopBufferFlushStrategy = new TimedLoopBufferFlushStrategy<number>(0);
        }).toThrow(new Error("Parameter 'flushInterval' with value 0 must be greater than 0."));

        done();
    });

    it("Start(): Call without setting 'Buffer' property throws exception.", done => {
        testTimedLoopBufferFlushStrategy = new TimedLoopBufferFlushStrategy<number>(10000, mockEventLoop);
        expect(() => {
            testTimedLoopBufferFlushStrategy.Start();
        }).toThrow(new Error("The 'Buffer' property has not been set."));

        done();
    });

    it("Start(): Calling when already started throws exception.", done => {
        testTimedLoopBufferFlushStrategy.Start();
        expect(() => {
            testTimedLoopBufferFlushStrategy.Start();
        }).toThrow(new Error("The worker process has already been started."));

        done();
    });

    it("Start(): Success test.", done => {
        testTimedLoopBufferFlushStrategy.Start();

        expect(mockEventLoop.SetTimeout).toBeCalledTimes(1);
        expect(typeof((<any>(mockEventLoop.SetTimeout)).mock.calls[0][0])).toBe(JavaScriptStringConstants.FunctionType);
        expect((<any>(mockEventLoop.SetTimeout)).mock.calls[0][1]).toBe(10000);
        expect ((<any>(testTimedLoopBufferFlushStrategy)).started).toBe(true);

        done();
    });

    it("Stop(): Success test.", done => {
        testTimedLoopBufferFlushStrategy.Start();
        testTimedLoopBufferFlushStrategy.Stop();
        
        expect ((<any>(testTimedLoopBufferFlushStrategy)).started).toBe(false);

        done();
    });

});