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

import { IHttpClient, IHttpResponse } from './ihttp-client';
import { HttpUrlPrefixBuilder } from './http-url-prefix-builder';
import { HttpUrlPathAndQueryBuilder } from './http-url-path-and-query-builder';
import { HttpUrlBuilder } from './http-url-builder';
import { HttpRequestMethod } from './http-request-method';

/**
 * @name HttpContentType
 * @desc Http header content types (type and subtype separated by underscores).
 */
export enum HttpContentType {
    Application_Json = "Application_Json"
}

/**
 * @name ServiceCallErrorType
 * @desc Types of error that can occur when calling a HTTP-based service layer.
 */
export enum ServiceCallErrorType {
    /** A connection could not be established (e.g. because of incorrect URL, or specified port closed) */
    ConnectionFailed = "ConnectionFailed", 
    /** A connection could not be established or response was not received within the specified timeout period */
    Timeout = "Timeout", 
    /** The service returned a status indicating non-success */
    NonSuccessHttpStatus = "NonSuccessHttpStatus",
    /** The call returned an unhandled HTTP content type */
    UnhandledHttpContentType = "UnhandledHttpContentType", 
    /** An unknown or unexpected error occurred */ 
    UnknownError = "UnknownError"
}

/**
 * @name ServiceLayerCallResult
 * @desc Holds details of the result of calling the service layer of an application.
 */
export class ServiceLayerCallResult {

    /**
     * @name Content
     * @returns {any} - The HTTP response content.
     */
    get Content(): any {
        return this.content;
    }

    /**
     * @name ContentMimeType
     * @returns {HttpContentType | null} - The MIME type of the HTTP response.
     */
    get ContentMimeType(): HttpContentType | null {
        return this.contentMimeType;
    }
    
    /**
     * @name ReturnedHttpStatusCode
     * @returns {number} - The returned HTTP status code.
     */
    get ReturnedHttpStatusCode(): number {
        return this.returnedHttpStatusCode;
    }

    /**
     * @name ReturnedHttpStatusText
     * @returns {string} - The meaning of the returned HTTP status code.
     */
    get ReturnedHttpStatusText(): string {
        return this.returnedHttpStatusText;
    }
    
    /**
     * @name Success
     * @returns {boolean} - Whether the service layer call was successful.
     */
    get Success(): boolean {
        return this.success;
    }

    /**
     * @name ErrorType
     * @returns {ServiceCallErrorType | null} - The type of error resulting from the service layer call (or null in the case of no error).
     */
    get ErrorType(): ServiceCallErrorType | null {
        return this.errorType;
    }

    /**
     * @name SystemErrorMessage
     * @returns {string} - The description of the error resulting from the service layer call (or a blank string in the case of no error).
     */
    get SystemErrorMessage(): string {
        return this.systemErrorMessage;
    }

    /**
     * @name ServiceLayerCallResult
     * 
     * @param {any} content - The HTTP response content.
     * @param {HttpContentType | null} contentMimeType - The MIME type of the HTTP response.
     * @param {number} returnedHttpStatusCode - The returned HTTP status code.
     * @param {string} returnedHttpStatusText - The meaning of the returned HTTP status code.
     * @param {boolean} success - Whether the service layer call was successful.
     * @param {ServiceCallErrorType | null} errorType - The type of error resulting from the service layer call (or null in the case of no error).
     * @param {string} systemErrorMessage - The description of the error resulting from the service layer call (or a blank string in the case of no error).
     */
    constructor(
        protected content: any, 
        protected contentMimeType: HttpContentType | null, 
        protected returnedHttpStatusCode: number, 
        protected returnedHttpStatusText: string, 
        protected success: boolean, 
        protected errorType: ServiceCallErrorType | null, 
        protected systemErrorMessage: string = ""
    ) {
    }
}

/**
 * @name ServiceLayerInterface
 * @desc Provides interface to an application's service layer and methods which return either the results of calling the service layer, or detailed and consistent information about why a call to the service layer failed.
 */
export class ServiceLayerInterface {

