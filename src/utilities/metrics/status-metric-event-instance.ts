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

import { StatusMetric } from './status-metric';
import { MetricEventInstance } from './metric-event-instance';
import { MetricType } from './metric-type';

/**
 * @name StatusMetricEventInstance
 * @desc Container class which stores information about the occurrence of a status metric event.
 */
export class StatusMetricEventInstance extends MetricEventInstance<StatusMetric> {

    /** The value associated with the instance of the status metric. */
    protected value: number;

    /**
     * @name Value
     * @returns {number} - The value associated with the instance of the status metric.
     */
    public get Value() : number {

        return this.value;
    }

    /**
     * @name StatusMetricEventInstance
     * 
     * @param {StatusMetric} statusMetric - The metric which occurred.
     * @param {Date} eventTime - The date and time the metric event occurred.
     * @param {number} - The value associated with the instance of the status metric.
     */
    public constructor(statusMetric: StatusMetric, eventTime: Date, value: number) {
        super();
        this.metric = statusMetric;
        this.metricType = MetricType.Status;
        this.eventTime = eventTime;
        this.value = value;
    }
}