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
import { HttpUrlPrefixBuilderBase } from '../../../../src/utilities/service-layer-interface/http-url-prefix-builder-base';

/**
 * @desc Derived from abstract class HttpUrlPrefixBuilderBase, so that it can be unit tested.
 */
class HttpUrlPrefixBuilder extends HttpUrlPrefixBuilderBase {
}

/**
 * @desc Unit tests for the HttpUrlPrefixBuilderBase class.
 */
describe("HttpUrlPrefixBuilderBase Tests", () => {
    let testHttpUrlPrefixBuilderBase: HttpUrlPrefixBuilder;

    beforeEach(() => {
        testHttpUrlPrefixBuilderBase = new HttpUrlPrefixBuilder(UrlScheme.Https, "www.rum%monkey.com", 80, "path space1/path2/");
    });
  
    afterEach(() => { 
    });

    it("Constructor(): Blank 'host' parameter throws exception.", done => {
        expect(() => {
            testHttpUrlPrefixBuilderBase = new HttpUrlPrefixBuilder(UrlScheme.Http, "", 80, "");
        }).toThrow(new TypeError("Parameter 'host' cannot be a blank string."));
        done();
    });

    it("Constructor(): 'port' parameter less than 1 throws exception.", done => {
        expect(() => {
            testHttpUrlPrefixBuilderBase = new HttpUrlPrefixBuilder(UrlScheme.Http, "www.example.com", 0, "");
        }).toThrow(new TypeError("Parameter 'port' with value '0' must be between 1 and 65535 inclusive."));
        done();
    });

    it("Constructor(): Blank 'host' parameter throws exception.", done => {
        expect(() => {
            testHttpUrlPrefixBuilderBase = new HttpUrlPrefixBuilder(UrlScheme.Http, "www.example.com", 65536, "");
        }).toThrow(new TypeError("Parameter 'port' with value '65536' must be between 1 and 65535 inclusive."));
        done();
    });

    it("Constructor(): 'path' parameter with leading '/' character throws exception.", done => {
        expect(() => {
            testHttpUrlPrefixBuilderBase = new HttpUrlPrefixBuilder(UrlScheme.Http, "www.example.com", 80, "/path1");
        }).toThrow(new TypeError("Parameter 'path' with value '/path1' cannot start with a '/' character."));
        done();
    });

    it("Constructor(): Http host only success test.", done => {
        testHttpUrlPrefixBuilderBase = new HttpUrlPrefixBuilder(UrlScheme.Http, "www.example.com", 80, "");
        expect(testHttpUrlPrefixBuilderBase.UrlPrefix).toBe("http://www.example.com:80/");
        done();
    });

    it("Constructor(): Https success test.", done => {
        testHttpUrlPrefixBuilderBase = new HttpUrlPrefixBuilder(UrlScheme.Https, "www.example.com", 80, "");
        expect(testHttpUrlPrefixBuilderBase.UrlPrefix).toBe("https://www.example.com:80/");
        done();
    });

    it("Constructor(): Path success test.", done => {
        testHttpUrlPrefixBuilderBase = new HttpUrlPrefixBuilder(UrlScheme.Https, "www.example.com", 80, "path1/path2/");
        expect(testHttpUrlPrefixBuilderBase.UrlPrefix).toBe("https://www.example.com:80/path1/path2/");
        done();
    });

    it("Constructor(): Percent encoding success test.", done => {
        testHttpUrlPrefixBuilderBase = new HttpUrlPrefixBuilder(UrlScheme.Https, "www.rum%monkey.com", 80, "path space1/path2/");
        expect(testHttpUrlPrefixBuilderBase.UrlPrefix).toBe("https://www.rum%25monkey.com:80/path%20space1/path2/");
        done();
    });

    it("Scheme(): Success test.", done => {
        expect(testHttpUrlPrefixBuilderBase.Scheme).toBe(UrlScheme.Https);
        done();
    });
    
    it("Host(): Success test.", done => {
        expect(testHttpUrlPrefixBuilderBase.Host).toBe("www.rum%monkey.com");
        done();
    });

    it("Port(): Success test.", done => {
        expect(testHttpUrlPrefixBuilderBase.Port).toBe(80);
        done();
    });

    it("Path(): Success test.", done => {
        expect(testHttpUrlPrefixBuilderBase.Path).toBe("path space1/path2/");
        done();
    });
});