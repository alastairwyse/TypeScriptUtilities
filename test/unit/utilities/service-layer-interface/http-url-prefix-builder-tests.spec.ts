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

import { UrlScheme } from '../../../../src/utilities/service-layer-interface/url-scheme';
import { HttpUrlPrefixBuilder } from '../../../../src/utilities/service-layer-interface/http-url-prefix-builder';

/**
 * @desc Unit tests for the HttpUrlPrefixBuilderBase class.
 */
describe("HttpUrlPrefixBuilder Tests", () => {
    let testHttpUrlPrefixBuilder: HttpUrlPrefixBuilder;

    beforeEach(() => {
    });
  
    afterEach(() => { 
    });

    it("Constructor(): Non-blank path without trailing '/' throws exception.", done => {
        expect(() => {
            testHttpUrlPrefixBuilder = new HttpUrlPrefixBuilder(UrlScheme.Http, "www.example.com", 80, "path1/path2");
        }).toThrow(new TypeError("Parameter 'path' with value 'path1/path2' must end with a '/' if non-blank."));
        done();
    });
});
