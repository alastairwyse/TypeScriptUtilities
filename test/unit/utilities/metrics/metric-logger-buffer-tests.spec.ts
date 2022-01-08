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

import { IBuffer } from '../../../../src/utilities/buffering/ibuffer';
import { IBufferFlushStrategy } from '../../../../src/utilities/buffering/ibuffer-flush-strategy';
import { BufferFlushStrategyBase } from '../../../../src/utilities/buffering/buffer-flush-strategy-base';
import { IDateTimeProvider } from '../../../../src/common/javascript-abstractions/idate-time-provider';
import { MetricBase } from '../../../../src/utilities/metrics/metric-base';
import { MetricEventInstance } from '../../../../src/utilities/metrics/metric-event-instance';
import { CountMetricEventInstance } from '../../../../src/utilities/metrics/count-metric-event-instance';
import { AmountMetricEventInstance } from '../../../../src/utilities/metrics/amount-metric-event-instance';
import { StatusMetricEventInstance } from '../../../../src/utilities/metrics/status-metric-event-instance';
import { IntervalMetricEventInstance } from '../../../../src/utilities/metrics/interval-metric-event-instance';
import { AddToCartButtonClickedMetric, ItemsOrderedMetric, SearchResultsReturnedMetric, TimeToPlaceOrderMetric, TimeViewingOrderScreenMetric } from './test-metrics';
import { MetricLoggerBuffer } from '../../../../src/utilities/metrics/metric-logger-buffer';
import { MetricType } from 'utilities/metrics/metric-type';

/**
 * @desc Unit tests for the MetricLoggerBuffer class.
 */
