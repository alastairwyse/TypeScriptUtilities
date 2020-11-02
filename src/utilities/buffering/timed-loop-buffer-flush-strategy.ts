/*
 * Copyright 2020 Alastair Wyse (https://github.com/alastairwyse/TypeScriptUtilities/)
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

import { IEventLoop } from '../../common/javascript-abstractions/ievent-loop';
import { DefaultEventLoop } from '../../common/javascript-abstractions/default-event-loop';
import { BufferFlushStrategyBase } from './buffer-flush-strategy-base';
import { IBufferFlushStrategy } from "./ibuffer-flush-strategy";
import { IBuffer } from '../buffering/ibuffer';

/**
 * @name TimedLoopBufferFlushStrategy
 * @desc An IBufferFlushStrategy which flushes the buffer at a regular interval in a loop.
 * 
 * @template T - The type of object stored in the buffer.
 */
export class TimedLoopBufferFlushStrategy<T> extends BufferFlushStrategyBase<T> implements IBufferFlushStrategy<T> {

    /** The time (in milliseconds) between buffer flushes. */
    protected flushInterval: number;
    /** The event loop to use to execute the flushes. */
    protected eventLoop: IEventLoop;
    /** Whether the worker process loop has been started. */
    protected started: boolean;

    /**
     * @desc Creates a TimedLoopBufferFlushStrategy.
     * 
     * @param {number} flushInterval - The time (in milliseconds) between buffer flushes.
     * @param {IEventLoop} [eventLoop = null] - The (optional) event loop to use to execute the flushes.
     * 
     * @throws {Error} - Parameter 'flushInterval' must be greater than 0.
     */
    constructor(flushInterval: number, eventLoop: IEventLoop | null = null) {
        super();
        if (flushInterval < 1)
            throw new Error(`Parameter 'flushInterval' with value ${flushInterval} must be greater than 0.`);

        this.flushInterval = flushInterval;
        if (eventLoop === null) {
            this.eventLoop = new DefaultEventLoop();
        }
        else {
            this.eventLoop = eventLoop;
        }
        this.started = false;
    }

    /**
     * @name Start
     * @desc Starts a worker process loop to flush the buffer at a regular interval.
     * 
     * @throws {Error} - The worker process has already been started.
     */
    public Start() : void {
        super.CheckBufferPropertySet();
        if (this.started === true)
            throw new Error("The worker process has already been started.");

        this.started = true;
        this.ImplementWorkerProcess();
    }

    /**
     * @name Stop
     * @desc Stops the worker process loop.
     */
    public Stop() : void {

        this.started = false;
    }

    /** @inheritdoc */
    public NotifyItemBufferred(): void {
        
    }

    /** @inheritdoc */
    public NotifyBufferFlushed(): void {

    }

    /**
     * @name ImplementWorkerProcess
     * @desc Implementation of the worker process loop.
     */
    protected ImplementWorkerProcess() : void {

        this.eventLoop.SetTimeout(
            () => {
                if (this.started === true) {
                    (<IBuffer<T>>(this.buffer)).Flush();
                    this.ImplementWorkerProcess();
                }
            }, 
            this.flushInterval
        );
    }
}