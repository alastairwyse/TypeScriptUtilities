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
import { HttpUrlBuilder } from '../../../../src/utilities/service-layer-interface/http-url-builder';

/**
 * @desc Unit tests for the HttpUrlBuilder class.
 */
describe("HttpUrlBuilder Tests", () => {
    let httpUrlBuilder: HttpUrlBuilder;

    beforeEach(() => {
    });
  
    afterEach(() => { 
    });

    it("Constructor(): 'path' parameter with trailing '/' character and query parameteres throws exception.", done => {
        let queryParameters: Array<[string, string]> = [
            [ "name1", "value1" ]
        ];
        expect(() => {
            httpUrlBuilder = new HttpUrlBuilder(UrlScheme.Https, "www.example.com", 80, "path1/path2/", queryParameters);
        }).toThrow(new TypeError("Parameter 'path' with value 'path1/path2/' cannot contain a trailling '/' character, when query parameters are included."));
        done();
    });

    it("Constructor(): Single query parameter success test.", done => {
        let queryParameters: Array<[string, string]> = [
            [ "name1", "value1" ]
        ];
        httpUrlBuilder = new HttpUrlBuilder(UrlScheme.Https, "www.example.com", 80, "path1/path2", queryParameters);
        expect(httpUrlBuilder.Url).toBe("https://www.example.com:80/path1/path2?name1=value1");
        done();
    });

    it("Constructor(): Multiple query parameter success test.", done => {
        let queryParameters: Array<[string, string]> = [
            [ "name1", "value1" ], 
            [ "name2", "value2" ], 
            [ "name3", "value3" ]
        ];
        httpUrlBuilder = new HttpUrlBuilder(UrlScheme.Https, "www.example.com", 80, "path1/path2", queryParameters);
        expect(httpUrlBuilder.Url).toBe("https://www.example.com:80/path1/path2?name1=value1&name2=value2&name3=value3");
        done();
    });

});
