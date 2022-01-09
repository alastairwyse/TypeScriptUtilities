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
 * @desc Simple implementation of IHttpResponse.
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

    let defaultUrlPrefixBuilder: HttpUrlPrefixBuilder;
    let mockHttpClient: IHttpClient;
    let mockHttpClientCallMethod: any;
    let testServiceLayerInterface: ServiceLayerInterface;

    beforeEach(() => {

        mockHttpClient = jest.genMockFromModule("../../../../src/utilities/service-layer-interface/ihttp-client");
        mockHttpClient.Call = jest.fn();
        mockHttpClientCallMethod = mockHttpClient.Call;
        defaultUrlPrefixBuilder = new HttpUrlPrefixBuilder(
            UrlScheme.Http, 
            "www.example.com", 
            80, 
            "api/"
        );
        testServiceLayerInterface = new ServiceLayerInterface(defaultUrlPrefixBuilder, 1000, mockHttpClient);
    });
  
    afterEach(() => { 
    });

    it("Constructor(): 'defaultTimeout' parameter less than 1 throws exception.", done => {
        expect(() => {
            testServiceLayerInterface = new ServiceLayerInterface(defaultUrlPrefixBuilder, 0, mockHttpClient);
        }).toThrow(new TypeError("Parameter 'defaultTimeout' must be greater than or equal to 1."));
        done();
    });

    it("CallServiceLayer(): Unhandled HTTP content (MIME) type for resolved promise throws exception.", () => {

        let responseContent = { "name": "value" };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, "unhandled-content-type", "json", 200, "OK");
        mockHttpClientCallMethod.mockReturnValueOnce(
            CreateIHttpResponsePromise(returnedHttpResponse, false)
        );
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .then((result: ServiceLayerCallResult) => {
            throw new Error(`Call to ServiceLayerInterface.CallServiceLayer() returned a resolved promise.  ${result}`);
        })
        .catch((result: ServiceLayerCallResult) => { 
            // Check parameters to Call() method
            expect(mockHttpClientCallMethod.mock.calls[0][0]).toBe("http://www.example.com:80/api/myPath/");
            expect(mockHttpClientCallMethod.mock.calls[0][1]).toBe(HttpRequestMethod.Get);
            expect(mockHttpClientCallMethod.mock.calls[0][2]).toBe("");
            expect(mockHttpClientCallMethod.mock.calls[0][3]).toBe(1000);
            // Check returned ServiceLayerCallResult
            expect(result.Content.name).toBe("value");
            expect(result.ContentMimeType).toBe(null);
            expect(result.ErrorType).toBe(ServiceCallErrorType.UnhandledHttpContentType);
            expect(result.ReturnedHttpStatusCode).toBe(200);
            expect(result.ReturnedHttpStatusText).toBe("OK");
            expect(result.Success).toBe(false);
            expect(result.SystemErrorMessage).toBe("Response contained unhandled HTTP content type 'unhandled-content-type' calling URL 'http://www.example.com:80/api/myPath/'.");
        });
    });

    it("CallServiceLayer(): Unhandled HTTP content (MIME) type for rejected promise throws exception.", () => {
        let responseContent = { "name": "value" };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, "application/octet-stream", "error", 200, "OK");
        mockHttpClientCallMethod.mockReturnValueOnce(
            CreateIHttpResponsePromise(returnedHttpResponse, false)
        );
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .then((result: ServiceLayerCallResult) => {
            throw new Error(`Call to ServiceLayerInterface.CallServiceLayer() returned a resolved promise.  ${result}`);
        })
        .catch((result: ServiceLayerCallResult) => { 
            // Check parameters to Call() method
            expect(mockHttpClientCallMethod.mock.calls[0][0]).toBe("http://www.example.com:80/api/myPath/");
            expect(mockHttpClientCallMethod.mock.calls[0][1]).toBe(HttpRequestMethod.Get);
            expect(mockHttpClientCallMethod.mock.calls[0][2]).toBe("");
            expect(mockHttpClientCallMethod.mock.calls[0][3]).toBe(1000);
            // Check returned ServiceLayerCallResult
            expect(result.Content.name).toBe("value");
            expect(result.ContentMimeType).toBe(null);
            expect(result.ErrorType).toBe(ServiceCallErrorType.UnhandledHttpContentType);
            expect(result.ReturnedHttpStatusCode).toBe(200);
            expect(result.ReturnedHttpStatusText).toBe("OK");
            expect(result.Success).toBe(false);
            expect(result.SystemErrorMessage).toBe("Response contained unhandled HTTP content type 'application/octet-stream' calling URL 'http://www.example.com:80/api/myPath/'.");
        });
    });

    it("CallServiceLayer(): Non success HTTP status throws exception.", () => {
        let returnedHttpResponse: HttpResponse = new HttpResponse("", null, "json", 404, "Not Found");
        mockHttpClientCallMethod.mockReturnValueOnce(
            CreateIHttpResponsePromise(returnedHttpResponse, false)
        );
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .then((result: ServiceLayerCallResult) => {
            throw new Error(`Call to ServiceLayerInterface.CallServiceLayer() returned a resolved promise.  ${result}`);
        })
        .catch((result: ServiceLayerCallResult) => { 
            // Check parameters to Call() method
            expect(mockHttpClientCallMethod.mock.calls[0][0]).toBe("http://www.example.com:80/api/myPath/");
            expect(mockHttpClientCallMethod.mock.calls[0][1]).toBe(HttpRequestMethod.Get);
            expect(mockHttpClientCallMethod.mock.calls[0][2]).toBe("");
            expect(mockHttpClientCallMethod.mock.calls[0][3]).toBe(1000);
            // Check returned ServiceLayerCallResult
            expect(result.Content).toBe("");
            expect(result.ContentMimeType).toBe(null);
            expect(result.ErrorType).toBe(ServiceCallErrorType.NonSuccessHttpStatus);
            expect(result.ReturnedHttpStatusCode).toBe(404);
            expect(result.ReturnedHttpStatusText).toBe("Not Found");
            expect(result.Success).toBe(false);
            expect(result.SystemErrorMessage).toBe("Response returned non-success HTTP status code 404 indicating 'Not Found' status calling URL 'http://www.example.com:80/api/myPath/'.");
        });
    });

    it("CallServiceLayer(): Timeout throws exception, default timeout.", () => {
        let responseContent = { "isTrusted": true };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, null, "timeout", 0, "");
        mockHttpClientCallMethod.mockReturnValueOnce(
            CreateIHttpResponsePromise(returnedHttpResponse, false)
        );
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .then((result: ServiceLayerCallResult) => {
            throw new Error(`Call to ServiceLayerInterface.CallServiceLayer() returned a resolved promise.  ${result}`);
        })
        .catch((result: ServiceLayerCallResult) => { 
            // Check parameters to Call() method
            expect(mockHttpClientCallMethod.mock.calls[0][0]).toBe("http://www.example.com:80/api/myPath/");
            expect(mockHttpClientCallMethod.mock.calls[0][1]).toBe(HttpRequestMethod.Get);
            expect(mockHttpClientCallMethod.mock.calls[0][2]).toBe("");
            expect(mockHttpClientCallMethod.mock.calls[0][3]).toBe(1000);
            // Check returned ServiceLayerCallResult
            expect(result.Content).toBe(responseContent);
            expect(result.ContentMimeType).toBe(null);
            expect(result.ErrorType).toBe(ServiceCallErrorType.Timeout);
            expect(result.ReturnedHttpStatusCode).toBe(0);
            expect(result.ReturnedHttpStatusText).toBe("");
            expect(result.Success).toBe(false);
            expect(result.SystemErrorMessage).toBe("Call timed out attempting to connect to URL 'http://www.example.com:80/api/myPath/' after 1000 milliseconds.");
        });
    });

    it("CallServiceLayer(): Timeout throws exception, overloaded timeout.", () => {
        let responseContent = { "isTrusted": true };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, null, "timeout", 0, "");
        mockHttpClientCallMethod.mockReturnValueOnce(
            CreateIHttpResponsePromise(returnedHttpResponse, false)
        );
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json, 500)
        .then((result: ServiceLayerCallResult) => {
            throw new Error(`Call to ServiceLayerInterface.CallServiceLayer() returned a resolved promise.  ${result}`);
        })
        .catch((result: ServiceLayerCallResult) => { 
            // Check parameters to Call() method
            expect(mockHttpClientCallMethod.mock.calls[0][0]).toBe("http://www.example.com:80/api/myPath/");
            expect(mockHttpClientCallMethod.mock.calls[0][1]).toBe(HttpRequestMethod.Get);
            expect(mockHttpClientCallMethod.mock.calls[0][2]).toBe("");
            expect(mockHttpClientCallMethod.mock.calls[0][3]).toBe(500);
            // Check returned ServiceLayerCallResult
            expect(result.Content).toBe(responseContent);
            expect(result.ContentMimeType).toBe(null);
            expect(result.ErrorType).toBe(ServiceCallErrorType.Timeout);
            expect(result.ReturnedHttpStatusCode).toBe(0);
            expect(result.ReturnedHttpStatusText).toBe("");
            expect(result.Success).toBe(false);
            expect(result.SystemErrorMessage).toBe("Call timed out attempting to connect to URL 'http://www.example.com:80/api/myPath/' after 500 milliseconds.");
        });
    });

    it("CallServiceLayer(): Failure to connect throws exception.", () => {
        let responseContent = { "isTrusted": true };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, null, "error", 0, "");
        mockHttpClientCallMethod.mockReturnValueOnce(
            CreateIHttpResponsePromise(returnedHttpResponse, false)
        );
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .then((result: ServiceLayerCallResult) => {
            throw new Error(`Call to ServiceLayerInterface.CallServiceLayer() returned a resolved promise.  ${result}`);
        })
        .catch((result: ServiceLayerCallResult) => { 
            // Check parameters to Call() method
            expect(mockHttpClientCallMethod.mock.calls[0][0]).toBe("http://www.example.com:80/api/myPath/");
            expect(mockHttpClientCallMethod.mock.calls[0][1]).toBe(HttpRequestMethod.Get);
            expect(mockHttpClientCallMethod.mock.calls[0][2]).toBe("");
            expect(mockHttpClientCallMethod.mock.calls[0][3]).toBe(1000);
            // Check returned ServiceLayerCallResult
            expect(result.Content).toBe(responseContent);
            expect(result.ContentMimeType).toBe(null);
            expect(result.ErrorType).toBe(ServiceCallErrorType.ConnectionFailed);
            expect(result.ReturnedHttpStatusCode).toBe(0);
            expect(result.ReturnedHttpStatusText).toBe("");
            expect(result.Success).toBe(false);
            expect(result.SystemErrorMessage).toBe("Failed to connect to URL 'http://www.example.com:80/api/myPath/'.");
        });
    });

    it("CallServiceLayer(): Unknown error throws exception.", () => {
        let responseContent = { "isTrusted": true };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, null, "something else", 0, "");
        mockHttpClientCallMethod.mockReturnValueOnce(
            CreateIHttpResponsePromise(returnedHttpResponse, false)
        );
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .then((result: ServiceLayerCallResult) => {
            throw new Error(`Call to ServiceLayerInterface.CallServiceLayer() returned a resolved promise.  ${result}`);
        })
        .catch((result: ServiceLayerCallResult) => { 
            // Check parameters to Call() method
            expect(mockHttpClientCallMethod.mock.calls[0][0]).toBe("http://www.example.com:80/api/myPath/");
            expect(mockHttpClientCallMethod.mock.calls[0][1]).toBe(HttpRequestMethod.Get);
            expect(mockHttpClientCallMethod.mock.calls[0][2]).toBe("");
            expect(mockHttpClientCallMethod.mock.calls[0][3]).toBe(1000);
            // Check returned ServiceLayerCallResult
            expect(result.Content).toBe(responseContent);
            expect(result.ContentMimeType).toBe(null);
            expect(result.ErrorType).toBe(ServiceCallErrorType.UnknownError);
            expect(result.ReturnedHttpStatusCode).toBe(0);
            expect(result.ReturnedHttpStatusText).toBe("");
            expect(result.Success).toBe(false);
            expect(result.SystemErrorMessage).toBe("Unknown error occurred attempting to connect to URL 'http://www.example.com:80/api/myPath/'.");
        });
    });

    it("CallServiceLayer(): Success test.", () => {
        let responseContent = { "name": "value" };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, "application/json", "json", 200, "OK");
        mockHttpClientCallMethod.mockReturnValueOnce(
            CreateIHttpResponsePromise(returnedHttpResponse, true)
        );
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .catch((result: ServiceLayerCallResult) => { 
            throw new Error(`Call to ServiceLayerInterface.CallServiceLayer() returned a rejected promise.  ${result}`);
        })
        .then((result: ServiceLayerCallResult) => {
            // Check parameters to Call() method
            expect(mockHttpClientCallMethod.mock.calls[0][0]).toBe("http://www.example.com:80/api/myPath/");
            expect(mockHttpClientCallMethod.mock.calls[0][1]).toBe(HttpRequestMethod.Get);
            expect(mockHttpClientCallMethod.mock.calls[0][2]).toBe("");
            expect(mockHttpClientCallMethod.mock.calls[0][3]).toBe(1000);
            // Check returned ServiceLayerCallResult
            expect(result.Content.name).toBe("value");
            expect(result.ContentMimeType).toBe(HttpContentType.Application_Json);
            expect(result.ErrorType).toBe(null);
            expect(result.ReturnedHttpStatusCode).toBe(200);
            expect(result.ReturnedHttpStatusText).toBe("OK");
            expect(result.Success).toBe(true);
            expect(result.SystemErrorMessage).toBe("");
        });
    });

    it("CallServiceLayer(): Override base URL success test.", () => {
        let responseContent = { "name": "value" };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, "application/json", "json", 200, "OK");
        mockHttpClientCallMethod.mockReturnValueOnce(
            CreateIHttpResponsePromise(returnedHttpResponse, true)
        );
        let url: HttpUrlBuilder = new HttpUrlBuilder(UrlScheme.Https, "www.example.com", 8080, "api/myPath/");

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .catch((result: ServiceLayerCallResult) => { 
            throw new Error(`Call to ServiceLayerInterface.CallServiceLayer() returned a rejected promise.  ${result}`);
        })
        .then((result: ServiceLayerCallResult) => {
            // Check parameters to Call() method
            expect(mockHttpClientCallMethod.mock.calls[0][0]).toBe("https://www.example.com:8080/api/myPath/");
            expect(mockHttpClientCallMethod.mock.calls[0][1]).toBe(HttpRequestMethod.Get);
            expect(mockHttpClientCallMethod.mock.calls[0][2]).toBe("");
            expect(mockHttpClientCallMethod.mock.calls[0][3]).toBe(1000);
            // Check returned ServiceLayerCallResult
            expect(result.Content).toBe(responseContent);
            expect(result.ContentMimeType).toBe(HttpContentType.Application_Json);
            expect(result.ErrorType).toBe(null);
            expect(result.ReturnedHttpStatusCode).toBe(200);
            expect(result.ReturnedHttpStatusText).toBe("OK");
            expect(result.Success).toBe(true);
            expect(result.SystemErrorMessage).toBe("");
        });
    });

    it("CallServiceLayer(): Pass URL as string success test.", () => {
        let responseContent = { "name": "value" };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, "application/json", "json", 200, "OK");
        mockHttpClientCallMethod.mockReturnValueOnce(
            CreateIHttpResponsePromise(returnedHttpResponse, true)
        );
        let url: string = "https://www.example.com:8080/api/myPath/";

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json)
        .catch((result: ServiceLayerCallResult) => { 
            throw new Error(`Call to ServiceLayerInterface.CallServiceLayer() returned a rejected promise.  ${result}`);
        })
        .then((result: ServiceLayerCallResult) => {
            // Check parameters to Call() method
            expect(mockHttpClientCallMethod.mock.calls[0][0]).toBe("https://www.example.com:8080/api/myPath/");
            expect(mockHttpClientCallMethod.mock.calls[0][1]).toBe(HttpRequestMethod.Get);
            expect(mockHttpClientCallMethod.mock.calls[0][2]).toBe("");
            expect(mockHttpClientCallMethod.mock.calls[0][3]).toBe(1000);
            // Check returned ServiceLayerCallResult
            expect(result.Content).toBe(responseContent);
            expect(result.ContentMimeType).toBe(HttpContentType.Application_Json);
            expect(result.ErrorType).toBe(null);
            expect(result.ReturnedHttpStatusCode).toBe(200);
            expect(result.ReturnedHttpStatusText).toBe("OK");
            expect(result.Success).toBe(true);
            expect(result.SystemErrorMessage).toBe("");
        });
    });

    it("CallServiceLayer(): Override timeout success test.", () => {
        let responseContent = { "name": "value" };
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, "application/json", "json", 200, "OK");
        mockHttpClientCallMethod.mockReturnValueOnce(
            CreateIHttpResponsePromise(returnedHttpResponse, true)
        );
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Get, "", HttpContentType.Application_Json, 1500)
        .catch((result: ServiceLayerCallResult) => { 
            throw new Error(`Call to ServiceLayerInterface.CallServiceLayer() returned a rejected promise.  ${result}`);
        })
        .then((result: ServiceLayerCallResult) => {
            // Check parameters to Call() method
            expect(mockHttpClientCallMethod.mock.calls[0][0]).toBe("http://www.example.com:80/api/myPath/");
            expect(mockHttpClientCallMethod.mock.calls[0][1]).toBe(HttpRequestMethod.Get);
            expect(mockHttpClientCallMethod.mock.calls[0][2]).toBe("");
            expect(mockHttpClientCallMethod.mock.calls[0][3]).toBe(1500);
            // Check returned ServiceLayerCallResult
            expect(result.Content.name).toBe("value");
            expect(result.ContentMimeType).toBe(HttpContentType.Application_Json);
            expect(result.ErrorType).toBe(null);
            expect(result.ReturnedHttpStatusCode).toBe(200);
            expect(result.ReturnedHttpStatusText).toBe("OK");
            expect(result.Success).toBe(true);
            expect(result.SystemErrorMessage).toBe("");
        });
    });

    it("CallServiceLayer(): PUT returns null MIME type success test.", () => {
        let responseContent = "";
        let returnedHttpResponse: HttpResponse = new HttpResponse(responseContent, null, "json", 200, "OK");
        mockHttpClientCallMethod.mockReturnValueOnce(
            CreateIHttpResponsePromise(returnedHttpResponse, true)
        );
        let url: HttpUrlPathAndQueryBuilder = new HttpUrlPathAndQueryBuilder("myPath/");

        return testServiceLayerInterface.CallServiceLayer(url, HttpRequestMethod.Put, `{ "name": "value" }`, HttpContentType.Application_Json, 1500)
        .catch((result: ServiceLayerCallResult) => { 
            throw new Error(`Call to ServiceLayerInterface.CallServiceLayer() returned a rejected promise.  ${result}`);
        })
        .then((result: ServiceLayerCallResult) => {
            // Check parameters to Call() method
            expect(mockHttpClientCallMethod.mock.calls[0][0]).toBe("http://www.example.com:80/api/myPath/");
            expect(mockHttpClientCallMethod.mock.calls[0][1]).toBe(HttpRequestMethod.Put);
            expect(mockHttpClientCallMethod.mock.calls[0][2]).toBe(`{ "name": "value" }`);
            expect(mockHttpClientCallMethod.mock.calls[0][3]).toBe(1500);
            // Check returned ServiceLayerCallResult
            expect(result.Content).toBe("");
            expect(result.ContentMimeType).toBe(null);
            expect(result.ErrorType).toBe(null);
            expect(result.ReturnedHttpStatusCode).toBe(200);
            expect(result.ReturnedHttpStatusText).toBe("OK");
            expect(result.Success).toBe(true);
            expect(result.SystemErrorMessage).toBe("");
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
})

