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
import { IHttpResponse } from '../ihttp-client';

/**
 * @name AureliaHttpResponseMessage
 * @desc An implementation of IHttpResponse which wraps the Aurelia HttpResponseMessage class.
 */
export class AureliaHttpResponseMessage implements IHttpResponse {

    protected httpResponseMessage: HttpResponseMessage;

    /**
     * @name AureliaHttpResponseMessage
     * 
     * @param {HttpResponseMessage} httpResponseMessage - The Aurelia HttpResponseMessage to wrap.
     */ 
    constructor(httpResponseMessage: HttpResponseMessage) {

        this.httpResponseMessage = httpResponseMessage;
    }

    get Content() : any {
        return this.httpResponseMessage.content;
    }

    get MimeType() : string | null {
        return this.httpResponseMessage.mimeType;
    }

    get ResponseType() : string {
        return this.httpResponseMessage.responseType;
    }

    get StatusCode() : number {
        return this.httpResponseMessage.statusCode;
    }

    get StatusText() : string {
        return this.httpResponseMessage.statusText;
    }
}