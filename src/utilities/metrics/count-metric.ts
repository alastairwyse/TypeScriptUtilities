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

import { MetricBase } from './metric-base'

/**
 * @name CountMetric
 * @desc Base class for metrics representing an event, where the number of occurrences of that event may be accumulated and recorded.
 * @example Examples of derived classes could be metrics representing clicking of a UI button, or a message being send to a remote system.
 */
export abstract class CountMetric extends MetricBase {

}