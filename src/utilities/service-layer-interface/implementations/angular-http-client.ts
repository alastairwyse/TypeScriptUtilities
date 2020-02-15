/*
 * Copyright 2020 Alastair Wyse (https://github.com/alastairwyse/TypeScriptUtilities/)
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

import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { timeout } from 'rxjs/operators';
import { IHttpClient, IHttpResponse } from '../ihttp-client';
import { HttpRequestMethod } from '../http-request-method';
import { AngularHttpSuccessResponse } from './angular-http-success-response';
import { AngularHttpErrorResponse } from './angular-http-error-response';

/**
 * @name AngularHttpClient
 * @description An implementation of IHttpClient which uses the Angular HttpClient class.
 */
export class AngularHttpClient implements IHttpClient {

    /**
     * @name AngularHttpClient
     * 
     * @param {HttpClient} httpClient - The Angular HttpClient instance to use.
     */
    constructor(protected httpClient: HttpClient) {
    }

    Call(url: string, requestMethod: HttpRequestMethod, content: any, timeoutValue: number): Promise<IHttpResponse> {

        return new Promise<IHttpResponse>((
            resolve: ((result: IHttpResponse) => void), 
            reject: ((result: IHttpResponse) => void)
            ) : void => {
                this.httpClient.request<any>(requestMethod.toUpperCase(), url, { observe: "response", responseType: "json" }).pipe(timeout(timeoutValue)).toPromise()
                .then((successResponse: HttpResponse<any>) : void => {
                    let angularHttpSuccessResponse: AngularHttpSuccessResponse = new AngularHttpSuccessResponse(successResponse);
                    resolve(angularHttpSuccessResponse);
                })
                .catch((errorResponse: HttpErrorResponse) : void => {
                    let angularHttpErrorResponse: AngularHttpErrorResponse = new AngularHttpErrorResponse(errorResponse);
                    reject(angularHttpErrorResponse);
                })
            }
        );
    }
}