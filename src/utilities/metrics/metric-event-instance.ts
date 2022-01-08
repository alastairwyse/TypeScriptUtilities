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

import { MetricBase } from './metric-base';
import { MetricType } from './metric-type';

/**
 * @name MetricEventInstance
 * @desc Base container class which stores information about the occurrence of a metric event.
 * 
 * @template T - The type of metric the event information is stored for.
 */
 export abstract class MetricEventInstance<T extends MetricBase> {

    /** The metric that occurred. */
    protected metric: T | null;
    /** The type of the metric (stored to be able to determine the correct type at runtime). */
    protected metricType: MetricType;
    /** The date and time the event occurred. */
    protected eventTime: Date;

    /**
     * @name Metric
     * @returns {T} - The metric that occurred.
     */
    public get Metric() : T {

        return <T>this.metric;
    }

    /**
     * @name MetricType
     * @returns {MetricType} - The type of the metric.
     */
    public get MetricType() : MetricType {

        return this.metricType;
    }

    /**
     * @name EventTime
     * @returns {Date} - The date and time the event occurred.
     */
    public get EventTime() : Date {

        return this.eventTime;
    }

    protected constructor() {

        // TODO: In trying to make this project compatible with the 'strict = true' compiler option, I'm forced to assign values to all class properties in the constructor
        //   This is annoying, as for generics I can't see a way to new the generic type, and so have to make it optionally null, and it should never be null in a derived class.
        //   Not a huge deal, since client code should not be creating derived types of this... they should only live in this project, but surely there's a better way??
        this.metric = null;
        this.metricType = MetricType.Count;
        this.eventTime = new Date();
    }
}