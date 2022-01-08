/*
 * Copyright 2021 Alastair Wyse (https://github.com/alastairwyse/TypeScriptUtilities/)
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
 * @name MetricBase
 * @desc Base class for metrics.
 */
export abstract class MetricBase {

    /** The name of the metric. */
    protected name: string;
    /** A description of the metric, explaining what it measures and/or represents. */
    protected description: string;

    /**
     * @name Name
     * @returns {string} - The name of the metric.
     */
    public get Name() : string {

        return this.name;
    }

    /**
     * @name Description
     * @returns {string} - A description of the metric, explaining what it measures and/or represents.
     */
    public get Description() : string {

        return this.description;
    }
    
    protected constructor() {
        this.name = "";
        this.description = "";
    }
}
