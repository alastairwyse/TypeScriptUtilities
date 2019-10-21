TypeScriptUtilities
-------------------

Utility classes for TypeScript web applications.

## Contents

### :: ContainerObjectTypeValidator ::

TypeScript allows un-typed objects returned from API calls to be simply assigned to strongly typed objects.  E.g for the class StoreCatalogueItem...

```
class StoreCatalogueItem {
    public displayName: string;
    public pricePerUnit: number;
    public inStock: boolean;
}
```

...the following code simulates reading a StoreCatalogueItem instance via the XMLHttpRequest object...

```
let serializedObject: string = "{ \"displayName\": \"Onion\",  \"pricePerUnit\": \"abc\" }"; 
let untypedObject: any = JSON.parse(serializedObject);
let myCatalogueItem: StoreCatalogueItem = untypedObject;
```

Even though 'myCatalogueItem' is explicitly declared as a StoreCatalogueItem, 'untypedObject' is assigned to it at runtime when we're in JavaScript world, and none of the type-safe benfits of TypeScript are available.  Hence doing a console.log() on 'myCatalogueItem' results in...

    { displayName: "Onion", pricePerUnit: "abc" }

...'pricePerUnit' has been assigned a string even though it's defined as a number property, and worse still console.log(myCatalogueItem.inStock) gives...

    undefined

This can be problematic in large web applications, especially when you're consuming 3rd party APIs where you don't have control over the content and quality of the data you're consuming.  The issue above may not trigger an application error until a long time after the API is initially read, which can then lead to difficulty identifying where and how the object got into an invalid state (i.e. did it come from the API that way, or was it somehow changed by subsequent code)... which ultimately leads to code which is harder to debug and maintain.

The purpose of the ContainerObjectTypeValidator class is to provide runtime type validation and conversion of untyped ('any') objects, based on a succint class type definition.  Using the class to validate and convert un-typed objects obtained at runtime (especially from API/service calls) allows...
* Identifying incorrectly-typed and missing data at the perimeter of your application before objects are used internally 
* Throwing clear, detailed errors as soon as any incorrectly-typed and missing data issues are detected

ContainerObjectTypeValidator might also be useful when consuming APIs endpoints with a lot of unused properties/data.  E.g. an endpoint returning a company employee might include basic personal information, location and department info, boss and subordinate details, Active Directory or network properties, etc, etc.  If you only need to consume a small subset of this data, ContainerObjectTypeValidator can be used to validate and retrieve a limited number of fields/properties (i.e. it will only attempt to validate and convert properties defined in the local container/model class)... i.e. only the fields/properties you actually need.

### In Use

The below examples and associated container/model class definitions are available in file [samples.ts](src/samples.ts).

#### Validating and converting Javascript basic types and dates...

```
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

```
let untypedNumberArray = [ "123", "456", "789" ];
let returnedNumberArray: Array<number> = containerObjectTypeValidator.ValidateAndConvertBasicTypeArray<number>(untypedNumberArray, JavascriptBasicType.Number);
let untypedBooleanArray = [ "true", "false", "true" ];
let returnedBooleanrArray: Array<boolean> = containerObjectTypeValidator.ValidateAndConvertBasicTypeArray<boolean>(untypedBooleanArray, JavascriptBasicType.Boolean);
let untypedDateArray = [ "2017-11-12", "2018-10-13", "2019-09-14" ];
let returnedDateArray: Array<Date> = containerObjectTypeValidator.ValidateAndConvertBasicTypeArray<Date>(untypedDateArray, JavascriptBasicType.Date);
console.log(returnedNumberArray);
console.log(returnedBooleanrArray);
console.log(returnedDateArray);
```
...outputs...

    [ 123, 456, 789 ]
    [ true, false, true ]
    [ Sun Nov 12 2017 09:00:00 GMT+0900, Sat Oct 13 2018 09:00:00 GMT+0900, Sat Sep 14 2019 09:00:00 GMT+0900 ]

#### Validating TypeScript enums...

Enums are tricky because whilst you can use the 'keyof typeof' statement to retrieve the values of a specifid enum at runtime, I haven't found a way to do the same for generic enum type variables (i.e. the 'T' in a method signature like ConvertEnum&lt;T&gt;()).  Hence ContainerObjectTypeValidator has a method ConvertEnum() defined as follows...

```
public ConvertEnum(untypedEnumValue: any, enumValuesAndMappings: Array<string | [ string, string ]>) : string
```

...which requires the valid enum values to be provided in parameter 'enumValuesAndMappings'.  The parameter is a TypeScript [Union](https://www.typescriptlang.org/docs/handbook/advanced-types.html#union-types) which can be either...
* an Array&lt;string&gt; where the value of 'untypedEnumValue' is expected to exactly match the enum value defined in TypeScript, OR
* an Array&lt;[ string, string ]&gt; where the value of 'untypedEnumValue' needs to be mapped to the enum value defined in TypeScript (see example below)

```
let untypedEnum = "Pack";
let returnedEnum = <UnitOfSale>containerObjectTypeValidator.ConvertEnum(untypedEnum, [ "Bunch", "Piece", "Kilogram", "Pack" ]);
console.log(returnedEnum);
// Outputs...
//   Pack
```

```
untypedEnum = "1";
returnedEnum = <UnitOfSale>containerObjectTypeValidator.ConvertEnum(untypedEnum, [ [ "0", "Bunch" ], [ "1", "Piece" ], [ "2", "Kilogram" ], [ "3", "Pack" ] ]);
console.log(returnedEnum);
// Outputs...
//   Piece
```

#### Validating and converting simple container/model objects...

```
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

```
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

... throws error...

    'Error attempting to validate and convert property 'PricePerUnit':  Parameter 'untypedNumber' with value 'abc' could not be converted to a number.'

```
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

... throws error...

    'Error attempting to validate and convert property 'Unit':  Parameter 'untypedEnumValue' with value 'Pound' could not be matched to an enum mapping value in 'Bunch,Piece,Kilogram,Pack'.'

#### Fields in the local class definition can be excluded from validation/conversion...

```
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

```
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

```
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

```
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

```
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

```
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

```
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

```
let returnedStock2: StockWithTypeConversionDefinition = containerObjectTypeValidator.ValidateAndConvertObject<StockWithTypeConversionDefinition>(
    untypedObject, 
    StockWithTypeConversionDefinition, 
    StockWithTypeConversionDefinition.TypeConversionDefinition
);
console.log(returnedStock2); 
```


## Future Enhancements
- Greater use of Type aliases
- Support for the JavaScript 'BigInt' type
- Test (and possibly implement) support for recursive objects like tree nodes


## Release History

<table>
    <tr>
        <td><b>Version</b></td>
        <td><b>Changes</b></td>
    </tr>
    <tr>
        <td valign="top">0</td>
        <td>
            ...
        </td>
    </tr>
</table>