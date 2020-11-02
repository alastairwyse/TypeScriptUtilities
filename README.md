TypeScriptUtilities
-------------------

Utility classes for TypeScript web applications.

## Contents

---

### :: ContainerObjectTypeValidator ::

TypeScript allows un-typed objects returned from API calls to be simply assigned to strongly typed objects.  E.g for the class StoreCatalogueItem...

```typescript
class StoreCatalogueItem {
    public displayName: string;
    public pricePerUnit: number;
    public inStock: boolean;
}
```

...the following code simulates reading a StoreCatalogueItem instance via the XMLHttpRequest object...

```typescript
let serializedObject: string = "{ \"displayName\": \"Onion\",  \"pricePerUnit\": \"abc\" }"; 
let untypedObject: any = JSON.parse(serializedObject);
let myCatalogueItem: StoreCatalogueItem = untypedObject;
```

Even though 'myCatalogueItem' is explicitly declared as a StoreCatalogueItem, 'untypedObject' is assigned to it at runtime when we're in JavaScript world, and none of the type-safe benfits of TypeScript are available.  Hence doing a console.log() on 'myCatalogueItem' results in...

    { displayName: "Onion", pricePerUnit: "abc" }

...'pricePerUnit' has been assigned a string even though it's defined as a number property, and worse still console.log(myCatalogueItem.inStock) gives...

    undefined

This can be problematic in large web applications, especially when you're consuming 3rd party APIs where you don't have control over the content and quality of the data you're consuming.  The issue above may not trigger an application error until a long time after the API is initially read, which can then lead to difficulty identifying where and how the object got into an invalid state (i.e. did it come from the API that way, or was it somehow changed by subsequent code)... which ultimately leads to code which is harder to debug and maintain.

The purpose of the [ContainerObjectTypeValidator](src/utilities/data-validation/container-object-type-validator.ts) class is to provide runtime type validation and conversion of untyped ('any') objects, based on a succint class type definition.  Using the class to validate and convert un-typed objects obtained at runtime (especially from API/service calls) allows...
* Identifying incorrectly-typed and missing data at the perimeter of your application before objects are used internally 
* Throwing clear, detailed errors as soon as any incorrectly-typed and missing data issues are detected

ContainerObjectTypeValidator might also be useful when consuming APIs endpoints with a lot of unused properties/data.  E.g. an endpoint returning a company employee might include basic personal information, location and department info, boss and subordinate details, Active Directory or network properties, etc, etc.  If you only need to consume a small subset of this data, ContainerObjectTypeValidator can be used to validate and retrieve a limited number of fields/properties (i.e. it will only attempt to validate and convert properties defined in the local container/model class)... i.e. only the fields/properties you actually need.

### In Use

The below examples and associated container/model class definitions are available in file [samples.ts](src/samples/samples.ts).

#### Validating and converting Javascript basic types and dates...

```typescript
let containerObjectTypeValidator: ContainerObjectTypeValidator = new ContainerObjectTypeValidator();
let returnedNumber: number = containerObjectTypeValidator.ConvertNumber("123");
let returnedBoolean: boolean = containerObjectTypeValidator.ConvertBoolean("false");
let returnedDate: Date = containerObjectTypeValidator.ConvertDate("2019-11-14 11:44:00");
console.log(returnedNumber);
console.log(returnedBoolean);
console.log(returnedDate);
```

...outputs...

    123 
    false 
    Thu Nov 14 2019 11:44:00 GMT+0900 

#### Arrays of Javascript basic types and dates...

```typescript
let untypedNumberArray = [ "123", "456", "789" ];
let returnedNumberArray: Array<number> = containerObjectTypeValidator.ValidateAndConvertBasicTypeArray<number>(untypedNumberArray, JavascriptBasicType.Number);
let untypedBooleanArray = [ "true", "false", "true" ];
let returnedBooleanArray: Array<boolean> = containerObjectTypeValidator.ValidateAndConvertBasicTypeArray<boolean>(untypedBooleanArray, JavascriptBasicType.Boolean);
let untypedDateArray = [ "2017-11-12", "2018-10-13", "2019-09-14" ];
let returnedDateArray: Array<Date> = containerObjectTypeValidator.ValidateAndConvertBasicTypeArray<Date>(untypedDateArray, JavascriptBasicType.Date);
console.log(returnedNumberArray);
console.log(returnedBooleanArray);
console.log(returnedDateArray);
```
...outputs...

    [ 123, 456, 789 ]
    [ true, false, true ]
    [ Sun Nov 12 2017 09:00:00 GMT+0900, Sat Oct 13 2018 09:00:00 GMT+0900, Sat Sep 14 2019 09:00:00 GMT+0900 ]

#### Validating TypeScript enums...

Enums are tricky because whilst you can use the 'keyof typeof' statement to retrieve the values of a specified enum at runtime, I haven't found a way to do the same for generic enum type variables (i.e. the 'T' in a method signature like ConvertEnum&lt;T&gt;()).  Hence ContainerObjectTypeValidator has a method ConvertEnum() defined as follows...

```typescript
public ConvertEnum(untypedEnumValue: any, enumValuesAndMappings: EnumTypeConversionDefinition) : string
```

