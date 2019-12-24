/*
 * Copyright 2019 Alastair Wyse (https://github.com/alastairwyse/TypeScriptUtilities/)
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
 * @name LogLevel
 * @desc Represents the level of importance of a log entry or logging event.
 */
export enum LogLevel {
    /** A logging event which results from a critical error in the application.  Typically the error cannot be recovered from, and causes termination of the application. */
    Critical = "Critical",
    /** A logging event which results from a serious error in the application, from which recovery may be possible, but potentially causing loss of data or data inconsistency. */
    Error = "Error",
    /** A logging event which results from an error in the application which administrative or supporting staff should be notified of. */
    Warning = "Warning",
    /** A logging event which describes a high level operation performed by a class or component. */
    Information = "Information",
    /** A logging event which describes granular details of an operation performed by a class or component. */
    Debug = "Debug"
}