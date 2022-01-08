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

import { JavaScriptStringConstants } from '../../common/javascript-string-constants';
import { IDateTimeProvider } from '../../common/javascript-abstractions/idate-time-provider';
import { DefaultDateTimeProvider } from '../../common/javascript-abstractions/default-date-time-provider';
import { IBuffer } from '../buffering/ibuffer';
import { IBufferFlushStrategy } from '../buffering/ibuffer-flush-strategy';
import { IBufferFlushAction } from '../buffering/ibuffer-flush-action';
import { Buffer } from '../buffering/buffer';
import { MetricBase } from './metric-base';
import { CountMetric } from './count-metric';
import { AmountMetric } from './amount-metric';
import { StatusMetric } from './status-metric';
import { IntervalMetric } from './interval-metric';
import { MetricEventInstance } from './metric-event-instance';
import { CountMetricEventInstance } from './count-metric-event-instance';
import { AmountMetricEventInstance } from './amount-metric-event-instance';
import { StatusMetricEventInstance } from './status-metric-event-instance';
import { IntervalMetricEventInstance } from './interval-metric-event-instance';
import { IntervalMetricPartialEventInstance } from './interval-metric-partial-event-instance';
import { IntervalMetricEventTimePoint } from './interval-metric-event-time-point';
import { IMetricLogger } from './imetric-logger';
import { MetricType } from './metric-type';

/**
 * @name MetricLoggerBufffer
 * @desc Base class which acts as a buffer for implementations of interface IMetricLogger.
 */
export abstract class MetricLoggerBuffer implements IMetricLogger, IBufferFlushAction<MetricEventInstance<MetricBase>> {

    // TODO: Will need to log a session id... where do I specify this>
    //   Likely should be done in classes deriving from this
    //   Add comment to class to say which abstract method should be implemented (like c# equivalent)    
    //   '@throws' should be put in method comments



    /** Queue used to buffer metrics. */
    protected metricEventQueue: IBuffer<MetricEventInstance<any>>;
    /** The flush strategy for the metric event queue. */
    protected eventQueueFlushStrategy: IBufferFlushStrategy<MetricEventInstance<MetricBase>>;
    /** Provides the current date and time. */
    protected dateTimeProvider: IDateTimeProvider;
    /** Whether the class with throw an error if the correct sequence of interval metric logging is not followed (i.e. Begin() called before End()). */
    protected errorOnIncorrectIntervalMetricOrdering: boolean;
    /** Stores the 'start' part of any interval metric events which occurred, keyed by the 'Name' property of the interval metric. */
    protected startIntervalMetricEventStore: Map<string, IntervalMetricPartialEventInstance>;

    /**
     * @name MetricLoggerBuffer
     * 
     * @param { IBufferFlushStrategy<MetricEventInstance<MetricBase>> } eventQueueFlushStrategy - The flush strategy for the metric event buffer/queue.
     * @param { boolean } errorOnIncorrectIntervalMetricOrdering - Whether the class with throw an error if the correct sequence of interval metric logging is not followed (i.e. Begin() called before End()).
     * @param { IDateTimeProvider } dateTimeProvider - (Optional) Provides the current date and time.
     */
    public constructor(
        eventQueueFlushStrategy: IBufferFlushStrategy<MetricEventInstance<MetricBase>>, 
        errorOnIncorrectIntervalMetricOrdering: boolean, 
        dateTimeProvider?: IDateTimeProvider
    ) {
        this.eventQueueFlushStrategy = eventQueueFlushStrategy;
        this.errorOnIncorrectIntervalMetricOrdering = errorOnIncorrectIntervalMetricOrdering;
        if (typeof(dateTimeProvider) === JavaScriptStringConstants.Undefined) {
            this.dateTimeProvider = new DefaultDateTimeProvider();
        }
        else {
            this.dateTimeProvider = <IDateTimeProvider>dateTimeProvider;
        }
        this.metricEventQueue = new Buffer<MetricEventInstance<MetricBase>>(this.eventQueueFlushStrategy, this);
        this.startIntervalMetricEventStore = new Map<string, IntervalMetricPartialEventInstance>();
    }

    /** @inheritdoc */
    public Increment(countMetric: CountMetric) : void {
        let metricEventInstance: CountMetricEventInstance = new CountMetricEventInstance(countMetric, this.dateTimeProvider.GetCurrentDateTime());
        this.metricEventQueue.Add(metricEventInstance);
    }
     
    /** @inheritdoc */
    public Add(amountMetric: AmountMetric, amount: number) : void {
        let metricEventInstance: AmountMetricEventInstance = new AmountMetricEventInstance(amountMetric, this.dateTimeProvider.GetCurrentDateTime(), amount);
        this.metricEventQueue.Add(metricEventInstance);
    }

    /** @inheritdoc */
    public Set(statusMetric: StatusMetric, value: number) : void {
        let metricEventInstance: StatusMetricEventInstance = new StatusMetricEventInstance(statusMetric, this.dateTimeProvider.GetCurrentDateTime(), value);
        this.metricEventQueue.Add(metricEventInstance);
    }

    /** @inheritdoc */
    public Begin(intervalMetric: IntervalMetric) : void {
        let metricPartialEventInstance: IntervalMetricPartialEventInstance = new IntervalMetricPartialEventInstance(intervalMetric, IntervalMetricEventTimePoint.Start, this.dateTimeProvider.GetCurrentDateTime());
        this.metricEventQueue.Add(metricPartialEventInstance);
    }

