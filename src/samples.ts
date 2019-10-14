import { TypeConversionDefinition, JavascriptBasicType, ITypedObjectConversionFunction, ObjectTypeConversionDefinition } from './object-type-conversion-definition';
import { ContainerObjectTypeValidator } from './container-object-type-validator';

// #region Test Classes

enum UnitOfSale
{
    Bunch = "Bunch",
    Piece = "Piece",
    Kilogram = "Kilogram",
    Pack = "Pack"
}

class StoreCatalogueItem {
    protected displayName: string;
    protected pricePerUnit: number;
    protected unit: UnitOfSale;

    get DisplayName(): string {
        return this.displayName;
    }

    get PricePerUnit(): number {
        return this.pricePerUnit;
    }

    get Unit(): UnitOfSale {
        return this.unit;
    }

    set DisplayName(value: string) {
        if (value == "")
            throw new Error("Property 'DisplayName' cannot be empty.");

        this.displayName = value;
    }

    set PricePerUnit(value: number) {
        if (value < 0)
            throw new Error("Property 'PricePerUnit' cannot be less than 0.");

        this.pricePerUnit = value;
    }

    set Unit(value: UnitOfSale) {
        this.unit = value;
    }

    constructor() {
        this.displayName = "";
        this.pricePerUnit = 0;
        this.unit = UnitOfSale.Bunch;
    }
}

class StockPrice {

    protected date: Date;
    protected price: number;
    
    get Date(): Date {
        return this.date;
    }

    set Date(value: Date) {
        this.date = value;
    }

    get Price(): number {
        return this.price;
    }

    set Price(value: number) {
        this.price = value;
    }
}

class Stock {

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

// #endregion

export class Samples {

    public Run() : void {

        let containerObjectTypeValidator: ContainerObjectTypeValidator = new ContainerObjectTypeValidator();

        // ------------------------------------------------------
        // Validating and converting a simple container object...
        // ------------------------------------------------------
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
        // Prints the following...
        // {
        //   displayName: "Onion"
        //   pricePerUnit: 380
        //   unit: "Kilogram"
        // }


        // ------------------------------------------------
        // Failure to convert throws a descriptive error...
        // ------------------------------------------------
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
        // Throws error...
        //   'Error attempting to validate and convert property 'PricePerUnit':  Parameter 'untypedNumber' with value 'abc' could not be converted to a number.'

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
        // Throws error...
        //   'Error attempting to validate and convert property 'Unit':  Parameter 'untypedEnumValue' with value 'Pound' could not be matched to an enum mapping value in 'Bunch,Piece,Kilogram,Pack'.'


        // -----------------------------------------------------------------------
        // Fields in the local class definition can be excluded from conversion...
        // -----------------------------------------------------------------------
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
        // Prints the following ('pricePerUnit' takes the default or construction value)...
        // {
        //   displayName: "Onion"
        //   pricePerUnit: 0
        //   unit: "Kilogram"
        // }


        // -------------------------------
        // Converting arrays of objects...
        // -------------------------------
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
            ]
        );

        let returnedArray: Array<StoreCatalogueItem> = containerObjectTypeValidator.ValidateAndConvertObjectArray<StoreCatalogueItem>(
            untypedArray, 
            StoreCatalogueItem, 
            storeCatalogueItemObjectTypeConversionDefinition
        );
        console.log(returnedArray);  
        // Prints the following...
        // [
        //     {
        //         "displayName": "Onion",
        //         "pricePerUnit": 380,
        //         "unit": "Kilogram"
        //     },
        //     {
        //         "displayName": "Avocado",
        //         "pricePerUnit": 190,
        //         "unit": "Piece"
        //     },
        //     {
        //         "displayName": "Strawberry",
        //         "pricePerUnit": 490,
        //         "unit": "Pack"
        //     }
        // ]


        // ----------------------------------------------
        // Converting Javascript basic types and dates...
        // ----------------------------------------------
        let returnedNumber: number = containerObjectTypeValidator.ConvertNumber("123");
        let returnedBoolean: boolean = containerObjectTypeValidator.ConvertBoolean("false");
        let returnedDate: Date = containerObjectTypeValidator.ConvertDate("2019-11-14 11:44:00");
        console.log(returnedNumber);
        console.log(returnedBoolean);
        console.log(returnedDate);
        // Prints...
        //   123 
        //   false 
        //   Thu Nov 14 2019 11:44:00 GMT+0900 


