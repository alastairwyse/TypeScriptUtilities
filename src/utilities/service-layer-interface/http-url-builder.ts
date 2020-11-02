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

import { UrlScheme } from './url-scheme';
import { HttpUrlPrefixBuilderBase } from './http-url-prefix-builder-base';
import { HttpUrlPathAndQueryBuilderBase } from './http-url-path-and-query-builder-base';

class HttpUrlPrefixBuilder extends HttpUrlPrefixBuilderBase {
}

class HttpUrlPathAndQueryBuilder extends HttpUrlPathAndQueryBuilderBase {
}

/**
 * @name HttpUrlBuilder
 * @desc Builds URLs with HTTP-based schemes.
 */
export class HttpUrlBuilder {

    protected prefixBuilder: HttpUrlPrefixBuilder;
    protected pathAndQueryBuilder: HttpUrlPathAndQueryBuilderBase;

    /**
     * @name Url
     * @returns The fully built/constructed URL.
     */
    get Url(): string {
        return this.prefixBuilder.UrlPrefix + this.pathAndQueryBuilder.PathAndQuery;
    }

    /**
     * @desc Creates a HttpUrlBuilder.
     * 
     * @param {UrlScheme} scheme - The URL scheme to use in the URL.
     * @param {string} host - The host within the URL.
     * @param {number} port - The port within the URL.
     * @param {path} port - The path within the URL.
     * @param {Array<[ string, string ]>} queryParameters - The query parameters to include in the URL.
     */
    constructor(scheme: UrlScheme, host: string, port: number, path: string, queryParameters: Array<[ string, string ]> = []) {
        this.prefixBuilder = new HttpUrlPrefixBuilder(scheme, host, port, "");
        this.pathAndQueryBuilder = new HttpUrlPathAndQueryBuilder(path, queryParameters);
    }
}