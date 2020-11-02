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

import { HttpRequestMethod } from './http-request-method';

/**
 * @name IHttpResponse
 * @desc Defines data properties returned by a HTTP call.
 */
export interface IHttpResponse {

    /**
     * @name Content
     * @returns {any} - The formatted response data.
     */
    Content : any;

    /**
     * @name MimeType
     * @returns {any} - The MIME type of the response data.
     */
    MimeType : string | null;

    /**
     * @name ResponseType
     * @returns {any} - Indicates of the type of data returned, including 'error', 'timeout', etc...
     */
    ResponseType : string

    /**
     * @name StatusCode
     * @returns {any} - The HTTP status code resulting from the call.
     */
    StatusCode : number

    /**
     * @name StatusText
     * @returns {any} - The meaning of the HTTP status code.
     */
    StatusText: string
}

/**
 * @name IHttpClient
 * @desc Defines methods for interfacing with an HTTP client object.  Provides a mockable abstraction around concrete implementations of HTTP clients (e.g. Angular HTTP client, Aurelia HTTP client, etc...).
 */
export interface IHttpClient {

    /**
     * @name Call
     * @desc Performs a HTTP method call.
     * 
     * @param {string} url - The URL to call.
     * @param {HttpRequestMethod} requestMethod - The HTTP method to use.
     * @param {any} content - The content/body of the HTTP request.
     * @param {number} timeout - The timeout for the HTTP call.
     * 
     * @returns {Promise<IHttpResponse>} - A promise which resolves to an Implementation of the IHttpResponse interface.
     */
    Call(url: string, requestMethod: HttpRequestMethod, content: any, timeout: number) : Promise<IHttpResponse>;
}