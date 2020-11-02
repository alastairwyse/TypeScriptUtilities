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

/**
 * @name IBuffer
 * @desc Defines methods for bufferring data.
 * 
 * @template T - The type of object stored in the buffer.
 */
export interface IBuffer<T> {

    /**
     * @name ItemCount
     * @returns {number} - The number of items currently stored in the buffer.
     */
    readonly ItemCount : number;

    /**
     * @name Add
     * @desc Adds an item to the buffer.
     * 
     * @param {T} item - The item to add to the buffer.
     */
    Add(item: T) : void;

    /**
     * @name Flush
     * @desc Flushes the buffer... i.e. transfers all stored data to the destination, and clears all items stored in the buffer.
     */
    Flush() : void;
}