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

import { AmountMetric } from './amount-metric';
import { MetricEventInstance } from './metric-event-instance';
import { MetricType } from './metric-type';

/**
 * @name AmountMetricEventInstance
 * @desc Container class which stores information about the occurrence of an amount metric event.
 */
export class AmountMetricEventInstance extends MetricEventInstance<AmountMetric> {

    /** The amount associated with the instance of the amount metric. */
    protected amount: number;

    /**
     * @name Amount
     * @returns {number} - The amount associated with the instance of the amount metric.
     */
    public get Amount() : number {

        return this.amount;
    }

    /**
     * @name AmountMetricEventInstance
     * 
     * @param {AmountMetric} amountMetric - The metric which occurred.
     * @param {Date} eventTime - The date and time the metric event occurred.
     * @param {number} - The amount associated with the instance of the amount metric.
     */
    public constructor(amountMetric: AmountMetric, eventTime: Date, amount: number) {
        super();
        this.metric = amountMetric;
        this.metricType = MetricType.Amount;
        this.eventTime = eventTime;
        this.amount = amount;
    }
}