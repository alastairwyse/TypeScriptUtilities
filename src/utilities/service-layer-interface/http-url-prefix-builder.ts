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

/**
 * @name HttpUrlPrefixBuilder
 * @desc Builds URL prefixes (i.e. containing scheme, host, port, and path components) with HTTP-based schemes.
 */
export class HttpUrlPrefixBuilder extends HttpUrlPrefixBuilderBase {

    /**
     * @desc Creates a HttpUrlPrefixBuilderBase.
     * 
     * @param {UrlScheme} scheme - The URL scheme to use in the URL prefix.
     * @param {string} host - The (unencoded) host within the URL prefix.
     * @param {number} port - The port within the URL prefix.
     * @param {string} path - The (unencoded) path within the URL prefix.
     * 
     * @throws {Error} - Parameter 'path' must end with a '/' if non-blank.
     */
    constructor(scheme: UrlScheme, host: string, port: number, path: string) {
        if (path.length > 0 && path[path.length - 1] !== "/")
            throw new Error(`Parameter 'path' with value '${path}' must end with a '/' if non-blank.`);

        super(scheme, host, port, path);
    }
}