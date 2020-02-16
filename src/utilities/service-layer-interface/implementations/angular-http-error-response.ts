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

import { HttpErrorResponse } from '@angular/common/http';
import { IHttpResponse } from '../ihttp-client';

/**
 * @name AngularHttpErrorResponse
 * @desc An implementation of IHttpResponse which wraps the Angular HttpErrorResponse class.
 */
export class AngularHttpErrorResponse implements IHttpResponse {

    protected static readonly unknownHttpContentTypeString: string = "application/octet-stream";
    /** The value in the Angular HttpResponse classes' 'name' property in the case of an error */
    protected static readonly angularHttpResponseErrorNameProperty: string = "HttpErrorResponse";
    /** The value in the Angular HttpResponse classes' 'name' property in the case of a timeout */
    protected static readonly angularHttpResponseTimeoutNameProperty: string = "TimeoutError";
    /** The value to return in the 'ResponseType' property in the case of an error */
    protected static readonly responseTypeErrorValue: string = "error";
    /** The value to return in the 'ResponseType' property in the case of a timeout */
    protected static readonly responseTypeTimeoutValue: string = "timeout";

    protected httpErrorResponse: HttpErrorResponse;

    /**
     * @name AngularHttpErrorResponse
     * 
     * @param {HttpErrorResponse} httpErrorResponse - The Angular HttpErrorResponse to wrap.
     */ 
    constructor(httpErrorResponse: HttpErrorResponse) {

        this.httpErrorResponse = httpErrorResponse;
    }

    get Content() : any {
        return null;
    }

    get MimeType() : string | null {
        // If the response body is a string, the Angular HttpClient class sets the HttpErrorResponse.error.error property as a SyntaxError
        //   In this case a content type string indicating an unknown type is returned.
        if ( this.httpErrorResponse.hasOwnProperty("error") && 
             this.httpErrorResponse.error !== null &&
             this.httpErrorResponse.error.hasOwnProperty("error") && 
             this.httpErrorResponse.error.error instanceof SyntaxError) {
            return AngularHttpErrorResponse.unknownHttpContentTypeString;
        }
        else {
            return null;
        }
    }

    get ResponseType() : string {
        if (this.httpErrorResponse.name === AngularHttpErrorResponse.angularHttpResponseTimeoutNameProperty) {
            return AngularHttpErrorResponse.responseTypeTimeoutValue;
        }
        else {
            return AngularHttpErrorResponse.responseTypeErrorValue;
        }
    }

    get StatusCode() : number {
        // When the Angular HttpClient times out it doesn't return a status, hence fake this to 0 to replicate the Aurelia HTTP client's behaviour
        if (this.httpErrorResponse.name === AngularHttpErrorResponse.angularHttpResponseTimeoutNameProperty) {
            return 0;
        }
        else {
            return this.httpErrorResponse.status;
        }
    }

    get StatusText() : string {
        // When the Angular HttpClient times out it doesn't return status text, hence fake this to a blank string to replicate the Aurelia HTTP client's behaviour
        if (this.httpErrorResponse.name === AngularHttpErrorResponse.angularHttpResponseTimeoutNameProperty) {
            return "";
        }
        else {
            return this.httpErrorResponse.statusText;
        }
    }
}