...which requires the valid enum values to be provided in parameter 'enumValuesAndMappings'.  This parameter is a TypeScript [Union](https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types) which can be either...
* an Array&lt;string&gt; where the value of 'untypedEnumValue' is expected to exactly match the enum value defined in TypeScript, OR
* an Array&lt;[ string, string ]&gt; where the value of 'untypedEnumValue' needs to be mapped to the enum value defined in TypeScript (see example below)

```typescript
let untypedEnum = "Pack";
let returnedEnum = <UnitOfSale>containerObjectTypeValidator.ConvertEnum(untypedEnum, [ "Bunch", "Piece", "Kilogram", "Pack" ]);
console.log(returnedEnum);
// Outputs...
//   Pack
```

```typescript
untypedEnum = "1";
returnedEnum = <UnitOfSale>containerObjectTypeValidator.ConvertEnum(untypedEnum, [ [ "0", "Bunch" ], [ "1", "Piece" ], [ "2", "Kilogram" ], [ "3", "Pack" ] ]);
console.log(returnedEnum);
// Outputs...
//   Piece
```

#### Validating and converting simple container/model objects...

```typescript
let untypedObject: any = {
    DisplayName: "Onion", 
    PricePerUnit: 380, 
    Unit: "Kilogram"
};

let storeCatalogueItemObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(
    <Iterable<[string, TypeConversionDefinition]>>
    [
        [ "DisplayName", JavascriptBasicType.String ], 
        [ "PricePerUnit", JavascriptBasicType.Number ], 
        [ "Unit", 
            [ 
                "Bunch", "Piece", "Kilogram", "Pack"  
            ] 
        ], 
    ]
);

let returnedStoreCatalogueItem: StoreCatalogueItem = containerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItem>(
    untypedObject, 
    StoreCatalogueItem, 
    storeCatalogueItemObjectTypeConversionDefinition
);
console.log(returnedStoreCatalogueItem);  
```

...outputs...

    {
        displayName: "Onion"
        pricePerUnit: 380
        unit: "Kilogram"
    }

'TypeConversionDefinition' is a type alias for a union of 3 different types.  Each of those types represents a different validation/conversion behaviour as below...

<table>
  <tr>
    <td><b>Type</b></td>
    <td><b>Validation/Conversion Behaviour</b></td>
  </tr>
  <tr>
    <td valign="top">JavascriptBasicType (enum)</td>
    <td>Uses internal methods to validate and convert to a basic Javascript type (string, number, boolean, or Date)</td>
  </tr>
  <tr>
    <td valign="top">ITypedObjectConversionFunction<any></td>
    <td>This is a <a href="https://www.typescriptlang.org/docs/handbook/interfaces.html#function-types">function type interface</a> which is called/executed during the validation conversion (i.e. can be used to define conversion for objects, objects within objects, etc...)</td>
  </tr>
  <tr>
    <td valign="top">Array&lt;string | [ string, string ]&gt;</td>
    <td>Treats the specified properties as a TypeScript enum (see example above).  Note this is type-aliased as 'EnumTypeConversionDefinition'.</td>
  </tr>
</table>

#### Failure to valdiate/convert throws a descriptive and detailed error...

```typescript
untypedObject = {
    DisplayName: "Onion", 
    PricePerUnit: "abc",  // Error - not a number
    Unit: "Kilogram"
};
returnedStoreCatalogueItem = containerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItem>(
    untypedObject, 
    StoreCatalogueItem, 
    storeCatalogueItemObjectTypeConversionDefinition
);
```

...throws error...

    'Error attempting to validate and convert property 'PricePerUnit':  Parameter 'untypedNumber' with value 'abc' could not be converted to a number.'

```typescript
untypedObject = {
    DisplayName: "Onion", 
    PricePerUnit: 380, 
    Unit: "Pound"  // Error - not a valid enum value
};
returnedStoreCatalogueItem = containerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItem>(
    untypedObject, 
    StoreCatalogueItem, 
    storeCatalogueItemObjectTypeConversionDefinition
);
```

...throws error...

    'Error attempting to validate and convert property 'Unit':  Parameter 'untypedEnumValue' with value 'Pound' could not be matched to an enum mapping value in 'Bunch,Piece,Kilogram,Pack'.'

#### Fields in the local class definition can be excluded from validation/conversion...

```typescript
storeCatalogueItemObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(
    // 'propertyDefinitions' parameter
    <Iterable<[string, TypeConversionDefinition]>>
    [
        [ "DisplayName", JavascriptBasicType.String ], 
        [ "PricePerUnit", JavascriptBasicType.Number ], 
        [ "Unit", 
            [ 
                "Bunch", "Piece", "Kilogram", "Pack"  
            ] 
        ], 
    ], 
    // 'excludeProperties' parameter
    <Array<string>>[
        "PricePerUnit"
    ]
);

untypedObject = {
    DisplayName: "Onion", 
    PricePerUnit: 380, 
    Unit: "Kilogram" 
};
returnedStoreCatalogueItem = containerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItem>(
    untypedObject, 
    StoreCatalogueItem, 
    storeCatalogueItemObjectTypeConversionDefinition
);
console.log(returnedStoreCatalogueItem);  
```

...outputs ('pricePerUnit' takes the default or construction value)...

    {
        displayName: "Onion"
        pricePerUnit: 0
        unit: "Kilogram"
    }

#### Validating and converting arrays of objects...

