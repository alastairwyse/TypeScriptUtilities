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

import { HttpClient, HttpResponseMessage } from 'aurelia-http-client';
import { IHttpClient, IHttpResponse } from '../ihttp-client';
import { HttpRequestMethod } from '../http-request-method';
import { AureliaHttpResponseMessage } from './aurelia-http-response-message';

/**
 * @name IHttpClientMethodFunction
 * @desc Abstracts various calls to execute HTTP method calls on the Aurelia HttpClient class.
 * 
 * @param {string} url - The target URL.
 * @param {any} url - The request payload.
 * @param {number} timeout - The timeout for the HTTP call.
 * 
 * @returns {Promise<HttpResponseMessage>} - A cancellable promise object.
 */
interface IHttpClientMethodFunction {
    (url: string, content: any, timeout: number): Promise<HttpResponseMessage>;
}

/**
 * @name AureliaHttpClient
 * @desc An implementation of IHttpClient which uses the Aurelia HttpClient class.
 */
export class AureliaHttpClient implements IHttpClient {
   
    /** The Aurelia HttpClient */
    protected httpClient: HttpClient;
    /** Contains a mapping from a HttpRequestMethod enum, to a function which calls the HTTP method on the Aurelia HttpClient object */
    protected httpClientFunctions: Map<HttpRequestMethod, IHttpClientMethodFunction>

    constructor() {
        this.httpClient = new HttpClient();
        this.httpClientFunctions = new Map<HttpRequestMethod, IHttpClientMethodFunction>();
        this.InitializeHttpClientFunctionsMap();
    }

    /** @inheritdoc */
    public Call(url: string, requestMethod: HttpRequestMethod, content: any, timeout: number): Promise<IHttpResponse> {

        return new Promise<IHttpResponse>((
            resolve: ((result: IHttpResponse) => void), 
            reject: ((result: IHttpResponse) => void)
            ) : void => {
                
                // Retrieve the HttpClient object function corresponding to parameter 'requestMethod' and execute the function
                (<IHttpClientMethodFunction>this.httpClientFunctions.get(requestMethod))(url, content, timeout)
                .then((response: HttpResponseMessage ) : void => {
                    let aureliaHttpResponseMessage: AureliaHttpResponseMessage = new AureliaHttpResponseMessage(response);
                    resolve(aureliaHttpResponseMessage);
                })
                .catch((response: HttpResponseMessage ) : void => {
                    let aureliaHttpResponseMessage: AureliaHttpResponseMessage = new AureliaHttpResponseMessage(response);
                    reject(aureliaHttpResponseMessage);
                })
            }
        );
    }

    protected InitializeHttpClientFunctionsMap() : void {
        this.httpClientFunctions.set(HttpRequestMethod.Get, (url: string, content: any, timeout: number): Promise<HttpResponseMessage> => {
            return this.httpClient.createRequest(url).asGet().withTimeout(timeout).send();
        });
        this.httpClientFunctions.set(HttpRequestMethod.Delete, (url: string, content: any, timeout: number): Promise<HttpResponseMessage> => {
            return this.httpClient.createRequest(url).asDelete().withTimeout(timeout).send();
        });
        this.httpClientFunctions.set(HttpRequestMethod.Post, (url: string, content: any, timeout: number): Promise<HttpResponseMessage> => {
            return this.httpClient.createRequest(url).asPost().withContent(content).withTimeout(timeout).send();
        });
        this.httpClientFunctions.set(HttpRequestMethod.Put, (url: string, content: any, timeout: number): Promise<HttpResponseMessage> => {
            return this.httpClient.createRequest(url).asPut().withContent(content).withTimeout(timeout).send();
        });

        // Check that all enum values are supported / handled
        for (let currentHttpRequestMethodValue of Object.keys(HttpRequestMethod)) {
            if (this.httpClientFunctions.has(<HttpRequestMethod>currentHttpRequestMethodValue) === false)
                throw new Error(`Map 'httpClientFunctions' does not contain an entry for HttpRequestMethod '${currentHttpRequestMethodValue}'.`);
        }
    }
}