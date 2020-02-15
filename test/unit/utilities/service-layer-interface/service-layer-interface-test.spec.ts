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

import { IHttpClient, IHttpResponse } from '../../../../src/utilities/service-layer-interface/ihttp-client';
import { HttpRequestMethod } from '../../../../src/utilities/service-layer-interface/http-request-method';
import { HttpUrlPathAndQueryBuilder } from '../../../../src/utilities/service-layer-interface/http-url-path-and-query-builder';
import { UrlScheme } from '../../../../src/utilities/service-layer-interface/url-scheme';
import { HttpUrlBuilder } from '../../../../src/utilities/service-layer-interface/http-url-builder';
import { HttpUrlPrefixBuilder } from '../../../../src/utilities/service-layer-interface/http-url-prefix-builder';
import { ServiceCallErrorType, ServiceLayerCallResult, ServiceLayerInterface, HttpContentType } from '../../../../src/utilities/service-layer-interface/service-layer-interface';

/**
 * @name HttpResponse
 * @description Simple implementation of IHttpResponse.
 */
class HttpResponse implements IHttpResponse {

    protected content: any;    
    protected mimeType: string | null;
    protected responseType: string;
    protected statusCode: number;
    protected statusText: string;

    constructor(content: any, mimeType: string | null, responseType: string, statusCode: number, statusText: string) {
        this.content = content;
        this.mimeType = mimeType;
        this.responseType = responseType;
        this.statusCode = statusCode;
        this.statusText = statusText;
    }

    get Content(): any {
        return this.content;
    }  

    get MimeType(): string | null {
        return this.mimeType;
    }

    get ResponseType(): string {
        return this.responseType;
    }

    get StatusCode(): number {
        return this.statusCode;
    }

    get StatusText(): string {
        return this.statusText;
    }
}

/**
 * @desc Unit tests for the ServiceLayerInterface class.
 */
