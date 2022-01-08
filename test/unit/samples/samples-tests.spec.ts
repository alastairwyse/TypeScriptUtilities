/*
 * Copyright 2022 Alastair Wyse (https://github.com/alastairwyse/TypeScriptUtilities/)
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

import { DataValidationSamples, BufferingSamples, LoggingSamples } from '../../../src/samples/samples'

/**
 * @desc Runs sample methods in the 'samples.ts' file (i.e. not real unit tests, but a convenient way to confirm that all the samples are still working).
 */
 describe("Samples Runner", () => {

    beforeEach(() => {
    });

    afterEach(() => { 
    });

    it.skip("DataValidationSamples()", done => {
        let dataValidationSamples: DataValidationSamples = new DataValidationSamples();
        dataValidationSamples.Run();
        done();
    });

    it.skip("BufferingSamples()", done => {
        let bufferingSamples: BufferingSamples = new BufferingSamples();
        bufferingSamples.Run();
        done();
    });

    it.skip("LoggingSamples()", done => {
        let loggingSamples: LoggingSamples = new LoggingSamples();
        loggingSamples.Run();
        done();
    });

});