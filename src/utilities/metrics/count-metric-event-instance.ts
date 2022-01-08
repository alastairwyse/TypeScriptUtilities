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

import { CountMetric } from './count-metric';
import { MetricEventInstance } from './metric-event-instance';
import { MetricType } from './metric-type';

/**
 * @name CountMetricEventInstance
 * @desc Container class which stores information about the occurrence of a count metric event.
 */
export class CountMetricEventInstance extends MetricEventInstance<CountMetric> {

    /**
     * @name CountMetricEventInstance
     * 
     * @param {CountMetric} countMetric - The metric which occurred.
     * @param {Date} eventTime - The date and time the metric event occurred.
     */
    public constructor(countMetric: CountMetric, eventTime: Date) {
        super();
        this.metric = countMetric;
        this.metricType = MetricType.Count;
        this.eventTime = eventTime;
    }
}