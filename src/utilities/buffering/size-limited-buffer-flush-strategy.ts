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

import { BufferFlushStrategyBase } from './buffer-flush-strategy-base';
import { IBufferFlushStrategy } from "./ibuffer-flush-strategy";
import { IBuffer } from '../buffering/ibuffer';

/**
 * @name SizeLimitedBufferFlushStrategy
 * @desc An IBufferFlushStrategy which flushes the buffer each time the number of items in the buffer reaches a specified amount.
 */
export class SizeLimitedBufferFlushStrategy<T> extends BufferFlushStrategyBase<T> implements IBufferFlushStrategy<T> {

    /** The number of items stored in the buffer which will trigger a buffer flush. */
    protected bufferSizeLimit: number;

    /**
     * @desc Creates a SizeLimitedBufferFlushStrategy.
     * 
     * @throws {Error} - Parameter 'bufferSizeLimit' must be greater than 0.
     */
    constructor(bufferSizeLimit: number) {
        super();
        if (bufferSizeLimit < 1)
            throw new Error(`Parameter 'bufferSizeLimit' with value ${bufferSizeLimit} must be greater than 0.`);

        this.bufferSizeLimit = bufferSizeLimit;
    }

    /** @inheritdoc */
    public NotifyItemBufferred(): void {
        super.CheckBufferPropertySet();

        if ((<IBuffer<T>>(this.buffer)).ItemCount >= this.bufferSizeLimit) {
            (<IBuffer<T>>(this.buffer)).Flush();
        }
    }

    /** @inheritdoc */
    public NotifyBufferFlushed(): void {

    }
}