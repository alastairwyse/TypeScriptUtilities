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
 * @name IEventLoop
 * @desc Abstraction of the JavaScript event loop for mocking in unit tests.
 */
export interface IEventLoop {

    /**
     * @name SetTimeout
     * @desc Sets a timer which executes a function on the event loop after a specified period of time.
     * 
     * @param {Function} func - The function to execute.
     * @param {number} [delay] - The time in milliseconds that the timer should wait before the function executed.
     * @param {...any[]} [params] - Additional arguments to pass to the function.
     * 
     * @returns {number} - A unique identifier for the timer execution.
     */
    SetTimeout(func: Function, delay? : number, ...params: any[]) : number;

    /**
     * @name ClearTimeout
     * @desc Cancels a timer execution previously created by the SetTimeout() method.
     * 
     * @param {number} timeoutId - The unique identifier of the timer execution to cancel.
     */
    ClearTimeout(timeoutId: number) : void;
}