```typescript
let untypedArray: any = [
    {
        DisplayName: "Onion", 
        PricePerUnit: 380, 
        Unit: "Kilogram"
    }, 
    {
        DisplayName: "Avocado", 
        PricePerUnit: 190, 
        Unit: "Piece"
    }, 
    {
        DisplayName: "Strawberry", 
        PricePerUnit: 490, 
        Unit: "Pack"
    }
];

storeCatalogueItemObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(
<Iterable<[string, TypeConversionDefinition]>>
[
    [ "DisplayName", JavascriptBasicType.String ], 
    [ "PricePerUnit", JavascriptBasicType.Number ], 
    [ "Unit", 
        [ 
            "Bunch", "Piece", "Kilogram", "Pack"  
        ] 
    ], 
]);

let returnedArray: Array<StoreCatalogueItem> = containerObjectTypeValidator.ValidateAndConvertObjectArray<StoreCatalogueItem>(
    untypedArray, 
    StoreCatalogueItem, 
    storeCatalogueItemObjectTypeConversionDefinition
);
console.log(returnedArray); 
```

...outputs...

    [
        {
            "displayName": "Onion",
            "pricePerUnit": 380,
            "unit": "Kilogram"
        },
        {
            "displayName": "Avocado",
            "pricePerUnit": 190,
            "unit": "Piece"
        },
        {
            "displayName": "Strawberry",
            "pricePerUnit": 490,
            "unit": "Pack"
        }
    ]

#### Validating and converting objects nested within objects...

E.g. for the Stock class which contains nested class StockPrice (again see [samples.ts](src/samples.ts) for their definitions)...

```typescript
untypedObject = 
{
    "CompanyName": "BHP Billiton Limited",
    "Ticker": "BHP.AX",
    "Prices": [
        {
            "Date": "2019-09-24T00:00:00",
            "Price": "37.5"
        },
        {
            "Date": "2019-09-25T00:00:00",
            "Price": "36.42"
        },
        {
            "Date": "2019-09-26T00:00:00",
            "Price": "36.82"
        },
        {
            "Date": "2019-09-27T00:00:00",
            "Price": "36.5"
        },
        {
            "Date": "2019-09-30T00:00:00",
            "Price": "36.92"
        }
    ]
};

let stockTypeConversionDefinition = new ObjectTypeConversionDefinition(
    // Parameter 'propertyDefinitions'
    <Iterable<[string, TypeConversionDefinition]>>
    [
        [ "CompanyName", JavascriptBasicType.String ], 
        [ "Ticker", JavascriptBasicType.String ],
        [ "Prices", <ITypedObjectConversionFunction<Array<StockPrice>>>((untypedObject: any) : Array<StockPrice> => {
                        let stockPriceTypeConversionDefinition = new ObjectTypeConversionDefinition(
                            <Iterable<[string, TypeConversionDefinition]>>
                            [
                                [ "Date", JavascriptBasicType.Date ], 
                                [ "Price", JavascriptBasicType.Number ]
                            ]
                        );
                        return containerObjectTypeValidator.ValidateAndConvertObjectArray<StockPrice>(untypedObject, StockPrice, stockPriceTypeConversionDefinition);
                    })
        ] 
    ]
);

let returnedStock: Stock = containerObjectTypeValidator.ValidateAndConvertObject<Stock>(
    untypedObject, 
    Stock, 
    stockTypeConversionDefinition
);
console.log(returnedStock);  
```

...outputs...

    {
        "companyName": "BHP Billiton Limited",
        "ticker": "BHP.AX",
        "prices": [
            {
                "date": "2019-09-23T15:00:00.000Z",
                "price": 37.5
            },
            {
                "date": "2019-09-24T15:00:00.000Z",
                "price": 36.42
            },
            {
                "date": "2019-09-25T15:00:00.000Z",
                "price": 36.82
            },
            {
                "date": "2019-09-26T15:00:00.000Z",
                "price": 36.5
            },
            {
                "date": "2019-09-29T15:00:00.000Z",
                "price": 36.92
            }
        ]
    }

#### Validating and converting nullable types...