        // --------------------------------------------------------
        // Converting arrays of Javascript basic types and dates...
        // --------------------------------------------------------
        let untypedNumberArray = [ "123", "456", "789" ];
        let returnedNumberArray: Array<number> = containerObjectTypeValidator.ValidateAndConvertBasicTypeArray<number>(untypedNumberArray, JavascriptBasicType.Number);
        let untypedBooleanArray = [ "true", "false", "true" ];
        let returnedBooleanrArray: Array<boolean> = containerObjectTypeValidator.ValidateAndConvertBasicTypeArray<boolean>(untypedBooleanArray, JavascriptBasicType.Boolean);
        let untypedDateArray = [ "2017-11-12", "2018-10-13", "2019-09-14" ];
        let returnedDateArray: Array<Date> = containerObjectTypeValidator.ValidateAndConvertBasicTypeArray<Date>(untypedDateArray, JavascriptBasicType.Date);
        console.log(returnedNumberArray);
        console.log(returnedBooleanrArray);
        console.log(returnedDateArray);
        // Prints...
        //   [ 123, 456, 789 ]
        //   [ true, false, true ]
        //   [ Sun Nov 12 2017 09:00:00 GMT+0900, Sat Oct 13 2018 09:00:00 GMT+0900, Sat Sep 14 2019 09:00:00 GMT+0900 ]

        
        // -------------------
        // Converting Enums...
        // -------------------
        let untypedEnum = "Pack";
        let returnedEnum: UnitOfSale = <UnitOfSale>containerObjectTypeValidator.ConvertEnum(untypedEnum, [ "Bunch", "Piece", "Kilogram", "Pack" ]);
        console.log(returnedEnum);
        // Prints...
        //   Pack


        // -----------------------------------------------
        // Mapping enums from an external numeric value...
        // -----------------------------------------------
        untypedEnum = "1";
        returnedEnum = <UnitOfSale>containerObjectTypeValidator.ConvertEnum(untypedEnum, [ [ "0", "Bunch" ], [ "1", "Piece" ], [ "2", "Kilogram" ], [ "3", "Pack" ] ]);
        console.log(returnedEnum);
        // Prints...
        //   Piece

        
        // -----------------------------------------
        // Objects / arrays nested within objects...
        // -----------------------------------------
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

        let stockDeserializationDefinition = new ObjectTypeConversionDefinition(
            // Parameter 'propertyDefinitions'
            <Iterable<[string, TypeConversionDefinition]>>
            [
                [ "CompanyName", JavascriptBasicType.String ], 
                [ "Ticker", JavascriptBasicType.String ],
                [ "Prices", <ITypedObjectConversionFunction<Array<StockPrice>>>((untypedObject: any) : Array<StockPrice> => {
                                let stockPriceDeserializationDefinition = new ObjectTypeConversionDefinition(
                                    <Iterable<[string, TypeConversionDefinition]>>
                                    [
                                        [ "Date", JavascriptBasicType.Date ], 
                                        [ "Price", JavascriptBasicType.Number ]
                                    ]
                                );
                                return containerObjectTypeValidator.ValidateAndConvertObjectArray<StockPrice>(untypedObject, StockPrice, stockPriceDeserializationDefinition);
                            })
                ] 
            ]
        );

        let returnedStock: Stock = containerObjectTypeValidator.ValidateAndConvertObject<Stock>(
            untypedObject, 
            Stock, 
            stockDeserializationDefinition
        );
        console.log(returnedStock);  
        // Prints the following...
        // {
        //     "companyName": "BHP Billiton Limited",
        //     "ticker": "BHP.AX",
        //     "prices": [
        //         {
        //             "date": "2019-09-23T15:00:00.000Z",
        //             "price": 37.5
        //         },
        //         {
        //             "date": "2019-09-24T15:00:00.000Z",
        //             "price": 36.42
        //         },
        //         {
        //             "date": "2019-09-25T15:00:00.000Z",
        //             "price": 36.82
        //         },
        //         {
        //             "date": "2019-09-26T15:00:00.000Z",
        //             "price": 36.5
        //         },
        //         {
        //             "date": "2019-09-29T15:00:00.000Z",
        //             "price": 36.92
        //         }
        //     ]
        // }
    }       
}