describe("ServiceLayerInterface Tests", () => {

    // TODO: Try and use mocks within Jest rather than parameter checking in function CreateMockIHttpClient()

    let defaultUrlPrefixBuilder: HttpUrlPrefixBuilder;
    let defaultMockHttpClient: IHttpClient;
    let testServiceLayerInterface: ServiceLayerInterface;

    beforeEach(() => {

        defaultMockHttpClient = {
            Call(url: string, requestMethod: HttpRequestMethod, content: any, timeout: number) : Promise<IHttpResponse> {
                throw new Error("Unexpected invocation of method IHttpClient.Call().");
            }
        };
        defaultUrlPrefixBuilder = new HttpUrlPrefixBuilder(
            UrlScheme.Http, 
            "www.example.com", 
            80, 
            "api/"
        );
        testServiceLayerInterface = new ServiceLayerInterface(defaultUrlPrefixBuilder, 1000, defaultMockHttpClient);
    });
  
    afterEach(() => { 
    });

    it("Constructor(): 'defaultTimeout' parameter less than 1 throws exception.", done => {
        expect(() => {
            testServiceLayerInterface = new ServiceLayerInterface(defaultUrlPrefixBuilder, 0, defaultMockHttpClient);
        }).toThrow(new TypeError("Parameter 'defaultTimeout' must be greater than or equal to 1."));
        done();
    });

    it("CallServiceLayer(): Unhandled HTTP content (MIME) type for resolved promise throws exception.", done => {
        let responseContent = { "name": "value" };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, "unhandled-content-type", "json", 200, "OK");
        let returnedPromise: Promise<IHttpResponse> = CreateIHttpResponsePromise(returnedHttpResponse, true);
        let mockHttpClient: IHttpClient = CreateMockIHttpClient("http://www.example.com:80/api/myPath/", HttpRequestMethod.Get, "", 1000, returnedPromise);
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");
        testServiceLayerInterface = new ServiceLayerInterface(defaultUrlPrefixBuilder, 1000, mockHttpClient);

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .then((result: ServiceLayerCallResult) => {
            fail(`Call to ServiceLayerInterface.CallServiceLayer() returned a resolved promise.  ${result}`); 
        })
        .catch((result: ServiceLayerCallResult) => { 
            expect(result.Content.name).toBe("value");
            expect(result.ContentMimeType).toBe(null);
            expect(result.ErrorType).toBe(ServiceCallErrorType.UnhandledHttpContentType);
            expect(result.ReturnedHttpStatusCode).toBe(200);
            expect(result.ReturnedHttpStatusText).toBe("OK");
            expect(result.Success).toBe(false);
            expect(result.SystemErrorMessage).toBe("Response contained unhandled HTTP content type 'unhandled-content-type' calling URL 'http://www.example.com:80/api/myPath/'.");
            done();
        });
    });

    it("CallServiceLayer(): Unhandled HTTP content (MIME) type for rejected promise throws exception.", done => {
        let responseContent = { "name": "value" };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, "application/octet-stream", "error", 200, "OK");
        let returnedPromise: Promise<IHttpResponse> = CreateIHttpResponsePromise(returnedHttpResponse, false);
        let mockHttpClient: IHttpClient = CreateMockIHttpClient("http://www.example.com:80/api/myPath/", HttpRequestMethod.Get, "", 1000, returnedPromise);
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");
        testServiceLayerInterface = new ServiceLayerInterface(defaultUrlPrefixBuilder, 1000, mockHttpClient);

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .then((result: ServiceLayerCallResult) => {
            fail(`Call to ServiceLayerInterface.CallServiceLayer() returned a resolved promise.  ${result}`); 
        })
        .catch((result: ServiceLayerCallResult) => { 
            expect(result.Content.name).toBe("value");
            expect(result.ContentMimeType).toBe(null);
            expect(result.ErrorType).toBe(ServiceCallErrorType.UnhandledHttpContentType);
            expect(result.ReturnedHttpStatusCode).toBe(200);
            expect(result.ReturnedHttpStatusText).toBe("OK");
            expect(result.Success).toBe(false);
            expect(result.SystemErrorMessage).toBe("Response contained unhandled HTTP content type 'application/octet-stream' calling URL 'http://www.example.com:80/api/myPath/'.");
            done();
        });
    });

    it("CallServiceLayer(): Non success HTTP status throws exception.", done => {
        let returnedHttpResponse: HttpResponse = new HttpResponse("", null, "json", 404, "Not Found");
        let returnedPromise: Promise<IHttpResponse> = CreateIHttpResponsePromise(returnedHttpResponse, false);
        let mockHttpClient: IHttpClient = CreateMockIHttpClient("http://www.example.com:80/api/myPath/", HttpRequestMethod.Get, "", 1000, returnedPromise);
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");
        testServiceLayerInterface = new ServiceLayerInterface(defaultUrlPrefixBuilder, 1000, mockHttpClient);

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .then((result: ServiceLayerCallResult) => {
            fail(`Call to ServiceLayerInterface.CallServiceLayer() returned a resolved promise.  ${result}`); 
        })
        .catch((result: ServiceLayerCallResult) => { 
            expect(result.Content).toBe("");
            expect(result.ContentMimeType).toBe(null);
            expect(result.ErrorType).toBe(ServiceCallErrorType.NonSuccessHttpStatus);
            expect(result.ReturnedHttpStatusCode).toBe(404);
            expect(result.ReturnedHttpStatusText).toBe("Not Found");
            expect(result.Success).toBe(false);
            expect(result.SystemErrorMessage).toBe("Response returned non-success HTTP status code 404 indicating 'Not Found' status calling URL 'http://www.example.com:80/api/myPath/'.");
            done();
        });
    });

    it("CallServiceLayer(): Timeout throws exception.", done => {
        let responseContent = { "isTrusted": true };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, null, "timeout", 0, "");
        let returnedPromise: Promise<IHttpResponse> = CreateIHttpResponsePromise(returnedHttpResponse, false);
        let mockHttpClient: IHttpClient = CreateMockIHttpClient("http://www.example.com:80/api/myPath/", HttpRequestMethod.Get, "", 1000, returnedPromise);
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");
        testServiceLayerInterface = new ServiceLayerInterface(defaultUrlPrefixBuilder, 1000, mockHttpClient);

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .then((result: ServiceLayerCallResult) => {
            fail(`Call to ServiceLayerInterface.CallServiceLayer() returned a resolved promise.  ${result}`); 
        })
        .catch((result: ServiceLayerCallResult) => { 
            expect(result.Content).toBe(responseContent);
            expect(result.ContentMimeType).toBe(null);
            expect(result.ErrorType).toBe(ServiceCallErrorType.Timeout);
            expect(result.ReturnedHttpStatusCode).toBe(0);
            expect(result.ReturnedHttpStatusText).toBe("");
            expect(result.Success).toBe(false);
            expect(result.SystemErrorMessage).toBe("Call timed out attempting to connect to URL 'http://www.example.com:80/api/myPath/'.");
            done();
        });
    });

    it("CallServiceLayer(): Failure to connect throws exception.", done => {
        let responseContent = { "isTrusted": true };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, null, "error", 0, "");
        let returnedPromise: Promise<IHttpResponse> = CreateIHttpResponsePromise(returnedHttpResponse, false);
        let mockHttpClient: IHttpClient = CreateMockIHttpClient("http://www.example.com:80/api/myPath/", HttpRequestMethod.Get, "", 1000, returnedPromise);
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");
        testServiceLayerInterface = new ServiceLayerInterface(defaultUrlPrefixBuilder, 1000, mockHttpClient);

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .then((result: ServiceLayerCallResult) => {
            fail(`Call to ServiceLayerInterface.CallServiceLayer() returned a resolved promise.  ${result}`); 
        })
        .catch((result: ServiceLayerCallResult) => { 
            expect(result.Content).toBe(responseContent);
            expect(result.ContentMimeType).toBe(null);
            expect(result.ErrorType).toBe(ServiceCallErrorType.ConnectionFailed);
            expect(result.ReturnedHttpStatusCode).toBe(0);
            expect(result.ReturnedHttpStatusText).toBe("");
            expect(result.Success).toBe(false);
            expect(result.SystemErrorMessage).toBe("Failed to connect to URL 'http://www.example.com:80/api/myPath/'.");
            done();
        });
    });

    it("CallServiceLayer(): Unknown error throws exception.", done => {
        let responseContent = { "isTrusted": true };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, null, "something else", 0, "");
        let returnedPromise: Promise<IHttpResponse> = CreateIHttpResponsePromise(returnedHttpResponse, false);
        let mockHttpClient: IHttpClient = CreateMockIHttpClient("http://www.example.com:80/api/myPath/", HttpRequestMethod.Get, "", 1000, returnedPromise);
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");
        testServiceLayerInterface = new ServiceLayerInterface(defaultUrlPrefixBuilder, 1000, mockHttpClient);

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .then((result: ServiceLayerCallResult) => {
            fail(`Call to ServiceLayerInterface.CallServiceLayer() returned a resolved promise.  ${result}`); 
        })
        .catch((result: ServiceLayerCallResult) => { 
            expect(result.Content).toBe(responseContent);
            expect(result.ContentMimeType).toBe(null);
            expect(result.ErrorType).toBe(ServiceCallErrorType.UnknownError);
            expect(result.ReturnedHttpStatusCode).toBe(0);
            expect(result.ReturnedHttpStatusText).toBe("");
            expect(result.Success).toBe(false);
            expect(result.SystemErrorMessage).toBe("Unknown error occurred attempting to connect to URL 'http://www.example.com:80/api/myPath/'.");
            done();
        });
    });

    it("CallServiceLayer(): Success test.", done => {
        let responseContent = { "name": "value" };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, "application/json", "json", 200, "OK");
        let returnedPromise: Promise<IHttpResponse> = CreateIHttpResponsePromise(returnedHttpResponse, true);
        let mockHttpClient: IHttpClient = CreateMockIHttpClient("http://www.example.com:80/api/myPath/", HttpRequestMethod.Get, "", 1000, returnedPromise);
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");
        testServiceLayerInterface = new ServiceLayerInterface(defaultUrlPrefixBuilder, 1000, mockHttpClient);

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .then((result: ServiceLayerCallResult) => {
            expect(result.Content.name).toBe("value");
            expect(result.ContentMimeType).toBe(HttpContentType.Application_Json);
            expect(result.ErrorType).toBe(null);
            expect(result.ReturnedHttpStatusCode).toBe(200);
            expect(result.ReturnedHttpStatusText).toBe("OK");
            expect(result.Success).toBe(true);
            expect(result.SystemErrorMessage).toBe("");
            done();
        })
        .catch((result: ServiceLayerCallResult) => { 
            fail(`Call to ServiceLayerInterface.CallServiceLayer() returned a rejected promise.  ${result}`); 
        });
    });

    it("CallServiceLayer(): Override base URL success test.", done => {
        let responseContent = { "name": "value" };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, "application/json", "json", 200, "OK");
        let returnedPromise: Promise<IHttpResponse> = CreateIHttpResponsePromise(returnedHttpResponse, true);
        let mockHttpClient: IHttpClient = CreateMockIHttpClient("https://www.example.com:8080/api/myPath/", HttpRequestMethod.Get, "", 1000, returnedPromise);
        let url: HttpUrlBuilder = new HttpUrlBuilder(UrlScheme.Https, "www.example.com", 8080, "api/myPath/");
        testServiceLayerInterface = new ServiceLayerInterface(defaultUrlPrefixBuilder, 1000, mockHttpClient);

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .then((result: ServiceLayerCallResult) => {
            expect(result.Content).toBe(responseContent);
            expect(result.ContentMimeType).toBe(HttpContentType.Application_Json);
            expect(result.ErrorType).toBe(null);
            expect(result.ReturnedHttpStatusCode).toBe(200);
            expect(result.ReturnedHttpStatusText).toBe("OK");
            expect(result.Success).toBe(true);
            expect(result.SystemErrorMessage).toBe("");
            done();
        })
        .catch((result: ServiceLayerCallResult) => { 
            fail(`Call to ServiceLayerInterface.CallServiceLayer() returned a rejected promise.  ${result}`); 
        });
    });

    it("CallServiceLayer(): Override timeout success test.", done => {
        let responseContent = { "name": "value" };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, "application/json", "json", 200, "OK");
        let returnedPromise: Promise<IHttpResponse> = CreateIHttpResponsePromise(returnedHttpResponse, true);
        let mockHttpClient: IHttpClient = CreateMockIHttpClient("http://www.example.com:80/api/myPath/", HttpRequestMethod.Get, "", 1500, returnedPromise);
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");
        testServiceLayerInterface = new ServiceLayerInterface(defaultUrlPrefixBuilder, 1000, mockHttpClient);

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json, 1500)
        .then((result: ServiceLayerCallResult) => {
            expect(result.Content.name).toBe("value");
            expect(result.ContentMimeType).toBe(HttpContentType.Application_Json);
            expect(result.ErrorType).toBe(null);
            expect(result.ReturnedHttpStatusCode).toBe(200);
            expect(result.ReturnedHttpStatusText).toBe("OK");
            expect(result.Success).toBe(true);
            expect(result.SystemErrorMessage).toBe("");
            done();
        })
        .catch((result: ServiceLayerCallResult) => { 
            fail(`Call to ServiceLayerInterface.CallServiceLayer() returned a rejected promise.  ${result}`); 
        });
    });

    function CreateIHttpResponsePromise(httpResponse: HttpResponse, resolvePromise: boolean ): Promise<IHttpResponse> {

        return new Promise<IHttpResponse>((
            resolve: ((response: IHttpResponse) => void), 
            reject: ((response: IHttpResponse) => void)) : void => {
                if (resolvePromise === true)
                    resolve(httpResponse);
                else
                    reject(httpResponse);
            }
        )
    }

    function CreateMockIHttpClient(
        url: string, 
        requestMethod: HttpRequestMethod, 
        content: any, 
        timeout: number, 
        returnPromise: Promise<IHttpResponse>
        ): IHttpClient {

        let _url: string = url;
        let _requestMethod: HttpRequestMethod = requestMethod;
        let _content: any = content;
        let _timeout: number = timeout;

        return {
            Call(url: string, requestMethod: HttpRequestMethod, content: any, timeout: number) : Promise<IHttpResponse> {
                if (url !== _url) 
                    throw new Error(`Invalid 'url' parameter passed to IHttpClient.Call() method.  Expected '${_url}',  but got '${url}'.'`);
                if (requestMethod !== _requestMethod) 
                    throw new Error(`Invalid 'requestMethod' parameter passed to IHttpClient.Call() method.  Expected '${_requestMethod}',  but got '${requestMethod}'.'`);
                if (content !== _content) 
                    throw new Error(`Invalid 'content' parameter passed to IHttpClient.Call() method.  Expected '${_content}',  but got '${content}'.'`);
                if (timeout !== _timeout) 
                    throw new Error(`Invalid 'timeout' parameter passed to IHttpClient.Call() method.  Expected '${_timeout}',  but got '${timeout}'.'`);
                return returnPromise;
            }
        };
    }
})

