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

/**
 * @name HttpUrlPrefixBuilderBase
 * @desc Base class for building URL prefixes (i.e. containing scheme, host, port, and path components) with HTTP-based schemes.
 */
export abstract class HttpUrlPrefixBuilderBase {

    static readonly minimumPortNumber: number = 1;
    static readonly maximumPortNumber: number = 65535;

    protected urlSchemeToStringMap: Map<UrlScheme, string>;
    protected scheme: UrlScheme;
    protected host: string;
    protected port: number;
    protected path: string;

    /**
     * @name Scheme
     * @returns The scheme component of the URL.
     */
    get Scheme(): UrlScheme {
        return this.scheme;
    } 

    /**
     * @name Host
     * @returns The host component of the URL.
     */
    get Host(): string {
        return this.host;
    }

    /**
     * @name Port
     * @returns The port component of the URL.
     */
    get Port(): number {
        return this.port;
    }

    /**
     * @name Path
     * @returns The path component of the URL.
     */
    get Path(): string {
        return this.path;
    }

    /**
     * @name Url
     * @returns The fully built/constructed URL prefix.
     */
    get UrlPrefix(): string {
        let urlPrefix: string;
        urlPrefix = <string>this.urlSchemeToStringMap.get(this.scheme);
        urlPrefix += "://";
        urlPrefix += this.host;
        urlPrefix += ":" + this.port.toString() + "/";
        urlPrefix += this.path;

        return encodeURI(urlPrefix);
    }

    /**
     * @desc Creates a HttpUrlPrefixBuilderBase.
     * @param {UrlScheme} scheme - The URL scheme to use in the URL prefix.
     * @param {string} host - The (unencoded) host within the URL prefix.
     * @param {number} port - The port within the URL prefix.
     * @param {string} path - The (unencoded) path within the URL prefix.
     */
    constructor(scheme: UrlScheme, host: string, port: number, path: string) {
        if (host.length == 0)
            throw new Error(`Parameter 'host' cannot be a blank string.`);
        if (port < HttpUrlPrefixBuilderBase.minimumPortNumber || port > HttpUrlPrefixBuilderBase.maximumPortNumber)
            throw new Error(`Parameter 'port' with value '${port}' must be between ${HttpUrlPrefixBuilderBase.minimumPortNumber} and ${HttpUrlPrefixBuilderBase.maximumPortNumber} inclusive.`);
        if (path.length > 0 && path[0] === "/")
            throw new Error(`Parameter 'path' with value '${path}' cannot start with a '/' character.`);

        this.urlSchemeToStringMap = new Map<UrlScheme, string>();
        this.urlSchemeToStringMap.set(UrlScheme.Http, "http");
        this.urlSchemeToStringMap.set(UrlScheme.Https, "https");

        // Check that all UrlScheme enum values are supported / handled
        for (let currentUrlScheme of Object.keys(UrlScheme)) {
            if (this.urlSchemeToStringMap.has(<UrlScheme>currentUrlScheme) === false)
                throw new Error(`Map 'urlSchemeToStringMap' does not contain an entry for UrlScheme '${currentUrlScheme}'.`);
        }

        this.scheme = scheme;
        this.host = host;
        this.port = port;
        this.path = path;
    }
}