    /** @inheritdoc */
    public End(intervalMetric: IntervalMetric) : void
    {
        let metricPartialEventInstance: IntervalMetricPartialEventInstance = new IntervalMetricPartialEventInstance(intervalMetric, IntervalMetricEventTimePoint.End, this.dateTimeProvider.GetCurrentDateTime());
        this.metricEventQueue.Add(metricPartialEventInstance);
    }

    /** @inheritdoc */
    public CancelBegin(intervalMetric: IntervalMetric) : void {
        let metricPartialEventInstance: IntervalMetricPartialEventInstance = new IntervalMetricPartialEventInstance(intervalMetric, IntervalMetricEventTimePoint.Cancel, this.dateTimeProvider.GetCurrentDateTime());
        this.metricEventQueue.Add(metricPartialEventInstance);
    }

    /**
     * @name Flush
     * @desc Flushes the buffer... i.e. transfers all stored metric events to the log destination, and clears all events stored in the buffer.
     * 
     * @param {IterableIterator<MetricEventInstance<MetricBase>>} bufferContents - The contents of the buffer.
     * 
     * @throws {Error} - Begin() method was called for an interval metric without a subsequent End() method call.
     * @throws {Error} - End() method was called for an interval metric without a preceding Begin() method call.
     * @throws {Error} - Cancel() method was called for an interval metric without a preceding Begin() method call.
     */
    public Flush(bufferContents: IterableIterator<MetricEventInstance<MetricBase>>) : void {

        let processedMetricEvents: Array<MetricEventInstance<MetricBase>> = [];

        for (let currentBufferedItem of Array.from(bufferContents)) {
            if (currentBufferedItem.MetricType === MetricType.Count || currentBufferedItem.MetricType === MetricType.Amount || currentBufferedItem.MetricType === MetricType.Status) {
                processedMetricEvents.push(currentBufferedItem);
            }
            else if (currentBufferedItem.MetricType === MetricType.Interval) {
                let currentPartialIntervalMetric = <IntervalMetricPartialEventInstance>(currentBufferedItem);
                if (currentPartialIntervalMetric.TimePoint === IntervalMetricEventTimePoint.Start) {
                    if (this.startIntervalMetricEventStore.has(currentPartialIntervalMetric.Metric.Name) === true) {
                        if (this.errorOnIncorrectIntervalMetricOrdering === true) {
                            throw Error(`Begin() method called for metric '${currentPartialIntervalMetric.Metric.Name}' without subsequent End() method call.`);
                        }
                        else {
                            this.startIntervalMetricEventStore.delete(currentPartialIntervalMetric.Metric.Name);
                        }
                    }
                    else {
                        this.startIntervalMetricEventStore.set(currentPartialIntervalMetric.Metric.Name, currentPartialIntervalMetric);
                    }
                }
                else if (currentPartialIntervalMetric.TimePoint === IntervalMetricEventTimePoint.End) {
                    if (this.startIntervalMetricEventStore.has(currentPartialIntervalMetric.Metric.Name) === false) {
                        if (this.errorOnIncorrectIntervalMetricOrdering === true)
                            throw Error(`End() method called for metric '${currentPartialIntervalMetric.Metric.Name}' without preceding Begin() method call.`);
                    }
                    else {
                        let startMetric: IntervalMetricPartialEventInstance = <IntervalMetricPartialEventInstance>this.startIntervalMetricEventStore.get(currentPartialIntervalMetric.Metric.Name);
                        let duration: number = currentPartialIntervalMetric.EventTime.getTime() - startMetric.EventTime.getTime();
                        let processedIntervalMetric = new IntervalMetricEventInstance(currentPartialIntervalMetric.Metric, startMetric.EventTime, duration);
                        processedMetricEvents.push(processedIntervalMetric);
                        this.startIntervalMetricEventStore.delete(currentPartialIntervalMetric.Metric.Name);
                    }
                }
                else if (currentPartialIntervalMetric.TimePoint === IntervalMetricEventTimePoint.Cancel) {
                    if (this.startIntervalMetricEventStore.has(currentPartialIntervalMetric.Metric.Name) === false) {
                        if (this.errorOnIncorrectIntervalMetricOrdering === true)
                            throw Error(`CancelBegin() method called for metric '${currentPartialIntervalMetric.Metric.Name}' without preceding Begin() method call.`);
                    }
                    else {
                        this.startIntervalMetricEventStore.delete(currentPartialIntervalMetric.Metric.Name);
                    }   
                }
                else {
                    throw Error(`Unsupported IntervalMetricEventTimePoint '${currentPartialIntervalMetric.TimePoint}' encountered.`);
                }
            }
            else {
                throw Error(`Unsupported MetricType '${currentBufferedItem.MetricType}' encountered.`);
            }
        }
        this.LogMetricEvents(processedMetricEvents);
    }

    /**
     * @desc Logs any buffered metric events.  Implementations of this method define how the metrics should be logged, e.g. written to an API layer endpoint.
     * @param {Array<MetricEventInstance<MetricBase>>} metricEvents - The buffered metric events to log.
     */
    public abstract LogMetricEvents(metricEvents: Array<MetricEventInstance<MetricBase>>) : void;
}