describe("MetricLoggerBuffer Tests", () => {
    let mockDateTimeProvider: IDateTimeProvider;
    let testFlushStrategy: ManualBufferFlushStrategy;
    let testMetricLoggerBuffer: TestMetricLoggerBuffer;

    beforeEach(() => {
        mockDateTimeProvider = jest.genMockFromModule("../../../../src/common/javascript-abstractions/idate-time-provider");
        testFlushStrategy = new ManualBufferFlushStrategy();
        testMetricLoggerBuffer = new TestMetricLoggerBuffer(testFlushStrategy, true, mockDateTimeProvider);
    });

    afterEach(() => { 
    });

    it("Increment(): Success test.", done => {
        let testCountMetric: AddToCartButtonClickedMetric = new AddToCartButtonClickedMetric();
        let testDate = new Date("2021-12-02T21:53:00.000+09:00")
        mockDateTimeProvider.GetCurrentDateTime = jest.fn();
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValue(testDate);

        testMetricLoggerBuffer.Increment(testCountMetric);

        testFlushStrategy.Flush();

        expect(testFlushStrategy.ItemBufferedCallCount).toBe(1);
        expect(testFlushStrategy.BufferedFlushedCallCount).toBe(1);
        expect(testMetricLoggerBuffer.LoggedMetricEvents.length).toBe(1);
        expect((<CountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).Metric).toBe(testCountMetric);
        expect((<CountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).MetricType).toBe(MetricType.Count);
        expect((<CountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).EventTime).toBe(testDate);

        done();
    });

    it("Add(): Success test.", done => {
        let testAmountMetric: ItemsOrderedMetric = new ItemsOrderedMetric();
        let testDate = new Date("2021-12-04T16:08:42.000+09:00")
        mockDateTimeProvider.GetCurrentDateTime = jest.fn();
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValue(testDate);

        testMetricLoggerBuffer.Add(testAmountMetric, 3);

        testFlushStrategy.Flush();

        expect(testFlushStrategy.ItemBufferedCallCount).toBe(1);
        expect(testFlushStrategy.BufferedFlushedCallCount).toBe(1);
        expect(testMetricLoggerBuffer.LoggedMetricEvents.length).toBe(1);
        expect((<AmountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).Metric).toBe(testAmountMetric);
        expect((<AmountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).MetricType).toBe(MetricType.Amount);
        expect((<AmountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).EventTime).toBe(testDate);
        expect((<AmountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).Amount).toBe(3);

        done();
    });

    it("Set(): Success test.", done => {
        let testStatusMetric: SearchResultsReturnedMetric = new SearchResultsReturnedMetric();
        let testDate = new Date("2021-12-04T16:15:36.000+09:00")
        mockDateTimeProvider.GetCurrentDateTime = jest.fn();
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValue(testDate);

        testMetricLoggerBuffer.Set(testStatusMetric, 230);

        testFlushStrategy.Flush();

        expect(testFlushStrategy.ItemBufferedCallCount).toBe(1);
        expect(testFlushStrategy.BufferedFlushedCallCount).toBe(1);
        expect(testMetricLoggerBuffer.LoggedMetricEvents.length).toBe(1);
        expect((<StatusMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).Metric).toBe(testStatusMetric);
        expect((<StatusMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).MetricType).toBe(MetricType.Status);
        expect((<StatusMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).EventTime).toBe(testDate);
        expect((<StatusMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).Value).toBe(230);

        done();
    });

    it("Flush(): Consecutive interval metric 'start' events and 'errorOnIncorrectIntervalMetricOrdering' set true.", done => {

        expect(() => {
            let testIntervalMetric: TimeToPlaceOrderMetric = new TimeToPlaceOrderMetric();
            let testDate = new Date("2021-12-05T01:05:08.000+09:00")
            mockDateTimeProvider.GetCurrentDateTime = jest.fn();
            (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValue(testDate);
            testMetricLoggerBuffer.Begin(testIntervalMetric);
            testMetricLoggerBuffer.Begin(testIntervalMetric);

            testFlushStrategy.Flush();
        }).toThrow(new Error("Begin() method called for metric 'TimeToPlaceOrder' without subsequent End() method call."));

        done();
    });

    it("Flush(): Consecutive interval metric 'start' events and 'errorOnIncorrectIntervalMetricOrdering' set false.", done => {

        testMetricLoggerBuffer = new TestMetricLoggerBuffer(testFlushStrategy, false, mockDateTimeProvider);
        let testIntervalMetric: TimeToPlaceOrderMetric = new TimeToPlaceOrderMetric();
        let testDate = new Date("2021-12-05T01:05:08.000+09:00")
        mockDateTimeProvider.GetCurrentDateTime = jest.fn();
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValue(testDate);
        testMetricLoggerBuffer.Begin(testIntervalMetric);
        testMetricLoggerBuffer.Begin(testIntervalMetric);

        testFlushStrategy.Flush();

        expect(testFlushStrategy.ItemBufferedCallCount).toBe(2);
        expect(testFlushStrategy.BufferedFlushedCallCount).toBe(1);
        expect(testMetricLoggerBuffer.LoggedMetricEvents.length).toBe(0);

        done();
    });

    it("Flush(): 'end' event with no preceding 'start' event and 'errorOnIncorrectIntervalMetricOrdering' set true.", done => {

        expect(() => {
            let testIntervalMetric: TimeToPlaceOrderMetric = new TimeToPlaceOrderMetric();
            let testDate = new Date("2021-12-05T09:23:42.000+09:00")
            mockDateTimeProvider.GetCurrentDateTime = jest.fn();
            (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValue(testDate);
            testMetricLoggerBuffer.End(testIntervalMetric);

            testFlushStrategy.Flush();
        }).toThrow(new Error("End() method called for metric 'TimeToPlaceOrder' without preceding Begin() method call."));

        done();
    });

    it("Flush(): 'end' event with no preceding 'start' event and 'errorOnIncorrectIntervalMetricOrdering' set false.", done => {

        testMetricLoggerBuffer = new TestMetricLoggerBuffer(testFlushStrategy, false, mockDateTimeProvider);
        let testIntervalMetric: TimeToPlaceOrderMetric = new TimeToPlaceOrderMetric();
        let testDate = new Date("2021-12-05T09:23:42.000+09:00")
        mockDateTimeProvider.GetCurrentDateTime = jest.fn();
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValue(testDate);
        testMetricLoggerBuffer.End(testIntervalMetric);

        testFlushStrategy.Flush();

        expect(testFlushStrategy.ItemBufferedCallCount).toBe(1);
        expect(testFlushStrategy.BufferedFlushedCallCount).toBe(1);
        expect(testMetricLoggerBuffer.LoggedMetricEvents.length).toBe(0);

        done();
    });

    it("Flush(): 'cancel' event with no preceding 'start' event and 'errorOnIncorrectIntervalMetricOrdering' set true.", done => {

        expect(() => {
            let testIntervalMetric: TimeToPlaceOrderMetric = new TimeToPlaceOrderMetric();
            let testDate = new Date("2021-12-05T09:23:42.000+09:00")
            mockDateTimeProvider.GetCurrentDateTime = jest.fn();
            (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValue(testDate);
            testMetricLoggerBuffer.CancelBegin(testIntervalMetric);

            testFlushStrategy.Flush();
        }).toThrow(new Error("CancelBegin() method called for metric 'TimeToPlaceOrder' without preceding Begin() method call."));

        done();
    });

    it("Flush(): 'cancel' event with no preceding 'start' event and 'errorOnIncorrectIntervalMetricOrdering' set false.", done => {

        testMetricLoggerBuffer = new TestMetricLoggerBuffer(testFlushStrategy, false, mockDateTimeProvider);
        let testIntervalMetric: TimeToPlaceOrderMetric = new TimeToPlaceOrderMetric();
        let testDate = new Date("2021-12-05T09:23:42.000+09:00")
        mockDateTimeProvider.GetCurrentDateTime = jest.fn();
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValue(testDate);
        testMetricLoggerBuffer.CancelBegin(testIntervalMetric);

        testFlushStrategy.Flush();

        expect(testFlushStrategy.ItemBufferedCallCount).toBe(1);
        expect(testFlushStrategy.BufferedFlushedCallCount).toBe(1);
        expect(testMetricLoggerBuffer.LoggedMetricEvents.length).toBe(0);

        done();
    });

    it("Flush(): Interval metric event success test.", done => {

        let testIntervalMetric: TimeToPlaceOrderMetric = new TimeToPlaceOrderMetric();
        mockDateTimeProvider.GetCurrentDateTime = jest.fn();
        let testStartDate: Date = new Date("2021-12-05T09:38:07.000+09:00");
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(testStartDate);
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T09:38:08.776+09:00"));
        testMetricLoggerBuffer.Begin(testIntervalMetric);
        testMetricLoggerBuffer.End(testIntervalMetric);

        testFlushStrategy.Flush();

        expect(testFlushStrategy.ItemBufferedCallCount).toBe(2);
        expect(testFlushStrategy.BufferedFlushedCallCount).toBe(1);
        expect(testMetricLoggerBuffer.LoggedMetricEvents.length).toBe(1);
        expect((<IntervalMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).Metric).toBe(testIntervalMetric);
        expect((<IntervalMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).MetricType).toBe(MetricType.Interval);
        expect((<IntervalMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).EventTime).toBe(testStartDate);
        expect((<IntervalMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).Duration).toBe(1776);

        done();
    });

    it("Flush(): Interval metric event cancelled success test.", done => {

        let testIntervalMetric: TimeToPlaceOrderMetric = new TimeToPlaceOrderMetric();
        mockDateTimeProvider.GetCurrentDateTime = jest.fn();
        let testStartDate: Date = new Date("2021-12-05T09:38:07.000+09:00");
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(testStartDate);
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T09:38:08.802+09:00"));
        testMetricLoggerBuffer.Begin(testIntervalMetric);
        testMetricLoggerBuffer.CancelBegin(testIntervalMetric);

        testFlushStrategy.Flush();

        expect(testFlushStrategy.ItemBufferedCallCount).toBe(2);
        expect(testFlushStrategy.BufferedFlushedCallCount).toBe(1);
        expect(testMetricLoggerBuffer.LoggedMetricEvents.length).toBe(0);
        done();
    });

    it("Flush(): Multiple metric events success test.", done => {

        let testAddToCartButtonClickedMetric: AddToCartButtonClickedMetric = new AddToCartButtonClickedMetric();
        let testItemsOrderedMetric: ItemsOrderedMetric = new ItemsOrderedMetric();
        let testSearchResultsReturnedMetric: SearchResultsReturnedMetric = new SearchResultsReturnedMetric();
        let testTimeToPlaceOrderMetric: TimeToPlaceOrderMetric = new TimeToPlaceOrderMetric();
        let testTimeViewingOrderScreenMetric: TimeViewingOrderScreenMetric = new TimeViewingOrderScreenMetric();
        mockDateTimeProvider.GetCurrentDateTime = jest.fn();
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T10:04:16.000+09:00"));
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T10:04:17.007+09:00"));
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T10:04:18.014+09:00"));
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T10:04:19.021+09:00"));
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T10:04:20.028+09:00"));
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T10:04:21.035+09:00"));
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T10:04:22.042+09:00"));
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T10:04:23.049+09:00"));
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T10:04:24.056+09:00"));
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T10:04:25.063+09:00"));
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T10:04:26.070+09:00"));
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T10:04:27.077+09:00"));
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T10:04:26.084+09:00"));
        (<any>(mockDateTimeProvider.GetCurrentDateTime)).mockReturnValueOnce(new Date("2021-12-05T10:04:27.091+09:00"));

        testMetricLoggerBuffer.Begin(testTimeViewingOrderScreenMetric);
        testMetricLoggerBuffer.Set(testSearchResultsReturnedMetric, 23);
        testMetricLoggerBuffer.Increment(testAddToCartButtonClickedMetric);
        testMetricLoggerBuffer.Increment(testAddToCartButtonClickedMetric);
        testMetricLoggerBuffer.Begin(testTimeToPlaceOrderMetric);
        testFlushStrategy.Flush();
        testMetricLoggerBuffer.CancelBegin(testTimeToPlaceOrderMetric);
        testMetricLoggerBuffer.Set(testSearchResultsReturnedMetric, 56);
        testMetricLoggerBuffer.Increment(testAddToCartButtonClickedMetric);
        testMetricLoggerBuffer.Begin(testTimeToPlaceOrderMetric);
        testMetricLoggerBuffer.End(new TimeToPlaceOrderMetric());
        testMetricLoggerBuffer.Add(testItemsOrderedMetric, 3);
        testMetricLoggerBuffer.End(testTimeViewingOrderScreenMetric);
        testFlushStrategy.Flush();
        testMetricLoggerBuffer.Begin(testTimeViewingOrderScreenMetric);
        testMetricLoggerBuffer.Set(testSearchResultsReturnedMetric, 101);

        expect(testFlushStrategy.ItemBufferedCallCount).toBe(14);
        expect(testFlushStrategy.BufferedFlushedCallCount).toBe(2);
        expect(testMetricLoggerBuffer.LoggedMetricEvents.length).toBe(8);
        expect((<StatusMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).Metric).toBe(testSearchResultsReturnedMetric);
        expect((<StatusMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).MetricType).toBe(MetricType.Status);
        expect((<StatusMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).EventTime).toStrictEqual(new Date("2021-12-05T10:04:17.007+09:00"));
        expect((<StatusMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[0])).Value).toBe(23);
        expect((<CountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[1])).Metric).toBe(testAddToCartButtonClickedMetric);
        expect((<CountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[1])).MetricType).toBe(MetricType.Count);
        expect((<CountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[1])).EventTime).toStrictEqual(new Date("2021-12-05T10:04:18.014+09:00"));
        expect((<CountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[2])).Metric).toBe(testAddToCartButtonClickedMetric);
        expect((<CountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[2])).MetricType).toBe(MetricType.Count);
        expect((<CountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[2])).EventTime).toStrictEqual(new Date("2021-12-05T10:04:19.021+09:00"));
        expect((<StatusMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[3])).Metric).toBe(testSearchResultsReturnedMetric);
        expect((<StatusMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[3])).MetricType).toBe(MetricType.Status);
        expect((<StatusMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[3])).EventTime).toStrictEqual(new Date("2021-12-05T10:04:22.042+09:00"));
        expect((<StatusMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[3])).Value).toBe(56);
        expect((<CountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[4])).Metric).toBe(testAddToCartButtonClickedMetric);
        expect((<CountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[4])).MetricType).toBe(MetricType.Count);
        expect((<CountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[4])).EventTime).toStrictEqual(new Date("2021-12-05T10:04:23.049+09:00"));
        expect((<IntervalMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[5])).Metric).toEqual(testTimeToPlaceOrderMetric);
        expect((<IntervalMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[5])).MetricType).toBe(MetricType.Interval);
        expect((<IntervalMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[5])).EventTime).toStrictEqual(new Date("2021-12-05T10:04:24.056+09:00"));
        expect((<IntervalMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[5])).Duration).toBe(1007);
        expect((<AmountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[6])).Metric).toBe(testItemsOrderedMetric);
        expect((<AmountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[6])).MetricType).toBe(MetricType.Amount);
        expect((<AmountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[6])).EventTime).toStrictEqual(new Date("2021-12-05T10:04:26.070+09:00"));
        expect((<AmountMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[6])).Amount).toBe(3);
        expect((<IntervalMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[7])).Metric).toEqual(testTimeViewingOrderScreenMetric);
        expect((<IntervalMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[7])).MetricType).toBe(MetricType.Interval);
        expect((<IntervalMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[7])).EventTime).toStrictEqual(new Date("2021-12-05T10:04:16.000+09:00"));
        expect((<IntervalMetricEventInstance>(testMetricLoggerBuffer.LoggedMetricEvents[7])).Duration).toBe(11077);

        done();
    });
});

