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

import { CountMetric } from './count-metric'
import { AmountMetric } from './amount-metric'
import { StatusMetric } from './status-metric'
import { IntervalMetric } from './interval-metric'

/**
 * @name IMetricLogger
 * @desc Defines methods to record metric and instrumentation events for an application.
 */
export interface IMetricLogger {

    /**
     * @name Increment
     * @desc Records a single instance of the specified count event.
     * 
     * @param {CountMetric} countMetric - The count metric that occurred.
     */
     Increment(countMetric: CountMetric) : void;

    /**
     * @name Add
     * @desc Records an instance of the specified amount metric event, and the associated amount.
     * 
     * @param {AmountMetric} amountMetric - The amount metric that occurred.
     * @param {number} amount - The amount associated with the instance of the amount metric.
     */
    Add(amountMetric: AmountMetric, amount: number) : void;

    /**
     * @name Set
     * @desc Records an instance of the specified status metric event, and the associated value.
     * 
     * @param {StatusMetric} statusMetric - The status metric that occurred.
     * @param {number} value - The value associated with the instance of the status metric.
     */
    Set(statusMetric: StatusMetric, value: number) : void;

    /**
     * @name Begin
     * @desc Records the starting of the specified interval event.
     * 
     * @param {IntervalMetric} intervalMetric - The interval metric that started.
     */
    Begin(intervalMetric: IntervalMetric) : void;

    /**
     * @name End
     * @desc Records the completion of the specified interval event.
     * 
     * @param {IntervalMetric} intervalMetric - The interval metric that completed.
     */
    End(intervalMetric: IntervalMetric) : void;

    /**
     * @name CancelBegin
     * @desc Cancels the starting of the specified interval event (e.g. in the case that an error occurs between the starting and completion of the interval event).
     * 
     * @param {IntervalMetric} intervalMetric - The interval metric that should be cancelled.
     */
    CancelBegin(intervalMetric: IntervalMetric) : void;
}