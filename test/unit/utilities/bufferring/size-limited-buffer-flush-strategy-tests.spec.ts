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

import { IBuffer } from '../../../../src/utilities/buffering/ibuffer';
import { SizeLimitedBufferFlushStrategy } from '../../../../src/utilities/buffering/size-limited-buffer-flush-strategy';

/**
 * @desc Unit tests for the SizeLimitedBufferFlushStrategy class.
 */
describe("SizeLimitedBufferFlushStrategy Tests", () => {
    let mockBuffer: IBuffer<number>; 
    let testSizeLimitedBufferFlushStrategy: SizeLimitedBufferFlushStrategy<number>;

    beforeEach(() => {
        mockBuffer = jest.genMockFromModule("../../../../src/utilities/buffering/ibuffer");
        mockBuffer.Flush = jest.fn();
        testSizeLimitedBufferFlushStrategy = new SizeLimitedBufferFlushStrategy<number>(5);
        testSizeLimitedBufferFlushStrategy.Buffer = mockBuffer;
    });

    afterEach(() => { 
    });

    it("Constructor(): 'bufferSizeLimit' parameter less than 1 throws exception.", done => {
        expect(() => {
            testSizeLimitedBufferFlushStrategy = new SizeLimitedBufferFlushStrategy<number>(0);
        }).toThrow(new Error("Parameter 'bufferSizeLimit' with value 0 must be greater than 0."));

        done();
    });

    it("NotifyItemBuffered(): Call without setting 'Buffer' property throws exception.", done => {
        testSizeLimitedBufferFlushStrategy = new SizeLimitedBufferFlushStrategy<number>(5);
        expect(() => {
            testSizeLimitedBufferFlushStrategy.NotifyItemBuffered();
        }).toThrow(new Error("The 'Buffer' property has not been set."));

        done();
    });

    it("NotifyItemBuffered(): Success test.", done => {
        (<any>(mockBuffer)).ItemCount = 4;

        testSizeLimitedBufferFlushStrategy.NotifyItemBuffered();

        expect(mockBuffer.Flush).toBeCalledTimes(0);


        (<any>(mockBuffer)).ItemCount = 5;

        testSizeLimitedBufferFlushStrategy.NotifyItemBuffered();

        expect(mockBuffer.Flush).toBeCalledTimes(1);


        (<any>(mockBuffer)).Flush.mockClear();
        (<any>(mockBuffer)).ItemCount = 6;

        testSizeLimitedBufferFlushStrategy.NotifyItemBuffered();

        expect(mockBuffer.Flush).toBeCalledTimes(1);

        done();
    });

});