    // TODO:
    //   checks on serviceLayerBaseUrl... e.g. ends with '/'
    //   add defaultUiErrorMessage to construcor
    //   Request headers
    //   Ability to set bearer token etc... via HttpClient().configure() (see https://aurelia.io/docs/plugins/http-services#aurelia-http-client)
    //   Add friendly/UI error message??
    //   Add cancellation of an in progress service call
    //   Think about putting Aurelia implementation classes into an aurelia sub folder

    // Contains a mapping from a string representing a HTTP content type, to the equivalent HttpContentType enum for the content type
    protected httpContentTypeStringValues: Map<string | null, HttpContentType>;
    // An implementation of IHttpClient
    protected httpClient: IHttpClient;
    // The URL prefix to use for each call to the service layer
    protected serviceLayerBaseUrl: HttpUrlPrefixBuilder;
    // The default timeout length for each call to the service layer (in milliseconds)
    protected defaultTimeout: number;

    /**
     * @name ServiceLayerInterface
     * 
     * @param {string} serviceLayerBaseUrl - The URL prefix to use for each call to the service layer.
     * @param {number} defaultTimeout - The default timeout length for each call to the service layer (in milliseconds).
     * @param {IHttpClient} httpClient - The HTTP client abstraction to use to make HTTP calls.
     */
    constructor(serviceLayerBaseUrl: HttpUrlPrefixBuilder, defaultTimeout: number, httpClient: IHttpClient) {
        if (defaultTimeout < 1)
            throw new Error(`Parameter 'defaultTimeout' must be greater than or equal to 1.`);

        this.InitializeHttpContentTypeStringValuesMap() ;
        this.serviceLayerBaseUrl = serviceLayerBaseUrl;
        this.defaultTimeout = defaultTimeout;
        this.httpClient = httpClient;
    }

