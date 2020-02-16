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

import { HttpResponse } from '@angular/common/http';
import { IHttpResponse } from '../ihttp-client';
import { JavaScriptStringConstants } from '../../../common/javascript-string-constants';

/**
 * @name AngularHttpSuccessResponse
 * @desc An implementation of IHttpResponse which wraps the Angular HttpResponse class.
 */
export class AngularHttpSuccessResponse implements IHttpResponse {

    protected static readonly jsonHttpContentTypeString: string = "application/json";
    protected static readonly unknownHttpContentTypeString: string = "application/octet-stream";
    /** The value to return in the 'ResponseType' property in the case of success */
    protected static readonly responseTypeSuccessValue: string = "json";

    protected httpResponse: HttpResponse<any>;

    /**
     * @name AngularHttpSuccessResponse
     * 
     * @param {HttpResponse<any>} httpResponse - The Angular HttpResponse to wrap.
     */ 
    constructor(httpResponse: HttpResponse<any>) {

        this.httpResponse = httpResponse;
    }

    get Content() : any {
        return this.httpResponse.body;
    }

    get MimeType() : string | null {
        // Even though in the AngularHttpClient class we're using the HttpClient.request() overload which is supposed to return the body as a JSON object, 
        //   if the response contains just a number or boolean, the request() method will return a resolved (success) promise with a 200 status.  Hence 
        //   the below code checks whether the response body is an object, and if not returns a content type string indicating an unknown type.
        if (typeof(this.httpResponse.body) === JavaScriptStringConstants.ObjectType) {
            return AngularHttpSuccessResponse.jsonHttpContentTypeString;
        }
        else {
            return AngularHttpSuccessResponse.unknownHttpContentTypeString;
        }
    }

    get ResponseType() : string {
        return AngularHttpSuccessResponse.responseTypeSuccessValue;
    }

    get StatusCode() : number {
        return this.httpResponse.status;
    }

    get StatusText() : string {
        return this.httpResponse.statusText;
    }
}