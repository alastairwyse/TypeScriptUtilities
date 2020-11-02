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

import { IBufferFlushStrategy } from '../../../../src/utilities/buffering/ibuffer-flush-strategy';
import { IBufferFlushAction } from '../../../../src/utilities/buffering/ibuffer-flush-action';
import { Buffer } from '../../../../src/utilities/buffering/buffer';

/**
 * @desc Unit tests for the Buffer class.
 */
describe("Buffer Tests", () => {
    let mockFlushStrategy: IBufferFlushStrategy<number>; 
    let mockFlushAction: IBufferFlushAction<number>; 
    let testBuffer: Buffer<number>;

    beforeEach(() => {
        mockFlushStrategy = jest.genMockFromModule("../../../../src/utilities/buffering/ibuffer-flush-strategy");
        mockFlushAction = jest.genMockFromModule("../../../../src/utilities/buffering/ibuffer-flush-action");
        testBuffer = new Buffer<number>(mockFlushStrategy, mockFlushAction);
    });

    afterEach(() => { 
    });

    it("Add(): Success test.", done => {
        mockFlushStrategy.NotifyItemBufferred = jest.fn();
        expect(testBuffer.ItemCount).toBe(0);

        testBuffer.Add(7);

        expect((<any>testBuffer).bufferContents[0]).toBe(7);
        expect((<any>testBuffer).bufferContents.length).toBe(1);
        expect(testBuffer.ItemCount).toBe(1);
        expect(mockFlushStrategy.NotifyItemBufferred).toBeCalledTimes(1);


        testBuffer.Add(11);

        expect((<any>testBuffer).bufferContents[1]).toBe(11);
        expect((<any>testBuffer).bufferContents.length).toBe(2);
        expect(testBuffer.ItemCount).toBe(2);
        expect(mockFlushStrategy.NotifyItemBufferred).toBeCalledTimes(2);

        done();
    });

    it("Flush(): Success test.", done => {
        mockFlushAction.Flush = jest.fn();
        mockFlushStrategy.NotifyItemBufferred = jest.fn();
        mockFlushStrategy.NotifyBufferFlushed = jest.fn();
        testBuffer.Add(7);
        testBuffer.Add(11);

        testBuffer.Flush();

        expect(mockFlushAction.Flush).toBeCalledTimes(1);
        expect((<any>testBuffer).bufferContents.length).toBe(0);
        expect(mockFlushStrategy.NotifyBufferFlushed).toBeCalledTimes(1);

        done();
    });

});