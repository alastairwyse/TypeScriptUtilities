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

/**
 * @name IDateTimeProvider
 * @desc Defines methods for returning the current date and time.
 */
export interface IDateTimeProvider {

    /**
     * @name GetCurrentDateTime
     * @desc Returns the current date and time.
     * 
     * @returns {string} - The current date and time.
     */
     GetCurrentDateTime() : Date;

    /**
     * @name GetCurrentDateTime
     * @desc Returns the current date and time as a formatted string.
     * 
     * @param {string} format - The format to return the date and time in (in the formats supported by moment.js... see https://momentjs.com/docs/#/displaying/format/).
     * 
     * @returns {string} - The current date and time.
     */
    GetCurrentDateTimeFormatted(format: string) : string;
}