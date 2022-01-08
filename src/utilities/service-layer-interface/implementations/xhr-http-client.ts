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

import { IHttpClient, IHttpResponse } from '../ihttp-client';
import { HttpRequestMethod } from '../http-request-method';

/**
 * @name IPromiseCallbackFunction
 * @desc The resolve or reject callback functions passed to a Promise<IHttpResponse>.
 * 
 * @param {IHttpResponse} httpResponse - The callback function.
 */
interface IPromiseCallbackFunction {
    (httpResponse: IHttpResponse): void;
}

/**
 * @name XhrHttpClient
 * @desc An implementation of IHttpClient which uses the JavaScript XMLHttpRequest class.
 */
export class XhrHttpClient implements IHttpClient {

    /** The JavaScript XMLHttpRequest */
    protected xmlHttpRequest: XMLHttpRequest;
    /** The function to call in the case that calling the Call() method is successful. */
    protected resolveFunction : IPromiseCallbackFunction | null;
    /** The function to call in the case that calling the Call() method fails. */
    protected rejectFunction : IPromiseCallbackFunction | null;
    
    constructor() {
        this.xmlHttpRequest = new XMLHttpRequest();
        this.resolveFunction = null;
        this.rejectFunction = null;
    }

    /** @inheritdoc */
    public Call(url: string, requestMethod: HttpRequestMethod, content: any, timeout: number): Promise<IHttpResponse> {

        let returnPromise: Promise<IHttpResponse> = new Promise<IHttpResponse>((
            resolve: ((result: IHttpResponse) => void), 
            reject: ((result: IHttpResponse) => void)
            ) : void => {

                this.resolveFunction = resolve;
                this.rejectFunction = reject;

                // Call the xmlHttpRequest
            }
        );

        throw new Error("Method not implemented.");
    }

    protected InitializeXmlHttpRequest() : void {
        this.xmlHttpRequest.onload = (progressEvent: ProgressEvent) => {

            if (this.IsHttpResponseSuccessStatus(this.xmlHttpRequest.status) == true) {

                // Convert xmlHttpRequest stuff to an IHttpResponse

                //this.resolveFunction(IHttpResponse);

                throw new Error("Method not implemented.");
            }
        };
    }

    // TODO Need comments
    protected IsHttpResponseSuccessStatus(statusCode: number) : Boolean {

        return (statusCode == 200 || statusCode == 201 || statusCode == 202 || statusCode == 204);
    }
}