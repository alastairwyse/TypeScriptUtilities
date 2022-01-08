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

import { IEventLoop } from './ievent-loop';

/**
 * @name DefaultEventLoop
 * @desc Default implementation of the IEventLoop interface.  Passes method calls to JavaScript's event loop.
 */
export class DefaultEventLoop implements IEventLoop {

    /** @inheritdoc */
    public SetTimeout(func: Function, delay?: number | undefined, ...params: any[]): number {
        
        return setTimeout(func, delay, params);
    }

    /** @inheritdoc */
    public ClearTimeout(timeoutId: number): void {
        
        clearTimeout(timeoutId);
    }
}