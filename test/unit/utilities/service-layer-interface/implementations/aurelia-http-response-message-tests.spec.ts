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

import { HttpResponseMessage } from 'aurelia-http-client';
import { AureliaHttpResponseMessage } from '../../../../../src/utilities/service-layer-interface/implementations/aurelia-http-response-message';

/**
 * @desc Unit tests for the AureliaHttpResponseMessage class.
 */
describe("AureliaHttpResponseMessage Tests", () => {
    let testAureliaHttpResponseMessage: AureliaHttpResponseMessage;

    beforeEach(() => {
        let httpResponseMessage: HttpResponseMessage = JSON.parse(`
            {
                "requestMessage": {
                    "method": "GET",
                    "url": "http://localhost:51499/api/CatalogueItems/",
                    "headers": {
                        "headers": {}
                    },
                    "baseUrl": "",
                    "responseType": "json",
                    "timeout": 5000
                },
                "statusCode": 200,
                "response": [
                    {
                        "DisplayName": "Bananas",
                        "PricePerUnit": 450,
                        "Unit": 2
                    },
                    {
                        "DisplayName": "Carrots",
                        "PricePerUnit": 200,
                        "Unit": 2
                    }
                ],
                "isSuccess": true,
                "statusText": "OK",
                "mimeType": "application/json",
                "headers": {
                    "headers": {
                        "content-type": {
                            "key": "content-type",
                            "value": "application/json; charset=utf-8"
                        }
                    }
                },
                "responseType": "json"
            }
        `);
        testAureliaHttpResponseMessage = new AureliaHttpResponseMessage(httpResponseMessage);
    });

    afterEach(() => { 
    });

    // TODO: Implement test for the 'Content' getter

    it("MimeType(): Success test.", done => {
        expect(testAureliaHttpResponseMessage.MimeType).toBe("application/json");
        done();
    });

    it("ResponseType(): Success test.", done => {
        expect(testAureliaHttpResponseMessage.ResponseType).toBe("json");
        done();
    });
    
    it("StatusCode(): Success test.", done => {
        expect(testAureliaHttpResponseMessage.StatusCode).toBe(200);
        done();
    });
    
    it("StatusText(): Success test.", done => {
        expect(testAureliaHttpResponseMessage.StatusText).toBe("OK");
        done();
    });
})