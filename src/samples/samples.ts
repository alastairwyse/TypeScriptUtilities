import { TypeConversionDefinition, JavascriptBasicType, ITypedObjectConversionFunction, ObjectTypeConversionDefinition } from '../utilities/data-validation/object-type-conversion-definition';
import { ContainerObjectTypeValidator } from '../utilities/data-validation/container-object-type-validator';
import { IBufferFlushAction } from '../utilities/buffering/ibuffer-flush-action';
import { SizeLimitedBufferFlushStrategy } from '../utilities/buffering/size-limited-buffer-flush-strategy';
import { Buffer } from '../utilities/buffering/buffer';
import { HttpRequestMethod } from '../utilities/service-layer-interface/http-request-method';
import { AureliaHttpClient } from "../utilities/service-layer-interface/implementations/aurelia-http-client";
import { UrlScheme } from '../utilities/service-layer-interface/url-scheme';
import { HttpUrlPrefixBuilder } from '../utilities/service-layer-interface/http-url-prefix-builder';
import { ServiceLayerInterface, ServiceLayerCallResult, HttpContentType } from '../utilities/service-layer-interface/service-layer-interface';
import { HttpUrlPathAndQueryBuilder } from '../utilities/service-layer-interface/http-url-path-and-query-builder';
import { LogLevel } from 'utilities/logging/log-level';
import { UuidSessionIdProvider } from 'utilities/logging/uuid-session-id-provider';
import { TimedLoopBufferFlushStrategy } from 'utilities/buffering/timed-loop-buffer-flush-strategy';
import { ConsoleLogger } from 'utilities/logging/console-logger';
import { BufferedLogger } from 'utilities/logging/buffered-logger';
import { CompositeLogger } from 'utilities/logging/composite-logger';

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

class StoreCatalogueItemWithNullableProperty {
    protected displayName: string;
    protected pricePerUnit: number;
    protected unit: UnitOfSale;
    protected dateAdded: Date | null;

    get DisplayName(): string {
        return this.displayName;
    }

    get PricePerUnit(): number {
        return this.pricePerUnit;
    }

    get Unit(): UnitOfSale {
        return this.unit;
    }

    get DateAdded(): Date | null {
        return this.dateAdded;
    }

    set DisplayName(value: string) {
        this.displayName = value;
    }

    set PricePerUnit(value: number) {
        this.pricePerUnit = value;
    }

    set Unit(value: UnitOfSale) {
        this.unit = value;
    }

    set DateAdded(value: Date | null) {
        this.dateAdded = value;
    }

    constructor() {
        this.displayName = "";
        this.pricePerUnit = 0;
        this.unit = UnitOfSale.Bunch;
        this.dateAdded = new Date();
    }
}

class StockPrice {

    protected date: Date;
    protected price: number;
    
    constructor() {
        this.date = new Date();
        this.price = 0;
    }

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
        
    constructor() {
        this.companyName = "";
        this.ticker = "";
        this.prices = [];
    }

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

class StockWithTypeConversionDefinition {