TypeScript [nullable types](https://www.typescriptlang.org/docs/handbook/advanced-types.html#nullable-types) are supported.  To ensure proper compatability with the 'strictNullChecks' compiler option, validation/conversion of nullable JavaScript basic types is performed by separate methods to the equivalent non-nullable types (e.g. ConvertNullableNumber(), ConvertNullableBoolean(), etc...)...

```typescript
let inputValue: any = null;
let returnedNullableNumber: number | null = containerObjectTypeValidator.ConvertNullableNumber(inputValue);
console.log(returnedNullableNumber);
// Outputs...
//   null 
inputValue = "123";
returnedNullableNumber = containerObjectTypeValidator.ConvertNullableNumber(inputValue);
console.log(returnedNullableNumber);
// Outputs...
//   123 

inputValue = null;
let returnedNullableDate: Date | null = containerObjectTypeValidator.ConvertNullableDate(inputValue);
console.log(returnedNullableDate);
// Outputs...
//   null 
inputValue = "2019-10-21";
returnedNullableDate = containerObjectTypeValidator.ConvertNullableDate(inputValue);
console.log(returnedNullableDate);
// Outputs...
//   Date Mon Oct 21 2019 09:00:00 GMT+0900
```

#### Validating and converting arrays of nullable types...

```typescript
let inputArray: Array<any> = [ "true", null, "false" ];
let returnedNullableBooleanArray: Array<boolean | null> = containerObjectTypeValidator.ValidateAndConvertBasicNullableTypeArray<boolean>(inputArray, JavascriptBasicType.Boolean);
console.log(returnedNullableBooleanArray);
// Outputs...
//   [ true, null, false ]

inputArray = [ "Red", null, null, "Black" ];
let returnedNullableStringArray: Array<string | null> = containerObjectTypeValidator.ValidateAndConvertBasicNullableTypeArray<string>(inputArray, JavascriptBasicType.String);
console.log(returnedNullableStringArray);
// Outputs...
//   [ "Red", null, null, "Black" ]
```

#### Handling nullable object properties...

The ObjectTypeConversionDefinition class can support object properties which may be set to null, via the 'nullableProperties' parameter on its constructor...

```typescript
storeCatalogueItemObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(
    // 'propertyDefinitions' parameter
    <Iterable<[string, TypeConversionDefinition]>>
    [
        [ "DisplayName", JavascriptBasicType.String ], 
        [ "PricePerUnit", JavascriptBasicType.Number ], 
        [ "Unit", 
            [ 
                "Bunch", "Piece", "Kilogram", "Pack"  
            ] 
        ], 
        [ "DateAdded", JavascriptBasicType.Date ]
    ], 
    // 'excludeProperties' parameter
    <Array<string>>[], 
    // 'nullableProperties' parameter
    <Array<string>>[
        "DateAdded"
    ]
);

untypedObject = {
    DisplayName: "Onion", 
    PricePerUnit: 380, 
    Unit: "Kilogram" , 
    DateAdded: null
};

let returnedStoreCatalogueItem2: StoreCatalogueItemWithNullableProperty = containerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItemWithNullableProperty>(
    untypedObject, 
    StoreCatalogueItemWithNullableProperty, 
    storeCatalogueItemObjectTypeConversionDefinition
);
```

...outputs...

    {
        "displayName": "Onion",
        "pricePerUnit": 380,
        "unit": "Kilogram",
        "dateAdded": null
    }

#### Including the type validation/conversion definition within a container/model class...

If you consider that the definition of a container/model class, and the type validation rules for that class to be concerns that can be mixed together, you can include an instance of ObjectTypeConversionDefinition as a static property within your container/model class...

```typescript
class StockWithTypeConversionDefinition {

    public static TypeConversionDefinition = new ObjectTypeConversionDefinition(
        // Parameter 'propertyDefinitions'
        <Iterable<[string, TypeConversionDefinition]>>
        [
            [ "CompanyName", JavascriptBasicType.String ], 
            [ "Ticker", JavascriptBasicType.String ],
            [ "Prices", <ITypedObjectConversionFunction<Array<StockPrice>>>((untypedObject: any) : Array<StockPrice> => {
                            let stockPriceTypeConversionDefinition = new ObjectTypeConversionDefinition(
                                <Iterable<[string, TypeConversionDefinition]>>
                                [
                                    [ "Date", JavascriptBasicType.Date ], 
                                    [ "Price", JavascriptBasicType.Number ]
                                ]
                            );
                            return new ContainerObjectTypeValidator().ValidateAndConvertObjectArray<StockPrice>(untypedObject, StockPrice, stockPriceTypeConversionDefinition);
                        })
            ] 
        ]
    );

    protected companyName: string;
    protected ticker: string;
    protected prices: Array<StockPrice>
    
    get CompanyName(): string {
        return this.companyName;
    }

    set CompanyName(value: string) {
        this.companyName = value;
    }

    get Ticker(): string {
        return this.ticker;
    }

    set Ticker(value: string) {
        this.ticker = value;
    }

    get Prices(): Array<StockPrice> {
        return this.prices;
    }

    set Prices(value: Array<StockPrice>) {
        this.prices = value;
    }
}
```

...this makes the code to perform the type validation/conversion more succinct...

```typescript
let returnedStock2: StockWithTypeConversionDefinition = containerObjectTypeValidator.ValidateAndConvertObject<StockWithTypeConversionDefinition>(
    untypedObject, 
    StockWithTypeConversionDefinition, 
    StockWithTypeConversionDefinition.TypeConversionDefinition
);
console.log(returnedStock2); 
```

---

### :: ServiceLayerInterface ::

The original goal of the [ServiceLayerInterface](src/utilities/service-layer-interface/service-layer-interface.ts) class was to create a wrapper around [Aurelia's](https://aurelia.io/) [HttpClient](https://aurelia.io/docs/plugins/http-services#aurelia-http-client) class for calling REST-based application service layers which return JSON content.  The Aurelia HttpClient is quite good, and definitely more immediately useable than the XMLHttpRequest object.  However, one area where it could be better is with error handling... different TCP/HTTP errors are expressed through different combinations of the 'responseType', 'statusCode', and 'isSuccess' properties of the returned HttpResponseMessage class.  The ServiceLayerInterface class consolidates all the possible error scenarios resulting from a call to a service layer into enum ServiceCallErrorType, and returns this along with a detailed error message.  The ServiceCallErrorType enum values (and associated meanings) are...

<table>
  <tr>
    <td><b>Enum Value</b></td>
    <td><b>Meaning</b></td>
  </tr>
  <tr>
    <td valign="top">ConnectionFailed</td>
    <td>A connection could not be established (e.g. because of incorrect URL, or specified port closed)</td>
  </tr>
  <tr>
    <td valign="top">Timeout</td>
    <td>A connection could not be established or response was not received within the specified timeout period</td>
  </tr>
  <tr>
    <td valign="top">NonSuccessHttpStatus</td>
    <td>The service returned a status indicating non-success</td>
  </tr>
  <tr>
    <td valign="top">UnhandledHttpContentType</td>
    <td>The call returned an unhandled HTTP content type</td>
  </tr>
  <tr>
    <td valign="top">UnknownError</td>
    <td>An unknown or unexpected error occurred</td>
  </tr>
</table>

Functionaliy has since been enhanced to optionally wrap [Angular's](https://angular.io/) [HttpClient](https://angular.io/api/common/http/HttpClient).  

### In Use

The below examples were created with the [AureliaHttpClient wrapper](src/utilities/service-layer-interface/implementations/aurelia-http-client.ts), but the results and contents of ServiceLayerCallResult class are the same when using the equivalent [AngularHttpClient wrapper](src/utilities/service-layer-interface/implementations/angular-http-client.ts).  Both these wrapper classes implement interface IHttpClient.  Testing was performed against versions 1.3.1 and 8.2.14 of the underlying [Aurelia](https://aurelia.io/) [HttpClient](https://aurelia.io/docs/plugins/http-services#aurelia-http-client) and Angular [Angular](https://angular.io/) [HttpClients](https://angular.io/api/common/http/HttpClient) respectively. 


#### Success case...

```typescript
// Create the prefix/base URL for service layer calls
let urlPrefix: HttpUrlPrefixBuilder = new HttpUrlPrefixBuilder(UrlScheme.Http, "localhost", 51499, "api/");
// Create the Aurelia HttpClient wrapper
let aureliaHttpClient = new AureliaHttpClient();
let serviceLayerInterface: ServiceLayerInterface = new ServiceLayerInterface(
    urlPrefix, 
    2000,  // default timeout
    aureliaHttpClient
);

serviceLayerInterface.CallServiceLayer(
    new HttpUrlPathAndQueryBuilder("CatalogueItems/"),  // URL suffix
    HttpRequestMethod.Get,  // HTTP method
    null,  // message body
    HttpContentType.Application_Json,  // message body content type
    5000  // timeout (overrides the default if specified)
)
.then((result: ServiceLayerCallResult) => {
    console.log("Call was successful...");
    console.log(result.Content);
})
.catch((result: ServiceLayerCallResult) => {
    console.log("Call failed...");
    console.log("Error type: " + result.ErrorType);
    console.log("Error message: " + result.SystemErrorMessage);
});
```

...outputs...

    Call was successful...
    {
        "DisplayName": "Bananas",
        "PricePerUnit": 450,
        "Unit": 2
    },
    {
        "DisplayName": "Carrots",
        "PricePerUnit": 200,
        "Unit": 2
    },
    {
        "DisplayName": "Watermelons",
        "PricePerUnit": 450,
        "Unit": 1
    },
    (etc...)

#### Failure case (incorrect URL suffix resulting in 404)...

```typescript
serviceLayerInterface.CallServiceLayer(
    new HttpUrlPathAndQueryBuilder("CatalogueItemsz/"),  // URL suffix (incorrect)
    HttpRequestMethod.Get,  // HTTP method
    null,  // message body
    HttpContentType.Application_Json,  // message body content type
    5000  // timeout (overrides the default if specified)
)
.then((result: ServiceLayerCallResult) => {
    console.log("Call was successful...");
    console.log(result.Content);
})
.catch((result: ServiceLayerCallResult) => {
    console.log("Call failed...");
    console.log("Error type: " + result.ErrorType);
    console.log("Error message: " + result.SystemErrorMessage);
});
```

...outputs...

    Call failed...
    Error type: NonSuccessHttpStatus
    Error message: Response returned non-success HTTP status code 404 indicating 'Not Found' status calling URL 'http://localhost:51499/api/CatalogueItemsz/'.

#### Failure case (incorrect TCP port resulting in failure to connect)...

```typescript
// Create the prefix/base URL for service layer calls (with wrong port)
let urlPrefix: HttpUrlPrefixBuilder = new HttpUrlPrefixBuilder(UrlScheme.Http, "localhost", 51490, "api/");
// Create the Aurelia HttpClient wrapper
let aureliaHttpClient = new AureliaHttpClient();
let serviceLayerInterface: ServiceLayerInterface = new ServiceLayerInterface(
    urlPrefix, 
    2000,  // default timeout
    aureliaHttpClient
);

serviceLayerInterface.CallServiceLayer(
    new HttpUrlPathAndQueryBuilder("CatalogueItems/"),  // URL suffix
    HttpRequestMethod.Get,  // HTTP method
    null,  // message body
    HttpContentType.Application_Json,  // message body content type
    5000  // timeout (overrides the default if specified)
)
.then((result: ServiceLayerCallResult) => {
    console.log("Call was successful...");
    console.log(result.Content);
})
.catch((result: ServiceLayerCallResult) => {
    console.log("Call failed...");
    console.log("Error type: " + result.ErrorType);
    console.log("Error message: " + result.SystemErrorMessage);
});
```

...outputs...

    Call failed...
    Error type: ConnectionFailed 
    Error message: Failed to connect to URL 'http://localhost:51490/api/CatalogueItems/'.

#### Calling CallServiceLayer() using async / await and try / catch...

If the actual HTTP client within the IHttpClient implementation throws errors on failure, CallServiceLayer() can be called from an asynchronous function using standard try / catch blocks. In this case the catch block's parameter will be populated with a ServiceLayerCallResult class (below example uses the [AngularHttpClient](src/utilities/service-layer-interface/implementations/angular-http-client.ts) with does throw an error on failure)...

```typescript
let result: ServiceLayerCallResult;
try { 
    result = await this.serviceLayerInterface.CallServiceLayer
    (
        new HttpUrlPathAndQueryBuilder("CatalogueItemz"), 
        HttpRequestMethod.Get
    );
}
catch (e) {
    result = <ServiceLayerCallResult>(e);
    console.log("Call failed...");
    console.log("Error type: " + result.ErrorType);
    console.log("Error message: " + result.SystemErrorMessage);
    throw new Error(result.SystemErrorMessage);
}

console.log("Call was successful...");
console.log(result.Content);
```

#### Setup for Angular...

Setup for Angular is similar to the Aurelia example above, but requires creating an instance of the [AngularHttpClient](src/utilities/service-layer-interface/implementations/angular-http-client.ts) class.  The below 'ServiceLayerService' class is an [Angular service](https://angular.io/tutorial/toh-pt4)...

```typescript
@Injectable({
    providedIn: 'root'
})
export class ServiceLayerService {

    protected serviceLayerInterface: ServiceLayerInterface;

    constructor(private httpClient: HttpClient) { 

        let httpUrlPrefixBuilder = new HttpUrlPrefixBuilder(UrlScheme.Http, "localhost", 51499, "api/");
        // The 'httpClient' parameter comes from Angular dependency injection (https://angular.io/guide/dependency-injection)
        let angularHttpClient = new AngularHttpClient(httpClient);
        this.serviceLayerInterface = new ServiceLayerInterface(httpUrlPrefixBuilder, 5000, angularHttpClient);
    }
```

#### Contents of the ServiceLayerCallResult class...

The CallServiceLayer() method returns a Promise which resolves to a ServiceLayerCallResult class which contains details of the results of the service layer call...

```typescript
serviceLayerInterface.CallServiceLayer(
    new HttpUrlPathAndQueryBuilder("CatalogueItemsz/"),  // URL suffix (incorrect)
    HttpRequestMethod.Get,  // HTTP method
    null,  // message body
    HttpContentType.Application_Json,  // message body content type
    5000  // timeout (overrides the default if specified)
)
.then((result: ServiceLayerCallResult) => {
    console.log("Call was successful...");
    console.log(result.Content);
})
.catch((result: ServiceLayerCallResult) => {
    console.log("Contents of the ServiceLayerCallResult class...");
    console.log(result);
});
```

...outputs...

    Contents of the ServiceLayerCallResult class...
    {
        "content": "",
        "contentMimeType": null,
        "returnedHttpStatusCode": 404,
        "returnedHttpStatusText": "Not Found",
        "success": false,
        "errorType": "NonSuccessHttpStatus",
        "systemErrorMessage": "Response returned non-success HTTP status code 404 indicating 'Not Found' status calling URL 'http://localhost:51499/api/CatalogueItemsz/'."
    }

#### Defining a base/prefix URL for the service layer...

A base/prefix URL for the service layer can be defined on the ServiceLayerInterface constructor via the 'serviceLayerBaseUrl' parameter.  The CallServiceLayer() method accepts a 'urlBuider' parameter which can be either a [HttpUrlPathAndQueryBuilder](src/utilities/service-layer-interface/http-url-path-and-query-builder.ts) object (which represents a path suffix and optional query parameters which are appended to the base URL), or a [HttpUrlBuilder](src/utilities/service-layer-interface/http-url-builder.ts) object which contains a full URL and will override the base/prefix URL set on the constructor.

#### The HttpUrlBuilder, HttpUrlPathAndQueryBuilder, and HttpUrlPrefixBuilder classes...

These classes are losely based on the [UriBuilder](https://docs.microsoft.com/en-us/dotnet/api/system.uribuilder?view=netframework-4.8) class in .NET, and place more structure around the creation of URLs... with the goal being to reduce typos and resulting runtime errors which can occur when URLs are created and concatenated as simple unstructured strings.

---

### :: Buffering ::

The [buffering](src/utilities/buffering/) folder contains classes which implement basic buffering functionality... i.e. to store data, and then take some periodic action to process the data and clear the store (e.g. store log data and periodically send it to an API endpoint).  The classes are designed to be as extensible as possible, so both the processing action (a buffer 'flush') and the timing of the action can be custom-defined by implementing interfaces... [IBufferFlushAction](src/utilities/buffering/ibuffer-flush-action.ts) for the action, and [IBufferFlushStrategy](src/utilities/buffering/ibuffer-flush-strategy.ts) for the timimg.

### Classes

#### Buffer<T>

This is the top level class which implements the buffer.  Generic type variable 'T' represents the type of data which should be stored in the buffer.  The class exposes public methods to Add() items to the buffer and to manually Flush() the buffer, aswell as a getter for the number of items stored.  Its constructor requires implementations of a flush strategy (i.e. when to flush), and a flush action (i.e. what to do).

#### SizeLimitedBufferFlushStrategy<T>

This is a buffer flush strategy which flushes the buffer each time the number of buffered items reaches a specified threshold.  E.g. in a scenario where a Buffer<T> is used to send logging or metric data to an API endpoint, SizeLimitedBufferFlushStrategy could be used to ensure that the size of the data collection sent to the API (i.e. equivalent to the buffer contents) is consistent between calls.  Generic type variable 'T' should be the same as for the Buffer<T> instance into which the instance of this class is injected.

#### TimedLoopBufferFlushStrategy<T> 

This is a buffer flush strategy which flushes the buffer at a regular, specified time interval using JavaScript's setTimeout() method.   An appropriate use case might be where a Buffer<T> is used to send logging or metric data to an API endpoint, and you want to ensure that data is sent on a regular basis (e.g. even in the absence of any user interaction or activity).  Generic type variable 'T' should be the same as for the Buffer<T> instance into which the instance of this class is injected.

#### BufferFlushStrategyBase<T>

This is a base class which can be used for custom implementations of IBufferFlushStrategy<T>.

### In Use

The Buffer<T> class requires an implementation of IBufferFlushAction<T> in its constructor.  In a TypeScript web application, a typical use for the Buffer class would be to write buffered data to an API endpoint, or potentially write buffered information to the console.  The sample implementation below (from [samples.ts](src/samples/samples.ts)) writes buffered strings to the console...

```typescript
class WriteToConsoleBufferFlushAction implements IBufferFlushAction<string> {

    /** @inheritdoc */
    Flush(bufferContents: IterableIterator<string>): void {

        for (let currentItem of Array.from(bufferContents)) {
            console.log(currentItem);
        }
    }
}
```

... this class can then be instantiated, and that instance injected into a Buffer<T> instance and used as follows...

```typescript
// Create the Buffer instance
let bufferFlushStrategy = new SizeLimitedBufferFlushStrategy(5);
let bufferFlushAction = new WriteToConsoleBufferFlushAction();
let buffer = new Buffer<string>(bufferFlushStrategy, bufferFlushAction);

// Buffer some data...
buffer.Add("The");
buffer.Add("quick");
buffer.Add("brown");
buffer.Add("fox");
setTimeout(() => { buffer.Add("jumps"); }, 5000);
```

...the following is written to the console on the fifth call to Add()...

    The
    quick
    brown
    fox
    jumps

---

### :: Logging ::

The [logging](src/utilities/logging/) folder contains classes which implement logging for web applications... arguably slightly more comprehensive and structured than those found in many JavaScript frameworks.  The ILogger interface is central to the logging functionality, and defines a single Log() method for capturing log information and events.

### Classes

#### LoggerBase

A base class which can be used for custom implementations of the ILogger interface.  Contains utility methods for creating and appending data to log entries.  Is used by both the ConsoleLogger and BufferedLogger classes.

The below table explains the constructor parameters (which are also used by the ConsoleLogger and BufferedLogger classes)...

<table>
  <tr>
    <td><b>Name</b></td>
    <td><b>Type</b></td>
    <td><b>Description</b></td>
  </tr>
  <tr>
    <td valign="top">minimumLogLevel</td>
    <td valign="top">LogLevel</td>
    <td>The minimum level of log entries to write.  Log entries with a level of importance lower than this will not be written.</td>
  </tr>
  <tr>
    <td valign="top">sessionIdOrProvider</td>
    <td valign="top">string | ISessionIdProvider</td>
    <td>A unique session id to include in the log entry, or an implementation of interface ISessionIdProvider, to provide unique session ids.  A class UuidSessionIdProvider is included (implementing ISessionIdProvider) to generate UUID session ids.</td>
  </tr>
  <tr>
    <td valign="top">separatorString</td>
    <td valign="top">string</td>
    <td>The string to insert between the components (session id, date/time, log text, etc...) within a log entry. Set to the pipe character ('|') by default.</td>
  </tr>
  <tr>
    <td valign="top">dateTimeFormat</td>
    <td valign="top">string</td>
    <td>A Moment.js-compatible format string to use to format dates and times within the log entries.  Set to 'YYYY-MM-DDTHH:mm:ss.SSSZ' by default.</td>
  </tr>
  <tr>
    <td valign="top">userId</td>
    <td valign="top">string</td>
    <td>Optional, and can be set to an id for the user in the current session, for authenticated web applications where the current user is known.</td>
  </tr>
</table>

#### ConsoleLogger

A basic implementation of ILogger which writes log entries to the system/browser console.

#### BufferedLogger

An ILogger which utilises the buffering functionality (described above) to buffer log entries before processing them.  The classes uses an underlying Buffer<T>, so [IBufferFlushAction<string>](src/utilities/buffering/ibuffer-flush-action.ts) and [IBufferFlushStrategy<string>](src/utilities/buffering/ibuffer-flush-strategy.ts) implementations must be set on the constructor to define when and how the buffer should be processed.  As with Buffer<T> either the [TimedLoopBufferFlushStrategy](src/utilities/buffering/timed-loop-buffer-flush-strategy.ts) or [SizeLimitedBufferFlushStrategy](src/utilities/buffering/size-limited-buffer-flush-strategy.ts) buffer strategies can be used (or a custom strategy defined).  A typical use of this class would be to send client-side logs to an API endpoint, but only sending on a periodic basis.

#### CompositeLogger

This class implements ILogger, and broadcasts/distributes Log() method calls to multiple underlying implementations of ILogger.  Basically it can be used to distribute log events to multiple ILoggers... e.g. to both the local system/browser console, and a server-side API endpoint.

### In Use

The BufferedLogger class requires an implementation of IBufferFlushAction<string> in its constructor.  The [samples.ts](src/samples/samples.ts) file includes a sample implementation of this interface which writes log entries to a sample API endpoint...

```typescript
class LogWriterBufferFlushAction implements IBufferFlushAction<string> {

    protected serviceLayerInterface: ServiceLayerInterface;

    constructor() {
        this.serviceLayerInterface = new ServiceLayerInterface(
            new HttpUrlPrefixBuilder(UrlScheme.Http, "localhost", 51499, "api/"), 
            10000,
            new AureliaHttpClient()
        );
    }

    /** @inheritdoc */
    Flush(bufferContents: IterableIterator<string>): void {

        this.serviceLayerInterface.CallServiceLayer(
            new HttpUrlPathAndQueryBuilder("UiLogs/"),  
            HttpRequestMethod.Put, 
            // Body of service layer call is passed the buffer contents
            Array.from(bufferContents), 
            HttpContentType.Application_Json, 
        )
        .catch((serviceLayerCallResult: ServiceLayerCallResult) => {
            throw new Error(serviceLayerCallResult.SystemErrorMessage);
        });
    }
}
```

... the LoggingSamples class then generates an instance of this class that is injected into a BufferedLogger and used alongside a ConsoleLogger, utilising the CompositeLogger class to send log entries to both...

```typescript
// Create a UUID session id up-front, so the same session id can be used in both ILogger instances
let sessionIdProvider = new UuidSessionIdProvider();
let sessionId: string = sessionIdProvider.GenerateId();
let bufferFlushStrategy = new TimedLoopBufferFlushStrategy(10000);

// The ConsoleLogger will write log events to the browser/system console immediately
let consoleLogger = new ConsoleLogger
(
    LogLevel.Information, 
    sessionId
);

// The BufferedLogger will write log events to an API endpoint (implemented in the LogWriterBufferFlushAction class) in a 10 second timed loop
let bufferedLogger = new BufferedLogger
(
    bufferFlushStrategy, 
    new LogWriterBufferFlushAction(), 
    LogLevel.Information, 
    sessionId
)

// The CompositeLogger simply distributes / broadcasts logs to both of the above loggers
let compositeLogger = new CompositeLogger([ consoleLogger, bufferedLogger ]);

// The worker process in the TimedLoopBufferFlushStrategy class needs to be started
bufferFlushStrategy.Start();

// Write 2 log events immediately, and then another two after a 15 second pause...
compositeLogger.Log(LogLevel.Information, "Item 1");
compositeLogger.Log(LogLevel.Information, "Item 2");
setTimeout(() => {
    compositeLogger.Log(LogLevel.Information, "Item 3");
    compositeLogger.Log(LogLevel.Information, "Item 4");
    }, 
    15000
);
```

...the following is written to the console...

    7368a5f4-8c7e-4b48-a755-dc84fa8de6bd | 2020-10-27T23:38:59.482+09:00 | Information | Item 1
    7368a5f4-8c7e-4b48-a755-dc84fa8de6bd | 2020-10-27T23:38:59.484+09:00 | Information | Item 2
    7368a5f4-8c7e-4b48-a755-dc84fa8de6bd | 2020-10-27T23:39:14.486+09:00 | Information | Item 3
    7368a5f4-8c7e-4b48-a755-dc84fa8de6bd | 2020-10-27T23:39:14.487+09:00 | Information | Item 4

... and the same data written to the API endpoint in a 10 second loop.

---

## Installing
Use the *npm install* command from the project root folder to restore dependent packages.

Unit tests can be run using the command *npm test* (uses [jest](https://jestjs.io/) and [ts-jest](https://github.com/kulshekhar/ts-jest)).


## Future Enhancements
ContainerObjectTypeValidator
- Greater use of Type aliases
- Support for the JavaScript 'BigInt' type
- Test (and possibly implement) support for recursive objects like tree nodes
- Check whether 2d Arrays can be validated, and implement if they can't

ServiceLayerInterface
- Finish implementation of XhrHttpClient
- Add support for returned HTTP content types other than 'application/json'
- Add injectable logger instance to ServiceLayerInterface constructor
- Consider whether IHttpClient needs to support passthrough setting of custom HTTP headers (e.g. for OAuth bearer tokens)
- Consider supporting cancellation of an in-progress service call

General
- Look at using TypeScript [Namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html)
- Create a npm package for the project

## Release History

<table>
    <tr>
        <td><b>Version</b></td>
        <td><b>Changes</b></td>
    </tr>
    <tr>
        <td valign="top">0.2.0</td>
        <td>
            Adding Buffering.<br />
            Adding BufferedLogger.<br />
            ServiceLayerInterface allows MIME types returned from the CallServiceLayer() method to be null (e.g. in the case of PUT or POST calls).<br />
            ServiceLayerInterface.CallServiceLayer() parameter 'urlOrUrlBuider' can be set to a string containing the full URL of the service layer call.<br />
            Added samples for Buffering and Logging.<br />
        </td>
        <td valign="top">0.1.0</td>
        <td>
            Started using version numbers.<br />
            Added the AngularHttpClient class.<br />
        </td>
    </tr>
</table>