    /**
     * @name CallServiceLayer
     * @desc Calls an application's service layer.
     * 
     * @param {HttpUrlBuilder | HttpUrlPathAndQueryBuilder} urlBuider - The URL to call on the service layer.  Either a full URL, or a suffix (and query parameters) to the prefix defined on the constructor.
     * @param {HttpRequestMethod} httpMethod - The HTTP request method to use in the call.
     * @param {any} body - The message body.
     * @param {HttpContentType} bodyContentType - The content type of the message body.
     * @param {number | null} timeout - (Optional) The timeout length for the call, or null to use the timeout defined in the constructor.
     * 
     * @returns {Promise<ServiceLayerCallResult>} - A promise which resolves to a ServiceLayerCallResult object.
     */
    public CallServiceLayer(
        urlBuider: HttpUrlBuilder | HttpUrlPathAndQueryBuilder, 
        httpMethod: HttpRequestMethod, 
        body: any = null,
        bodyContentType: HttpContentType = HttpContentType.Application_Json, 
        timeout: number | null = null
    ) : Promise<ServiceLayerCallResult> {

        const timeoutResponseTypeString: string = "timeout";
        const errorResponseTypeString: string = "error";

        // Build the path
        let url: string;
        if (urlBuider instanceof HttpUrlBuilder)
            url = (<HttpUrlBuilder>urlBuider).Url;
        else if (urlBuider instanceof HttpUrlPathAndQueryBuilder)
            url = this.serviceLayerBaseUrl.UrlPrefix + (<HttpUrlPathAndQueryBuilder>urlBuider).PathAndQuery;
        else
            throw new Error(`Parameter 'urlBuider' contains unhandled union type.`);
            
        // Get the correct timeout
        let timeoutToUse = this.defaultTimeout;
        if (timeout !== null) 
            timeoutToUse = timeout;

        return new Promise<ServiceLayerCallResult>((
            resolve: ((result: ServiceLayerCallResult) => void), 
            reject: ((result: ServiceLayerCallResult) => void)) : void => {

                this.httpClient.Call(url, httpMethod, body, timeoutToUse)
                .then((response: IHttpResponse ) : void => {

                    if (this.httpContentTypeStringValues.has(response.MimeType) === false) {
                        // Returned content/MIME type is not handled
                        let result: ServiceLayerCallResult = new ServiceLayerCallResult(
                            response.Content,
                            null, 
                            response.StatusCode, 
                            response.StatusText, 
                            false,  
                            ServiceCallErrorType.UnhandledHttpContentType, 
                            `Response contained unhandled HTTP content type '${response.MimeType}' calling URL '${url}'.`
                        );
                        reject(result);
                    }

                    // Call was successful
                    let result: ServiceLayerCallResult = new ServiceLayerCallResult(
                        response.Content,
                        <HttpContentType>this.httpContentTypeStringValues.get(response.MimeType), 
                        response.StatusCode, 
                        response.StatusText, 
                        true,  
                        null, 
                        ""
                    );
                    resolve(result);
                })
                .catch((response: IHttpResponse) : void => {
                    if (response.MimeType !== null && this.httpContentTypeStringValues.has(response.MimeType) === false) {
                        // Returned content/MIME type is not handled
                        let result: ServiceLayerCallResult = new ServiceLayerCallResult(
                            response.Content,
                            null, 
                            response.StatusCode, 
                            response.StatusText, 
                            false,  
                            ServiceCallErrorType.UnhandledHttpContentType, 
                            `Response contained unhandled HTTP content type '${response.MimeType}' calling URL '${url}'.`
                        );
                        reject(result);
                    }
                    else if (response.StatusCode > 0) {
                        // Response was received, but status is not success status
                        let result: ServiceLayerCallResult = new ServiceLayerCallResult(
                            response.Content,
                            null, 
                            response.StatusCode, 
                            response.StatusText, 
                            false,  
                            ServiceCallErrorType.NonSuccessHttpStatus, 
                            `Response returned non-success HTTP status code ${response.StatusCode} indicating '${response.StatusText}' status calling URL '${url}'.`
                        );
                        reject(result);
                    }
                    else {
                        if (response.ResponseType === timeoutResponseTypeString) {
                            // No response within timeout period
                            let result: ServiceLayerCallResult = new ServiceLayerCallResult(
                                response.Content,
                                null, 
                                response.StatusCode, 
                                response.StatusText, 
                                false,  
                                ServiceCallErrorType.Timeout, 
                                // TODO: Potentially add 'after x seconds' if it's possible to
                                `Call timed out attempting to connect to URL '${url}'.`
                            );
                            reject(result);
                        }
                        else if (response.ResponseType === errorResponseTypeString) {
                            // Error connecting to URL (possibly invalid URL or port)
                            let result: ServiceLayerCallResult = new ServiceLayerCallResult(
                                response.Content,
                                null, 
                                response.StatusCode, 
                                response.StatusText, 
                                false,  
                                ServiceCallErrorType.ConnectionFailed, 
                                `Failed to connect to URL '${url}'.`
                            );
                            reject(result);
                        }
                        else {
                            let result: ServiceLayerCallResult = new ServiceLayerCallResult(
                                response.Content,
                                null, 
                                response.StatusCode, 
                                response.StatusText, 
                                false,  
                                ServiceCallErrorType.UnknownError, 
                                `Unknown error occurred attempting to connect to URL '${url}'.`
                            );
                            reject(result);
                        }
                    }
                })
            }
        );
    }

    protected InitializeHttpContentTypeStringValuesMap() : void {
        this.httpContentTypeStringValues = new Map<string | null, HttpContentType>();
        this.httpContentTypeStringValues.set("application/json", HttpContentType.Application_Json);

        // Check that all enum values are supported / handled
        let handledHttpContentTypes = new Map<HttpContentType, HttpContentType>();
        for(let currentValue of Array.from(this.httpContentTypeStringValues.values())) {
            handledHttpContentTypes.set(currentValue, currentValue);
        }
        for (let currentHttpContentTypeValue of Object.keys(HttpContentType)) {
            if (handledHttpContentTypes.has(<HttpContentType>currentHttpContentTypeValue) === false)
                throw new Error(`Map 'httpContentTypeStringValues' does not contain an entry for HttpContentType '${currentHttpContentTypeValue}'.`);
        }
    }

    protected IsSuccessHttpStatusCode(statusCode: number) : boolean {
        return (statusCode >= 200 && statusCode <= 299);
    }
}