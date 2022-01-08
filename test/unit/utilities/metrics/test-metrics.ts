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

import { CountMetric } from '../../../../src/utilities/metrics/count-metric';
import { AmountMetric } from '../../../../src/utilities/metrics/amount-metric';
import { StatusMetric } from '../../../../src/utilities/metrics/status-metric';
import { IntervalMetric } from '../../../../src/utilities/metrics/interval-metric';

export class AddToCartButtonClickedMetric extends CountMetric {

    public constructor() {
        super();
        this.name = "AddToCartButtonClicked";
        this.description = "Represents the user clicking the 'Add to Cart' button on the product order screen."
    }
}

export class ItemsOrderedMetric extends AmountMetric {

    public constructor() {
        super();
        this.name = "ItemsOrdered";
        this.description = "Represents the number of items ordered through the product order screen."
    }
}

export class SearchResultsReturnedMetric extends StatusMetric {

    public constructor() {
        super();
        this.name = "SearchResultsReturned";
        this.description = "Represents the number items returned in a product search through the product order screen."
    }
}

export class TimeToPlaceOrderMetric extends IntervalMetric {

    public constructor() {
        super();
        this.name = "TimeToPlaceOrder";
        this.description = "Represents the time taken to place an order after clicking the 'Order' button in the product order screen."
    }
}

export class TimeViewingOrderScreenMetric extends IntervalMetric {

    public constructor() {
        super();
        this.name = "TimeViewingOrderScreen";
        this.description = "Represents the time that the user viewed the product order screen."
    }
}