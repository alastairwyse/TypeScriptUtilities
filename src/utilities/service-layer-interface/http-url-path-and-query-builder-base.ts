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

/**
 * @name HttpUrlPathAndQueryBuilderBase
 * @desc Base class for building URL path and query components.
 */
export abstract class HttpUrlPathAndQueryBuilderBase {

    protected path: string;
    protected queryParameters: Array<[ string, string ]>;

    /**
     * @name Path
     * @returns The path component of the URL.
     */
    get Path(): string {
        return this.path;
    }

    /**
     * @name QueryParameters
     * @returns The query parameters.
     */
    get QueryParameters(): Array<[ string, string ]> {
        return this.queryParameters;
    }

    /**
     * @name PathAndQuery
     * @returns The fully built/constructed URL path and query components.
     */
    get PathAndQuery(): string {
        let url: string = "";
        url += this.path;
        if (this.queryParameters.length > 0) {
            url += "?";
            for (let i = 0; i < this.queryParameters.length; i++) {
                url += this.queryParameters[i][0] + "=" + this.queryParameters[i][1];
                if (i != (this.queryParameters.length - 1))
                    url += "&";
            }
        }

        return encodeURI(url);
    }

    /**
     * @desc Creates a HttpUrlPathAndQueryBuilderBase.
     * 
     * @param {string} path - The path within the URL.
     * @param {Array<[ string, string ]>} queryParameters - The query parameters to include in the URL as a collection of name/value pairs.
     * 
     * @throws {Error} - Parameter 'path' cannot contain a trailling '/' character, when query parameters are included.
     */
    constructor(path: string, queryParameters: Array<[ string, string ]> = []) {
        if (path.length > 0 && path[path.length - 1] === "/" && queryParameters.length > 0)
            throw new Error(`Parameter 'path' with value '${path}' cannot contain a trailling '/' character, when query parameters are included.`);

        this.path = path;
        this.queryParameters = queryParameters;
    }
}