/**
 * @name ManualBufferFlushStrategy
 * @desc Implementation of IBufferFlushStrategy<MetricEventInstance<MetricBase>> where flushing can be triggered manually for testing.
 */
class ManualBufferFlushStrategy extends BufferFlushStrategyBase<MetricEventInstance<MetricBase>> implements IBufferFlushStrategy<MetricEventInstance<MetricBase>> {

    protected itemBufferedCallCount: number;
    protected bufferedFlushedCallCount: number;

    /**
     * @name ItemBufferedCallCount
     * @returns {number} - The number of times the NotifyItemBuffered() method was called.
     */
    public get ItemBufferedCallCount() : number {

        return this.itemBufferedCallCount;
    }

    /**
     * @name BufferedFlushedCallCount
     * @returns {number} - The number of times the NotifyBufferFlushed() method was called.
     */
    public get BufferedFlushedCallCount() : number {

        return this.bufferedFlushedCallCount;
    }    

    public constructor() {
        super();
        this.itemBufferedCallCount = 0;
        this.bufferedFlushedCallCount = 0;
    }

    /**
     * @name Flush
     * @desc Manually triggers a buffer flush.
     */
    public Flush() : void {
        (<IBuffer<MetricEventInstance<MetricBase>>>(this.buffer)).Flush();
    }

