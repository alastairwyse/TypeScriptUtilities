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
import { IDateTimeProvider } from '../../../../src/utilities/logging/idate-time-provider'; 

/**
 * @name MockDateTimeProviderImplementation
 * @description Mock implementation of IDateTimeProvider for testing.
 */
export class MockDateTimeProviderImplementation implements IDateTimeProvider {

    currentDateTime: moment.Moment;

    constructor() {
        this.currentDateTime = moment("2019-11-30 17:43:00.000+09:00");
    }

    GetCurrentDateTime(format: string): string {
        let returnString: string =  this.currentDateTime.format("YYYY-MM-DDTHH:mm:ss.SSSZ");
        this.currentDateTime.second(this.currentDateTime.get("second") + 1);

        return returnString;
    }
}