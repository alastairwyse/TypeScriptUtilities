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

import { IntervalMetric } from './interval-metric';
import { MetricEventInstance } from './metric-event-instance';
import { MetricType } from './metric-type';

/**
 * @name IntervalMetricEventInstance
 * @desc Container class which stores information about the occurrence of an interval metric event.
 */
export class IntervalMetricEventInstance extends MetricEventInstance<IntervalMetric> {

    /** The date and time the interval metric event started. */
    protected duration: number;

    /**
     * @name EventTime
     * @returns {Date} - The date and time the interval metric event started.
     */
    public get EventTime() : Date {

        return this.eventTime;
    }

    /**
     * @name Duration
     * @returns {number} - The duration of the interval metric event in milliseconds.
     */
    public get Duration() : number {

        return this.duration;
    }

    /**
     * @name IntervalMetricEventInstance
     * 
     * @param {IntervalMetric} intervalMetric - The interval which occurred.
     * @param {Date} eventTime - The date and time the interval metric event started.
     * @param {number} duration - The duration of the interval metric event in milliseconds.
     */
    public constructor(intervalMetric: IntervalMetric, eventTime: Date, duration: number) {
        super();
        this.metric = intervalMetric;
        this.metricType = MetricType.Interval;
        this.eventTime = eventTime;
        this.duration = duration;
    }
}