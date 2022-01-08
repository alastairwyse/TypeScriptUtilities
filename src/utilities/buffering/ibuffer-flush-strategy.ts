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

/**
 * @name IBufferFlushStrategy
 * @desc Defines methods and properties to decide when a buffer should be flushed.  Follows the [GoF Strategy pattern](https://en.wikipedia.org/wiki/Strategy_pattern).
 * 
 * @template T - The type of object stored in the buffer.
 */
export interface IBufferFlushStrategy<T> {

    /**
     * @name Buffer
     * @desc The buffer which the flush strategy operates on.
     */
    Buffer : IBuffer<T>;

    /**
     * @name NotifyItemBuffered
     * @desc Called by the associated buffer when an item is added to the buffer.
     */
    NotifyItemBuffered() : void;

    /**
     * @name NotifyBufferFlushed
     * @desc Called by the associated buffer when the buffer is flushed.
     */
    NotifyBufferFlushed() : void;
}