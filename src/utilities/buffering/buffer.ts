/*
 * Copyright 2022 Alastair Wyse (https://github.com/alastairwyse/TypeScriptUtilities/)
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
import { IBufferFlushStrategy } from './ibuffer-flush-strategy';
import { IBufferFlushAction } from './ibuffer-flush-action';

/**
 * @name Buffer
 * @desc Basic class for bufferring data and allowing a configurable flush strategiy and action.
 * 
 * @template T - The type of object stored in the buffer.
 */
export class Buffer<T> implements IBuffer<T> {

    /** The items that are bufferred. */
    protected bufferContents: Array<T>;
    /** The flush strategy the buffer should use. */
    protected flushStrategy: IBufferFlushStrategy<T>;
    /** The action to perform when the buffer is flushed. */
    protected flushAction: IBufferFlushAction<T>

    /**
     * @name ItemCount
     * @returns {number} - The number of items currently stored in the buffer.
     */
    get ItemCount() : number {

        return this.bufferContents.length;
    }

    /**
     * @desc Creates a Buffer.
     * 
     * @param {BufferFlushStrategy<T>} flushStrategy - The flush strategy the buffer should use.
     * @param {IBufferFlushAction<T>} flushAction - The action to perform when the buffer is flushed.
     */
    public constructor(flushStrategy: IBufferFlushStrategy<T>, flushAction: IBufferFlushAction<T>) {

        this.bufferContents = new Array<T>();
        this.flushStrategy = flushStrategy;
        this.flushStrategy.Buffer = this;
        this.flushAction = flushAction;
    }

    /** @inheritdoc */
    public Add(item: T) : void {

        this.bufferContents.push(item);
        this.flushStrategy.NotifyItemBuffered();
    }

    /** @inheritdoc */
    public Flush() : void {
        
        this.flushAction.Flush(this.bufferContents[Symbol.iterator]());
        this.bufferContents.length = 0;
        this.flushStrategy.NotifyBufferFlushed();
    }
}