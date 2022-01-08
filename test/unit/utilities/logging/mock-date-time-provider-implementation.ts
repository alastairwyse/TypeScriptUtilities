/*
 * Copyright 2019 Alastair Wyse (https://github.com/alastairwyse/TypeScriptUtilities/)
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

import * as moment from 'moment';
import { IDateTimeProvider } from '../../../../src/common/javascript-abstractions/idate-time-provider'; 

/**
 * @name MockDateTimeProviderImplementation
 * @desc Mock implementation of IDateTimeProvider for testing, which returns date/time values which increment by 1ms on each call to GetCurrentDateTime().
 */
export class MockDateTimeProviderImplementation implements IDateTimeProvider {

    protected currentDateTime: moment.Moment;

    /**
     * @name MockDateTimeProviderImplementation
     * 
     * @param {Moment} initialDateTime - The initial date/time to return.
     */
    constructor(initialDateTime: moment.Moment) {
        this.currentDateTime = initialDateTime;
    }

    public GetCurrentDateTime(): Date {
        let returnDate: Date = this.currentDateTime.toDate();
        this.IncrementCurrentDateTime();

        return returnDate;
    }

    public GetCurrentDateTimeFormatted(format: string): string {
        let returnString: string = this.currentDateTime.format(format);
        this.IncrementCurrentDateTime();

        return returnString;
    }

    protected IncrementCurrentDateTime() : void {
        this.currentDateTime.second(this.currentDateTime.get("second") + 1);
    }
}