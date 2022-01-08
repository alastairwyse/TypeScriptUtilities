/*
 * Copyright 2021 Alastair Wyse (https://github.com/alastairwyse/TypeScriptUtilities/)
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
 * @name IntervalMetricEventTimePoint
 * @desc Represents the time point of a partial instance of an interval metric event.
 */
export enum IntervalMetricEventTimePoint {
    /** The start of the interval metric event. */
    Start = "Start",
    /** he completion of the interval metric event. */
    End = "End",
    /** The cancellation of a previously started interval metric event. */
    Cancel = "Cancel"
} 