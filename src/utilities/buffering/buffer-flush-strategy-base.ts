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

import { IBuffer } from './ibuffer';

/**
 * @name BufferFlushStrategyBase
 * @desc Base class for implementations of IBufferFlushStrategy<T>.
 * 
 * @template T - The type of object stored in the buffer.
 */
export abstract class BufferFlushStrategyBase<T> {

    /** The buffer which the flush strategy operates on. */
    protected buffer: IBuffer<T> | null;

    /**
     * @desc Creates a BufferFlushStrategyBase.
     */
    protected constructor() {

        this.buffer = null;
    }

    /**
     * @name Buffer
     * @desc The buffer which the flush strategy operates on.
     */
    set Buffer(value : IBuffer<T>) {

        this.buffer = value;
    }

    /**
     * @name CheckBufferPropertySet
     * @desc Throws an error if the 'Buffer' property has not been set.
     * 
     * @throws {Error} - The 'Buffer' property has not been set.
     */
    protected CheckBufferPropertySet() : void {

        if (this.buffer === null)
            throw new Error("The 'Buffer' property has not been set.");
    }
}