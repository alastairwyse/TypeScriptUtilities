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

import { JavaScriptStringConstants } from '../../src/javascript-string-constants';
import { JavascriptBasicType, TypeConversionDefinition, ObjectTypeConversionDefinition } from '../../src/object-type-conversion-definition';
import { ContainerObjectTypeValidator } from '../../src/container-object-type-validator';

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
    protected inStock: boolean;
    protected dateAdded: Date;

    get DisplayName(): string {
        return this.displayName;
    }

    get PricePerUnit(): number {
        return this.pricePerUnit;
    }

    get Unit(): UnitOfSale {
        return this.unit;
    }

    get InStock(): boolean {
        return this.inStock;
    }

    get DateAdded(): Date {
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

    set InStock(value: boolean) {
        this.inStock = value;
    }

    set DateAdded(value: Date) {
        this.dateAdded = value;
    }

    constructor() {
        this.displayName = "";
        this.pricePerUnit = 0;
        this.unit = UnitOfSale.Bunch;
        this.inStock = false;
        this.dateAdded = new Date();
    }
}

// #endregion

/**
 * @desc Unit tests for the ContainerObjectTypeValidator class.
 */
describe("ContainerObjectTypeValidator Tests", () => {
    let storeCatalogueItemObjectTypeConversionDefinition: ObjectTypeConversionDefinition;
    let testContainerObjectTypeValidator: ContainerObjectTypeValidator;
    beforeEach(() => {
        storeCatalogueItemObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(
            <Iterable<[string, TypeConversionDefinition]>>
            [
                [ "DisplayName", JavascriptBasicType.String ], 
                [ "PricePerUnit", JavascriptBasicType.Number ], 
                [ "Unit", 
                    [ 
                        [ "0", "Bunch" ], [ "1", "Piece" ], [ "2", "Kilogram" ], [ "3", "Pack" ]  
                    ] 
                ], 
                [ "InStock", JavascriptBasicType.Boolean ], 
                [ "DateAdded", JavascriptBasicType.Date ] 
            ]
        );
        testContainerObjectTypeValidator = new ContainerObjectTypeValidator();
    });

    afterEach(() => { 
    });

    // #region ConvertNumber() Tests

    it("ConvertNumber(): String-typed parameter success test.", done => {
        let inputValue: string = "123";
        let result: number = testContainerObjectTypeValidator.ConvertNumber(inputValue);
        expect(result).toBe(123);
        done();
    });

    it("ConvertNumber(): Number-typed parameter success test.", done => {
        let inputValue: number = 123;
        let result: number = testContainerObjectTypeValidator.ConvertNumber(inputValue);
        expect(result).toBe(123);
        done();
    });

    it("ConvertNumber(): Invalid type exception.", done => {
        expect(() => {
            let inputValue = { objectName: "myObject" };
            testContainerObjectTypeValidator.ConvertNumber(inputValue);
        }).toThrow(new TypeError("Parameter 'untypedNumber' was expected to be of type 'string' or 'number' but was 'object'."));
        done();
    });

    it("ConvertNumber(): String can't be converted to a number.", done => {
        expect(() => {
            let inputValue: string = "abc";
            testContainerObjectTypeValidator.ConvertNumber(inputValue);
        }).toThrow(new TypeError("Parameter 'untypedNumber' with value 'abc' could not be converted to a number."));
        done();
    });

    // #endregion 

    // #region ConvertBoolean() Tests

    it("ConvertBoolean(): String-typed parameter success test.", done => {
        let inputValue: string = "FALSE";
        let result: boolean = testContainerObjectTypeValidator.ConvertBoolean(inputValue);
        expect(result).toBe(false);
        done();
    });

    it("ConvertBoolean(): Boolean-typed parameter success test.", done => {
        let inputValue: boolean = false;
        let result: boolean = testContainerObjectTypeValidator.ConvertBoolean(inputValue);
        expect(result).toBe(false);
        done();
    });

    it("ConvertBoolean(): Invalid type exception.", done => {
        expect(() => {
            let inputValue: number = 123;
            testContainerObjectTypeValidator.ConvertBoolean(inputValue);
        }).toThrow(new TypeError("Parameter 'untypedBoolean' was expected to be of type 'string' or 'boolean' but was 'number'."));
        done();
    });

    it("ConvertBoolean(): String can't be converted to a boolean.", done => {
        expect(() => {
            let inputValue: string = "abc";
            testContainerObjectTypeValidator.ConvertBoolean(inputValue);
        }).toThrow(new TypeError("Value 'abc' of parameter 'untypedBoolean' could not be converted to a boolean."));
        done();
    });

    it("ConvertString(): Invalid type exception.", done => {
        expect(() => {
            let inputValue = { objectName: "myObject" };
            testContainerObjectTypeValidator.ConvertString(inputValue);
        }).toThrow(new TypeError("Parameter 'untypedString' was expected to be of type 'string', 'boolean', or 'number' but was 'object'."));
        done();
    });

    // #endregion 

    // #region ConvertString() Tests

    it("ConvertString(): String-typed parameter success test.", done => {
        let inputValue: string = "abc";
        let result: string = testContainerObjectTypeValidator.ConvertString(inputValue);
        expect(result).toBe("abc");
        done();
    });

    it("ConvertString(): Number-typed parameter success test.", done => {
        let inputValue: number = 1234;
        let result: string = testContainerObjectTypeValidator.ConvertString(inputValue);
        expect(result).toBe("1234");
        done();
    });
    
    it("ConvertString(): Boolean-typed parameter success test.", done => {
        let inputValue: boolean = false;
        let result: string = testContainerObjectTypeValidator.ConvertString(inputValue);
        expect(result).toBe("false");
        done();
    });

    // #endregion 

    // #region ConvertDate() Tests

    it("ConvertDate(): Invalid type exception.", done => {
        expect(() => {
            let inputValue = true;
            testContainerObjectTypeValidator.ConvertDate(inputValue);
        }).toThrow(new TypeError("Parameter 'untypedDate' was expected to be of type 'string' or 'object' but was 'boolean'."));
        done();
    });

    it("ConvertDate(): String can't be converted to a date.", done => {
        expect(() => {
            let inputValue: string = "abc";
            testContainerObjectTypeValidator.ConvertDate(inputValue);
        }).toThrow(new TypeError("Value 'abc' of parameter 'untypedDate' could not be converted to a Date."));
        done();
    });

    it("ConvertDate(): Success test.", done => {
        let inputValue: string = "2019-10-08 22:21:05";
        let result: Date = testContainerObjectTypeValidator.ConvertDate(inputValue);
        expect(result.getFullYear()).toBe(2019);
        expect(result.getMonth()).toBe(9); // getMonth() returns a 0-based result (?!?)
        expect(result.getDate()).toBe(8);
        expect(result.getHours()).toBe(22);
        expect(result.getMinutes()).toBe(21);
        expect(result.getSeconds()).toBe(5);
        done();
    });

    // #endregion 

    // #region ConvertEnum() Tests

    it("ConvertEnum(): Empty 'enumValuesAndMappings' parameter throws exception.", done => {
        expect(() => {
            testContainerObjectTypeValidator.ConvertEnum("ABC", []);
        }).toThrow(new TypeError("Parameter 'enumValuesAndMappings' cannot be an empty array."));
        done();
    });

    it("ConvertEnum(): Could not match enum mapping value throws exception.", done => {
        expect(() => {
            let enumValuesAndMappings: Array<[ string, string ]> = [
                [ "0",  "Apple" ], 
                [ "1",  "Orange" ], 
                [ "2",  "Peach" ], 
                [ "3",  "Grape" ] 
            ];
            testContainerObjectTypeValidator.ConvertEnum("4", enumValuesAndMappings);
        }).toThrow(new TypeError("Parameter 'untypedEnumValue' with value '4' could not be matched to an enum mapping value in '0,1,2,3'."));
        done();
    });

    it("ConvertEnum(): Could not match enum direct conversion value throws exception.", done => {
        expect(() => {
            let enumValuesAndMappings: Array<string> = [
                "Apple", 
                "Orange", 
                "Peach", 
                "Grape"
            ];
            testContainerObjectTypeValidator.ConvertEnum("Banana", enumValuesAndMappings);
        }).toThrow(new TypeError("Parameter 'untypedEnumValue' with value 'Banana' could not be matched to an enum mapping value in 'Apple,Orange,Peach,Grape'."));
        done();
    });

    it("ConvertEnum(): Mapping local value undefined or null throws exception.", done => {
        expect(() => {
            let enumValuesAndMappings: Array<any> = [
                [ "Apple" ], 
                [ "Orange" ], 
                [ "Peach" ], 
                [ "Grape" ]
            ];
            testContainerObjectTypeValidator.ConvertEnum("Orange", enumValuesAndMappings);
        }).toThrow(new TypeError("Parameter 'enumValuesAndMappings' contains an undefined or null local value."));
        done();
    });

    it("ConvertEnum(): Mapping value undefined or null throws exception.", done => {
        expect(() => {
            let enumValuesAndMappings: Array<any> = [
                [ null, "Apple" ], 
                [ null, "Orange" ], 
                [ null, "Peach" ], 
                [ null, "Grape" ]
            ];
            testContainerObjectTypeValidator.ConvertEnum("Orange", enumValuesAndMappings);
        }).toThrow(new TypeError("Parameter 'enumValuesAndMappings' contains an undefined or null mapping value."));
        done();
    });

    it("ConvertEnum(): Direct conversion success test.", done => {
        let untypedEnumValue: string = "Orange";
        let enumValuesAndMappings: Array<string> = [
            "Apple", 
            "Orange", 
            "Peach", 
            "Grape"
        ];

        let result: string = testContainerObjectTypeValidator.ConvertEnum(untypedEnumValue, enumValuesAndMappings);

        expect(result).toBe("Orange");
        done();
    });

    it("ConvertEnum(): Mapped value success test.", done => {
        let untypedEnumValue: string = "1";
        let enumValuesAndMappings: Array<[ string, string ]> = [
            [ "0",  "Apple" ], 
            [ "1",  "Orange" ], 
            [ "2",  "Peach" ], 
            [ "3",  "Grape" ] 
        ];

        let result: string = testContainerObjectTypeValidator.ConvertEnum(untypedEnumValue, enumValuesAndMappings);

        expect(result).toBe("Orange");
        done();
    });

    // #endregion 

    // #region ValidateAndConvertObject() Tests

    it("ValidateAndConvertObject(): Missing property in untyped object throws exception.", done => {
        expect(() => {
            let inputObject: any =  {
                DisplayName: "Onion", 
                Unit: "2", 
                InStock: true, 
                DateAdded: "2002-01-17"
            };
            testContainerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItem>(inputObject, StoreCatalogueItem, storeCatalogueItemObjectTypeConversionDefinition);
        }).toThrow(new TypeError("Parameter 'inputObject' does not contain property 'PricePerUnit'."));
        done();
    });

    it("ValidateAndConvertObject(): Missing type conversion definition throws exception.", done => {
        expect(() => {
            storeCatalogueItemObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(
                <Iterable<[string, TypeConversionDefinition]>>
                [
                    [ "DisplayName", JavascriptBasicType.String ], 
                    // [ "PricePerUnit", JavascriptBasicType.Number ], 
                    [ "Unit", 
                        [ 
                            [ "0", "Bunch" ], [ "1", "Piece" ], [ "2", "Kilogram" ], [ "3", "Pack" ]  
                        ] 
                    ], 
                    [ "InStock", JavascriptBasicType.Boolean ], 
                    [ "DateAdded", JavascriptBasicType.Date ] 
                ]
            );
            testContainerObjectTypeValidator = new ContainerObjectTypeValidator();
            let inputObject: any =  {
                DisplayName: "Onion", 
                PricePerUnit: 380, 
                Unit: "2", 
                InStock: true, 
                DateAdded: "2002-01-17"
            };
            testContainerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItem>(inputObject, StoreCatalogueItem, storeCatalogueItemObjectTypeConversionDefinition);
        }).toThrow(new TypeError("Parameter 'ObjectTypeConversionDefinition' does not contain a type conversion definition for object property 'PricePerUnit'."));
        done();
    });

    it("ValidateAndConvertObject(): Failure to convert basic JavaScript type throws exception.", done => {
        expect(() => {
            let inputObject: any =  {
                DisplayName: { DisplayName: "Onion" }, 
                PricePerUnit: 380, 
                Unit: "2", 
                InStock: true, 
                DateAdded: "2002-01-17"
            };
            testContainerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItem>(inputObject, StoreCatalogueItem, storeCatalogueItemObjectTypeConversionDefinition);
        }).toThrow(new TypeError("Error attempting to validate and convert property 'DisplayName':  Parameter 'untypedString' was expected to be of type 'string', 'boolean', or 'number' but was 'object'."));
        done();
    });

    it("ValidateAndConvertObject(): Failure to convert enum throws exception.", done => {
        expect(() => {
            let inputObject: any =  {
                DisplayName: "Onion", 
                PricePerUnit: 380, 
                Unit: "5", 
                InStock: true, 
                DateAdded: "2002-01-17"
            };
            testContainerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItem>(inputObject, StoreCatalogueItem, storeCatalogueItemObjectTypeConversionDefinition);
        }).toThrow(new TypeError("Error attempting to validate and convert property 'Unit':  Parameter 'untypedEnumValue' with value '5' could not be matched to an enum mapping value in '0,1,2,3'."));
        done();
    });

    it("ValidateAndConvertObject(): Failure to execute custom converter throws exception.", done => {
        expect(() => {
            storeCatalogueItemObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(
                <Iterable<[string, TypeConversionDefinition]>>
                [
                    [ "DisplayName", JavascriptBasicType.String ], 
                    [ "PricePerUnit", (untypedNumber: any) : number => {
                            throw new Error("Custom converter error.");
                        }
                    ], 
                    [ "Unit", 
                        [ 
                            [ "0", "Bunch" ], [ "1", "Piece" ], [ "2", "Kilogram" ], [ "3", "Pack" ]  
                        ] 
                    ], 
                    [ "InStock", JavascriptBasicType.Boolean ], 
                    [ "DateAdded", JavascriptBasicType.Date ] 
                ]
            );
            let inputObject: any =  {
                DisplayName: "Onion", 
                PricePerUnit: 380, 
                Unit: "2", 
                InStock: true, 
                DateAdded: "2002-01-17"
            };
            testContainerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItem>(inputObject, StoreCatalogueItem, storeCatalogueItemObjectTypeConversionDefinition);
        }).toThrow(new TypeError("Error attempting to validate and convert property 'PricePerUnit':  Custom converter error."));
        done();
    });

    it("ValidateAndConvertObject(): Success test.", done => {
        storeCatalogueItemObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(
            <Iterable<[string, TypeConversionDefinition]>>
            [
                [ "DisplayName", (untypedString: any) : string => {
                        return untypedString.toString();
                    } 
                ], 
                [ "PricePerUnit", JavascriptBasicType.Number ], 
                [ "Unit", 
                    [ 
                        [ "0", "Bunch" ], [ "1", "Piece" ], [ "2", "Kilogram" ], [ "3", "Pack" ]  
                    ] 
                ], 
                [ "InStock", JavascriptBasicType.Boolean ], 
                [ "DateAdded", JavascriptBasicType.Date ] 
            ]
        );
        let inputObject: any =  {
            DisplayName: "Onion", 
            PricePerUnit: 380, 
            Unit: "2", 
            InStock: true, 
            DateAdded: "2002-01-17"
        };

        let result: StoreCatalogueItem = testContainerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItem>(inputObject, StoreCatalogueItem, storeCatalogueItemObjectTypeConversionDefinition);
        
        expect(typeof(result.DisplayName)).toBe(JavaScriptStringConstants.StringType);
        expect(result.DisplayName).toBe("Onion");
        expect(typeof(result.PricePerUnit)).toBe(JavaScriptStringConstants.NumberType);
        expect(result.PricePerUnit).toBe(380);
        expect(typeof(result.Unit)).toBe(JavaScriptStringConstants.StringType);
        expect(result.Unit).toBe(UnitOfSale.Kilogram);
        expect(typeof(result.InStock)).toBe(JavaScriptStringConstants.BooleanType);
        expect(result.InStock).toBe(true);
        expect(typeof(result.DateAdded)).toBe(JavaScriptStringConstants.ObjectType);
        expect(result.DateAdded.getFullYear()).toBe(2002);
        expect(result.DateAdded.getMonth()).toBe(0); // getMonth() returns a 0-based result (?!?)
        expect(result.DateAdded.getDate()).toBe(17);
        done();
    });

    it("ValidateAndConvertObject(): Exclude fields success test.", done => {
        storeCatalogueItemObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(
            <Iterable<[string, TypeConversionDefinition]>>
            [
                [ "DisplayName", (untypedString: any) : string => {
                        return untypedString.toString();
                    } 
                ], 
                [ "PricePerUnit", JavascriptBasicType.Number ], 
                [ "Unit", 
                    [ 
                        [ "0", "Bunch" ], [ "1", "Piece" ], [ "2", "Kilogram" ], [ "3", "Pack" ]  
                    ] 
                ], 
                [ "InStock", JavascriptBasicType.Boolean ], 
                [ "DateAdded", JavascriptBasicType.Date ] 
            ], 
            // excludeProperties
            [ "PricePerUnit", "DisplayName" ]
        );
        let inputObject: any =  {
            DisplayName: "Onion", 
            PricePerUnit: 380, 
            Unit: "2", 
            InStock: true, 
            DateAdded: "2002-01-17"
        };

        let result: StoreCatalogueItem = testContainerObjectTypeValidator.ValidateAndConvertObject<StoreCatalogueItem>(inputObject, StoreCatalogueItem, storeCatalogueItemObjectTypeConversionDefinition);
        
        expect(typeof(result.DisplayName)).toBe(JavaScriptStringConstants.StringType);
        expect(result.DisplayName).toBe("");
        expect(typeof(result.PricePerUnit)).toBe(JavaScriptStringConstants.NumberType);
        expect(result.PricePerUnit).toBe(0);
        expect(typeof(result.Unit)).toBe(JavaScriptStringConstants.StringType);
        expect(result.Unit).toBe(UnitOfSale.Kilogram);
        expect(typeof(result.InStock)).toBe(JavaScriptStringConstants.BooleanType);
        expect(result.InStock).toBe(true);
        expect(typeof(result.DateAdded)).toBe(JavaScriptStringConstants.ObjectType);
        expect(result.DateAdded.getFullYear()).toBe(2002);
        expect(result.DateAdded.getMonth()).toBe(0); // getMonth() returns a 0-based result (?!?)
        expect(result.DateAdded.getDate()).toBe(17);
        done();
    });

    // #endregion 

    // #region ValidateAndConvertObjectArray() Tests

    it("ValidateAndConvertObjectArray(): Parameter 'inputArray' not an array throws exception.", done => {
        expect(() => {
            let inputObject: any = {
                DisplayName: "Onion", 
                PricePerUnit: 380, 
                Unit: "2", 
                InStock: true, 
                DateAdded: "2002-01-17"
            };
            testContainerObjectTypeValidator.ValidateAndConvertObjectArray<StoreCatalogueItem>(inputObject, StoreCatalogueItem, storeCatalogueItemObjectTypeConversionDefinition);
        }).toThrow(new TypeError("Parameter 'inputArray' is not an array."));
        done();
    });

    it("ValidateAndConvertObjectArray(): Failure to convert array element throws exception.", done => {
        let inputArray: Array<any> = [
            {
                DisplayName: "Onion", 
                PricePerUnit: 380, 
                Unit: "2", 
                InStock: true, 
                DateAdded: "2002-01-17"
            }, 
            {
                DisplayName: "Lemon", 
                PricePerUnit: 75, 
                Unit: "1", 
                DateAdded: "2005-10-31"
            } 
        ];
        expect(() => {
            testContainerObjectTypeValidator.ValidateAndConvertObjectArray<StoreCatalogueItem>(inputArray, StoreCatalogueItem, storeCatalogueItemObjectTypeConversionDefinition);
        }).toThrow(new TypeError(`Error attempting to validate and convert array element '${JSON.stringify(inputArray[1])}':  Parameter 'inputObject' does not contain property 'InStock'.`));
        done();
    });

    it("ValidateAndConvertObjectArray(): Success test.", done => {
        let inputArray: Array<any> = [
            {
                DisplayName: "Onion", 
                PricePerUnit: 380, 
                Unit: "2", 
                InStock: true, 
                DateAdded: "2002-01-17"
            }, 
            {
                DisplayName: "Lemon", 
                PricePerUnit: 75, 
                Unit: "1", 
                InStock: false, 
                DateAdded: "2005-10-31"
            }, 
            {
                DisplayName: "Celery", 
                PricePerUnit: 490, 
                Unit: "0", 
                InStock: true, 
                DateAdded: "2001-11-09"
            }
        ];
        
        let result: Array<StoreCatalogueItem> = testContainerObjectTypeValidator.ValidateAndConvertObjectArray<StoreCatalogueItem>(inputArray, StoreCatalogueItem, storeCatalogueItemObjectTypeConversionDefinition);

        expect(typeof(result[0].DisplayName)).toBe(JavaScriptStringConstants.StringType);
        expect(result[0].DisplayName).toBe("Onion");
        expect(typeof(result[0].PricePerUnit)).toBe(JavaScriptStringConstants.NumberType);
        expect(result[0].PricePerUnit).toBe(380);
        expect(typeof(result[0].Unit)).toBe(JavaScriptStringConstants.StringType);
        expect(result[0].Unit).toBe(UnitOfSale.Kilogram);
        expect(typeof(result[0].InStock)).toBe(JavaScriptStringConstants.BooleanType);
        expect(result[0].InStock).toBe(true);
        expect(typeof(result[0].DateAdded)).toBe(JavaScriptStringConstants.ObjectType);
        expect(result[0].DateAdded.getFullYear()).toBe(2002);
        expect(result[0].DateAdded.getMonth()).toBe(0); 
        expect(result[0].DateAdded.getDate()).toBe(17);
        expect(typeof(result[1].DisplayName)).toBe(JavaScriptStringConstants.StringType);
        expect(result[1].DisplayName).toBe("Lemon");
        expect(typeof(result[1].PricePerUnit)).toBe(JavaScriptStringConstants.NumberType);
        expect(result[1].PricePerUnit).toBe(75);
        expect(typeof(result[1].Unit)).toBe(JavaScriptStringConstants.StringType);
        expect(result[1].Unit).toBe(UnitOfSale.Piece);
        expect(typeof(result[1].InStock)).toBe(JavaScriptStringConstants.BooleanType);
        expect(result[1].InStock).toBe(false);
        expect(typeof(result[1].DateAdded)).toBe(JavaScriptStringConstants.ObjectType);
        expect(result[1].DateAdded.getFullYear()).toBe(2005);
        expect(result[1].DateAdded.getMonth()).toBe(9); 
        expect(result[1].DateAdded.getDate()).toBe(31);
        expect(typeof(result[2].DisplayName)).toBe(JavaScriptStringConstants.StringType);
        expect(result[2].DisplayName).toBe("Celery");
        expect(typeof(result[2].PricePerUnit)).toBe(JavaScriptStringConstants.NumberType);
        expect(result[2].PricePerUnit).toBe(490);
        expect(typeof(result[2].Unit)).toBe(JavaScriptStringConstants.StringType);
        expect(result[2].Unit).toBe(UnitOfSale.Bunch);
        expect(typeof(result[2].InStock)).toBe(JavaScriptStringConstants.BooleanType);
        expect(result[2].InStock).toBe(true);
        expect(typeof(result[2].DateAdded)).toBe(JavaScriptStringConstants.ObjectType);
        expect(result[2].DateAdded.getFullYear()).toBe(2001);
        expect(result[2].DateAdded.getMonth()).toBe(10); 
        expect(result[2].DateAdded.getDate()).toBe(9);
        done();
    });

    // #endregion 

    // #region ValidateAndConvertBasicTypeArray() Tests

    it("ValidateAndConvertBasicTypeArray(): Parameter 'inputArray' not an array throws exception.", done => {
        expect(() => {
            let inputObject: any = {
                DisplayName: "Onion", 
                PricePerUnit: 380, 
                Unit: "2", 
                InStock: true, 
                DateAdded: "2002-01-17"
            };
            testContainerObjectTypeValidator.ValidateAndConvertBasicTypeArray<number>(inputObject, JavascriptBasicType.Number);
        }).toThrow(new TypeError("Parameter 'inputArray' is not an array."));
        done();
    });

    it("ValidateAndConvertBasicTypeArray(): Error converting array element throws exception.", done => {
        expect(() => {
            let inputArray: Array<any> = [
                "123", 
                "456", 
                "abc", 
                "789"
            ];
            testContainerObjectTypeValidator.ValidateAndConvertBasicTypeArray<number>(inputArray, JavascriptBasicType.Number);
        }).toThrow(new TypeError("Error attempting to validate and convert array element 'abc':  Parameter 'untypedNumber' with value 'abc' could not be converted to a number."));
        done();
    });

    it("ValidateAndConvertBasicTypeArray(): Success test.", done => {
        let inputArray: Array<any> = [
            "123", 
            "456", 
            "789", 
            "012"
        ];

        let result: Array<number> = testContainerObjectTypeValidator.ValidateAndConvertBasicTypeArray<number>(inputArray, JavascriptBasicType.Number);

        expect(typeof(result[0])).toBe(JavaScriptStringConstants.NumberType);
        expect(result[0]).toBe(123);
        expect(typeof(result[1])).toBe(JavaScriptStringConstants.NumberType);
        expect(result[1]).toBe(456);
        expect(typeof(result[2])).toBe(JavaScriptStringConstants.NumberType);
        expect(result[2]).toBe(789);
        expect(typeof(result[3])).toBe(JavaScriptStringConstants.NumberType);
        expect(result[3]).toBe(12);
        done();
    });

    // #endregion 

});