    public static TypeConversionDefinition = new ObjectTypeConversionDefinition(
        // Parameter 'propertyDefinitions'
        <Iterable<[string, TypeConversionDefinition]>>
        [
            [ "companyName", JavascriptBasicType.String ], 
            [ "ticker", JavascriptBasicType.String ],
            [ "prices", <ITypedObjectConversionFunction<Array<StockPrice>>>((untypedObject: any) : Array<StockPrice> => {
                            let stockPriceTypeConversionDefinition = new ObjectTypeConversionDefinition(
                                <Iterable<[string, TypeConversionDefinition]>>
                                [
                                    [ "date", JavascriptBasicType.Date ], 
                                    [ "price", JavascriptBasicType.Number ]
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
            
    constructor() {
        this.companyName = "";
        this.ticker = "";
        this.prices = [];
    }

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

/**
 * @name WriteToConsoleBufferFlushAction
 * @desc Implementation of IBufferFlushAction<string> which writes logging information to the console.
 */
class WriteToConsoleBufferFlushAction implements IBufferFlushAction<string> {

    /** @inheritdoc */
    Flush(bufferContents: IterableIterator<string>): void {

        for (let currentItem of Array.from(bufferContents)) {
            console.log(currentItem);
        }
    }
}

/**
 * @name LogWriterBufferFlushAction
 * @desc Implementation of IBufferFlushAction<string> which writes logging information to an API endpoint.
 */
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

// #endregion

export class DataValidationSamples {

    public Run() : void {

        let containerObjectTypeValidator: ContainerObjectTypeValidator = new ContainerObjectTypeValidator();

        // ------------------------------------------------------
        // Validating and converting a simple container object...
        // ------------------------------------------------------
        let untypedObject: any = {
            displayName: "Onion", 
            pricePerUnit: 380, 
            unit: "Kilogram"
        };

        let storeCatalogueItemObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(
            <Iterable<[string, TypeConversionDefinition]>>
            [
                [ "displayName", JavascriptBasicType.String ], 
                [ "pricePerUnit", JavascriptBasicType.Number ], 
                [ "unit", 
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
            displayName: "Onion", 
            pricePerUnit: "abc",  // Error - not a number
            unit: "Kilogram"
        };
        returnedStoreCatalogueItem = containerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItem>(
            untypedObject, 
            StoreCatalogueItem, 
            storeCatalogueItemObjectTypeConversionDefinition
        );
        // Throws error...
        //   'Error attempting to validate and convert property 'pricePerUnit':  Parameter 'untypedNumber' with value 'abc' could not be converted to a number.'

        untypedObject = {
            displayName: "Onion", 
            pricePerUnit: 380, 
            unit: "Pound"  // Error - not a valid enum value
        };
        returnedStoreCatalogueItem = containerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItem>(
            untypedObject, 
            StoreCatalogueItem, 
            storeCatalogueItemObjectTypeConversionDefinition
        );
        // Throws error...
        //   'Error attempting to validate and convert property 'unit':  Parameter 'untypedEnumValue' with value 'Pound' could not be matched to an enum mapping value in 'Bunch,Piece,Kilogram,Pack'.'


        // -----------------------------------------------------------------------
        // Fields in the local class definition can be excluded from conversion...
        // -----------------------------------------------------------------------
        storeCatalogueItemObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(
            // 'propertyDefinitions' parameter
            <Iterable<[string, TypeConversionDefinition]>>
            [
                [ "displayName", JavascriptBasicType.String ], 
                [ "pricePerUnit", JavascriptBasicType.Number ], 
                [ "unit", 
                    [ 
                        "Bunch", "Piece", "Kilogram", "Pack"  
                    ] 
                ], 
            ], 
            // 'excludeProperties' parameter
            <Array<string>>[
                "pricePerUnit"
            ]
        );

        untypedObject = {
            displayName: "Onion", 
            pricePerUnit: 380, 
            unit: "Kilogram" 
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
                displayName: "Onion", 
                pricePerUnit: 380, 
                unit: "Kilogram"
            }, 
            {
                displayName: "Avocado", 
                pricePerUnit: 190, 
                unit: "Piece"
            }, 
            {
                displayName: "Strawberry", 
                pricePerUnit: 490, 
                unit: "Pack"
            }
        ];

        storeCatalogueItemObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(
            <Iterable<[string, TypeConversionDefinition]>>
            [
                [ "displayName", JavascriptBasicType.String ], 
                [ "pricePerUnit", JavascriptBasicType.Number ], 
                [ "unit", 
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
        let returnedEnum = <UnitOfSale>containerObjectTypeValidator.ConvertEnum(untypedEnum, [ "Bunch", "Piece", "Kilogram", "Pack" ]);
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
            "companyName": "BHP Billiton Limited",
            "ticker": "BHP.AX",
            "prices": [
                {
                    "date": "2019-09-24T00:00:00",
                    "price": "37.5"
                },
                {
                    "date": "2019-09-25T00:00:00",
                    "price": "36.42"
                },
                {
                    "date": "2019-09-26T00:00:00",
                    "price": "36.82"
                },
                {
                    "date": "2019-09-27T00:00:00",
                    "price": "36.5"
                },
                {
                    "date": "2019-09-30T00:00:00",
                    "price": "36.92"
                }
            ]
        };

        let stockTypeConversionDefinition = new ObjectTypeConversionDefinition(
            // Parameter 'propertyDefinitions'
            <Iterable<[string, TypeConversionDefinition]>>
            [
                [ "companyName", JavascriptBasicType.String ], 
                [ "ticker", JavascriptBasicType.String ],
                [ "prices", <ITypedObjectConversionFunction<Array<StockPrice>>>((untypedObject: any) : Array<StockPrice> => {
                                let stockPriceTypeConversionDefinition = new ObjectTypeConversionDefinition(
                                    <Iterable<[string, TypeConversionDefinition]>>
                                    [
                                        [ "date", JavascriptBasicType.Date ], 
                                        [ "price", JavascriptBasicType.Number ]
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


        // -------------------------------------------
        // Validating and converting nullable types...
        // -------------------------------------------
        let inputValue: any = null;
        let returnedNullableNumber: number | null = containerObjectTypeValidator.ConvertNullableNumber(inputValue);
        console.log(returnedNullableNumber);
        // Prints...
        //   null 
        inputValue = "123";
        returnedNullableNumber = containerObjectTypeValidator.ConvertNullableNumber(inputValue);
        console.log(returnedNullableNumber);
        // Prints...
        //   123 

        inputValue = null;
        let returnedNullableDate: Date | null = containerObjectTypeValidator.ConvertNullableDate(inputValue);
        console.log(returnedNullableDate);
        // Prints...
        //   null 
        inputValue = "2019-10-21";
        returnedNullableDate = containerObjectTypeValidator.ConvertNullableDate(inputValue);
        console.log(returnedNullableDate);
        // Prints...
        //   Date Mon Oct 21 2019 09:00:00 GMT+0900


        // -----------------------------------------------------
        // Validating and converting arrays of nullable types...
        // -----------------------------------------------------
        let inputArray: Array<any> = [ "true", null, "false" ];
        let returnedNullableBooleanArray: Array<boolean | null> = containerObjectTypeValidator.ValidateAndConvertBasicNullableTypeArray<boolean>(inputArray, JavascriptBasicType.Boolean);
        console.log(returnedNullableBooleanArray);
        // Prints...
        //   [ true, null, false ]

        inputArray = [ "Red", null, null, "Black" ];
        let returnedNullableStringArray: Array<string | null> = containerObjectTypeValidator.ValidateAndConvertBasicNullableTypeArray<string>(inputArray, JavascriptBasicType.String);
        console.log(returnedNullableStringArray);
        // Prints...
        //   [ "Red", null, null, "Black" ]


        // -------------------------------
        // Handling nullable properties...
        // -------------------------------
        storeCatalogueItemObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(
            // 'propertyDefinitions' parameter
            <Iterable<[string, TypeConversionDefinition]>>
            [
                [ "displayName", JavascriptBasicType.String ], 
                [ "pricePerUnit", JavascriptBasicType.Number ], 
                [ "unit", 
                    [ 
                        "Bunch", "Piece", "Kilogram", "Pack"  
                    ] 
                ], 
                [ "dateAdded", JavascriptBasicType.Date ]
            ], 
            // 'excludeProperties' parameter
            <Array<string>>[], 
            // 'nullableProperties' parameter
            <Array<string>>[
                "dateAdded"
            ]
        );

        untypedObject = {
            displayName: "Onion", 
            pricePerUnit: 380, 
            unit: "Kilogram" , 
            dateAdded: null
        };

        let returnedStoreCatalogueItem2: StoreCatalogueItemWithNullableProperty = containerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItemWithNullableProperty>(
            untypedObject, 
            StoreCatalogueItemWithNullableProperty, 
            storeCatalogueItemObjectTypeConversionDefinition
        );
        console.log(returnedStoreCatalogueItem2);  
        // Prints the following...
        // {
        //     "displayName": "Onion",
        //     "pricePerUnit": 380,
        //     "unit": "Kilogram",
        //     "dateAdded": null
        // }


        // -------------------------------------------------------------------------------------
        // Including the type validation/conversion definition within a container/model class...
        // -------------------------------------------------------------------------------------
        untypedObject = 
        {
            "companyName": "BHP Billiton Limited",
            "ticker": "BHP.AX",
            "prices": [
                {
                    "date": "2019-09-24T00:00:00",
                    "price": "37.5"
                },
                {
                    "date": "2019-09-25T00:00:00",
                    "price": "36.42"
                },
                {
                    "date": "2019-09-26T00:00:00",
                    "price": "36.82"
                },
                {
                    "date": "2019-09-27T00:00:00",
                    "price": "36.5"
                },
                {
                    "date": "2019-09-30T00:00:00",
                    "price": "36.92"
                }
            ]
        };

        let returnedStock2: StockWithTypeConversionDefinition = containerObjectTypeValidator.ValidateAndConvertObject<StockWithTypeConversionDefinition>(
            untypedObject, 
            StockWithTypeConversionDefinition, 
            StockWithTypeConversionDefinition.TypeConversionDefinition
        );
        console.log(returnedStock2); 
    }       
}

export class BufferingSamples {

    public Run() : void {

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

        // The following is written to the console on the 5th call to Add()...
        //   The
        //   quick
        //   brown
        //   fox
        //   jumps
    }
}

export class LoggingSamples {

    public Run() : void  {

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

        // The following is written to the console...
        //   7368a5f4-8c7e-4b48-a755-dc84fa8de6bd | 2020-10-27T23:38:59.482+09:00 | Information | Item 1
        //   7368a5f4-8c7e-4b48-a755-dc84fa8de6bd | 2020-10-27T23:38:59.484+09:00 | Information | Item 2
        //   7368a5f4-8c7e-4b48-a755-dc84fa8de6bd | 2020-10-27T23:39:14.486+09:00 | Information | Item 3
        //   7368a5f4-8c7e-4b48-a755-dc84fa8de6bd | 2020-10-27T23:39:14.487+09:00 | Information | Item 4
        //
        // ... and the same data written to the API endpoint defined in class LogWriterBufferFlushAction in a 10 second loop
    }
}