    /** @inheritdoc */
    public NotifyItemBuffered() : void {
        this.itemBufferedCallCount++;
    }

    /** @inheritdoc */
    public NotifyBufferFlushed() : void {
        this.bufferedFlushedCallCount++;
    }
}

/**
 * @name TestMetricLoggerBuffer
 * @desc Implementation of MetricLoggerBuffer which writes logged metric events to a public array member.
 */
class TestMetricLoggerBuffer extends MetricLoggerBuffer {

    protected loggedMetricEvents: Array<MetricEventInstance<MetricBase>>;

    /**
     * @name LoggedMetricEvents
     * @returns {Array<MetricEventInstance<MetricBase>>} - The logged metric events.
     */
    public get LoggedMetricEvents() : Array<MetricEventInstance<MetricBase>> {

        return this.loggedMetricEvents;
    }

    /** @inheritdoc */
    public constructor(
        eventQueueFlushStrategy: IBufferFlushStrategy<MetricEventInstance<MetricBase>>, 
        errorOnIncorrectIntervalMetricOrdering: boolean, 
        dateTimeProvider?: IDateTimeProvider
    ) {
        super(eventQueueFlushStrategy, errorOnIncorrectIntervalMetricOrdering, dateTimeProvider);
        this.loggedMetricEvents = new Array<MetricEventInstance<MetricBase>>();
    }

    /**
     * @desc Writes any buffered metric events to property 'LoggedMetricEvents'.
     * @param {Array<MetricEventInstance<MetricBase>>} metricEvents - The buffered metric events to log.
     */
    public LogMetricEvents(metricEvents: Array<MetricEventInstance<MetricBase>>) : void {

        for (let currentMetricEvent of metricEvents) {
            this.loggedMetricEvents.push(currentMetricEvent);
        }
    }
}