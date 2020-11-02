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

import { ISessionIdProvider } from "./isession-id-provider";
import { v4 as uuid } from 'uuid';

/**
 * @name UuidSessionIdProvider
 * @desc Implementation of ISessionIdProvider which generates session ids as UUIDs.
 */
export class UuidSessionIdProvider implements ISessionIdProvider{

    /**
     * @name GenerateId
     * @desc Returns a new UUID as the session id.

     * @returns {string} - A new UUID.
     */
    GenerateId(): string {
        return uuid();
    }
}