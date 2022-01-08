/*
 * Copyright 2022 Alastair Wyse (https://github.com/alastairwyse/TypeScriptUtilities/)
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

import { 
    JavascriptBasicType, 
    ITypedObjectConversionFunction, 
    EnumTypeConversionDefinition, 
    TypeConversionDefinition, 
    ObjectTypeConversionDefinition 
} from '../data-validation/object-type-conversion-definition';
import { JavaScriptStringConstants } from '../../common/javascript-string-constants';

/**
 * @name ContainerObjectTypeValidator
 * @desc Verifies that un-typed objects (i.e. objects of type 'any' like those retrieved from HTTP GET calls) conform to a type definition 
 *         (i.e. that they contain a defined set of properties), and converts the objects to typed equivalents. 
 */
export class ContainerObjectTypeValidator {

    protected typeToConversionFunctionMap: Map<JavascriptBasicType, ITypedObjectConversionFunction<any>>;
    protected nullableTypeToConversionFunctionMap: Map<JavascriptBasicType, ITypedObjectConversionFunction<any>>;

    constructor() {
        this.typeToConversionFunctionMap = new Map<JavascriptBasicType, ITypedObjectConversionFunction<any>>();
        this.nullableTypeToConversionFunctionMap = new Map<JavascriptBasicType, ITypedObjectConversionFunction<any>>();
        this.InitializeTypeToConversionFunctionMaps();
    }

    /**
     * @name ValidateAndConvertObject
     * @desc Validates that an object conforms to a specified type definition, and returns a typed equivalent of the object.
     * 
     * @template T - The type of object to convert to.
     * @param {any} inputObject - The object to validate and convert.
     * @param {class} type - The type of object to convert to.
     * @param {ObjectTypeConversionDefinition} objectTypeConversionDefinition - The definition to use to validate and convert the input object.
     * 
     * @returns {T} - The typed object.
     * 
     * @throws {Error} - Parameter 'inputObject' does not contain required property.
     * @throws {Error} - Parameter 'ObjectTypeConversionDefinition' does not contain a type conversion definition for a required object property.
     * @throws {Error} - Error attempting to validate and convert object property.
     * @throws {Error} - Property is not defined as nullable but has a null value.
     */
    public ValidateAndConvertObject<T>(inputObject: any, type: { new(): T; }, objectTypeConversionDefinition: ObjectTypeConversionDefinition) : T {

        let typeInstance: any = new type();
        let typeInstancePropertyNames: string[] = Object.getOwnPropertyNames(typeInstance)

        for (let currentPropertyName of typeInstancePropertyNames) {
            if (objectTypeConversionDefinition.PropertyIsExcluded(currentPropertyName) === false) {
                if (inputObject.hasOwnProperty(currentPropertyName) === false)
                    throw new Error(`Parameter 'inputObject' does not contain property '${currentPropertyName}'.`);
                else {
                    if (objectTypeConversionDefinition.HasDefinition(currentPropertyName) == false)
                        throw new Error(`Parameter 'ObjectTypeConversionDefinition' does not contain a type conversion definition for object property '${currentPropertyName}'.`);
 
                    if (inputObject[currentPropertyName] === null) {
                        if (objectTypeConversionDefinition.PropertyIsNullable(currentPropertyName) === true) 
                            typeInstance[currentPropertyName] = null;
                        else
                            throw new Error(`Property '${currentPropertyName}' is not defined as nullable but has a null value.`);
                    }
                    else {
                        let typeConversionDefinition: TypeConversionDefinition = objectTypeConversionDefinition.GetDefinition(currentPropertyName);
                        try {
                            if (typeof(typeConversionDefinition) === JavaScriptStringConstants.NumberType) {
                                // If the value in 'typeConversionDefinition' is a number (i.e. JavascriptBasicType), attempt to use one of the basic type converters
                                if (this.typeToConversionFunctionMap.has(<JavascriptBasicType>typeConversionDefinition) === false)
                                    throw new Error(`Conversion of basic JavaScript type not supported.`);
    
                                let typeConversionFunction = <ITypedObjectConversionFunction<any>>this.typeToConversionFunctionMap.get(<JavascriptBasicType>typeConversionDefinition);
                                typeInstance[currentPropertyName] = typeConversionFunction.call(this, inputObject[currentPropertyName]);
                            }
                            else if (Array.isArray(typeConversionDefinition) === true) {
                                // If the value in 'typeConversionDefinition' is an array, use the enum converter
                                let enumValuesAndMappings = <Array<string | [ string, string ]>>typeConversionDefinition;
                                typeInstance[currentPropertyName] = this.ConvertEnum(inputObject[currentPropertyName], enumValuesAndMappings);
                            }
                            else  {
                                // Attempt to use a custom conversion function from the 'objectTypeConversionDefinition' parameter
                                let typeConversionFunction = <ITypedObjectConversionFunction<any>>typeConversionDefinition;
                                typeInstance[currentPropertyName] = typeConversionFunction.call(this, inputObject[currentPropertyName]);
                            }
                        }
                        catch (error) {
                            let typedError: Error = <Error>error;
                            throw new Error(`Error attempting to validate and convert property '${currentPropertyName}':  ${typedError.message}`);
                        }
                    }
                }
            }
        }

        return typeInstance;
    }

    /**
     * @name ValidateAndConvertObjectArray
     * @desc Validates that an array of objects (of type 'any') conform to a specified type definition, and returns an array of equivalent typed objects.
     * 
     * @template T - The type of object to convert the elements of the array to.
     * @param {any} inputArray - The array to validate and convert.
     * @param {class} elementType - The type of object to convert the elements of the array to.
     * @param {ObjectTypeConversionDefinition} elementTypeConversionDefinition - The definition to use to validate and convert the elements of the array.
     * 
     * @returns {Array<T>} - The typed array.
     * 
     * @throws {TypeError} - Parameter 'inputArray' is not and array.
     * @throws {Error} - Error attempting to validate and convert array element.
     */
    public ValidateAndConvertObjectArray<T>(inputArray: any, elementType: { new(): T; }, elementTypeConversionDefinition: ObjectTypeConversionDefinition) : Array<T> {
        if (Array.isArray(inputArray) === false)
            throw new TypeError(`Parameter 'inputArray' is not an array.`);

        let typedArray: T[] = [];
        for (let currentInputElement of inputArray) {
            try {
                typedArray.push(this.ValidateAndConvertObject(currentInputElement, elementType, elementTypeConversionDefinition));
            }
            catch (error) {
                let typedError: Error = <Error>error;
                throw new Error(`Error attempting to validate and convert array element '${JSON.stringify(currentInputElement)}':  ${typedError.message}`);
            }
        }

        return typedArray;
    }

    /**
     * @name ValidateAndConvertBasicTypeArray
     * @desc Validates that an array of objects of type 'any' can be converted to an array of basic JavaScript types, and returns a typed array.
     * 
     * @template T - The type to convert the elements of the array to.
     * @param {any} inputArray - The array to validate and convert.
     * @param {JavascriptBasicType} elementType - The type of object to convert the elements of the array to.
     * 
     * @returns {Array<T>} - The typed array.
     * 
     * @throws {TypeError} - Parameter 'inputArray' is not and array.
     * @throws {Error} - Error attempting to validate and convert array element.
     */
    public ValidateAndConvertBasicTypeArray<T extends string | number | boolean | Date>(inputArray: any, elementType: JavascriptBasicType) : Array<T> {
        this.CheckParameterIsArray("inputArray", inputArray);
    
        // TODO: Unfortunately because we can't determine the type of T at runtime (e.g. with typeof()) we can't confirm that T and parameter 'elementType' match up
        //   ...and can't use the '{ new(): T; }' technique used in ValidateAndConvertObjectArray() as this only seems to work for defined objects (not basic types)
        //   so need to find a way to do this (and same for ValidateAndConvertBasicNullableTypeArray() below)

        let typedArray: T[] = [];
        let typeConversionFunction = <ITypedObjectConversionFunction<any>>this.typeToConversionFunctionMap.get(elementType);
        for (let currentInputElement of inputArray) {
            try {
                typedArray.push(typeConversionFunction.call(this, currentInputElement));
            }
            catch (error) {
                let typedError: Error = <Error>error;
                throw new Error(`Error attempting to validate and convert array element '${currentInputElement.toString()}':  ${typedError.message}`);
            }
        }

        return typedArray;
    }

    /**
     * @name ValidateAndConvertBasicNullableTypeArray
     * @desc Validates that an array of objects of type 'any' can be converted to an array of basic JavaScript types or null, and returns a typed array.
     * 
     * @template T - The type to convert the elements of the array to.
     * @param {any} inputArray - The array to validate and convert.
     * @param {JavascriptBasicType} elementType - The type of object to convert the elements of the array to.
     * 
     * @returns {Array<T>} - The typed array.
     * 
     * @throws {TypeError} - Parameter 'inputArray' is not and array.
     * @throws {Error} - Error attempting to validate and convert array element.
     */
    public ValidateAndConvertBasicNullableTypeArray<T extends string | number | boolean | Date | null>(inputArray: any, elementType: JavascriptBasicType) : Array<T> {
        // TODO: This method is almost identical to ValidateAndConvertBasicTypeArray()... refactor into common protected method
        this.CheckParameterIsArray("inputArray", inputArray);

        let typedArray: T[] = [];
        let typeConversionFunction = <ITypedObjectConversionFunction<any>>this.nullableTypeToConversionFunctionMap.get(elementType);
        for (let currentInputElement of inputArray) {
            try {
                typedArray.push(typeConversionFunction.call(this, currentInputElement));
            }
            catch (error) {
                let typedError: Error = <Error>error;
                throw new Error(`Error attempting to validate and convert array element '${currentInputElement.toString()}':  ${typedError.message}`);
            }
        }

        return typedArray;
    }

    /**
     * @name ConvertNumber
     * @desc Converts an object of type 'any' to a number.

     * @param {any} untypedNumber - An un-typed number.
     * 
     * @returns {number} - The typed number.
     * @throws {TypeError} - Parameter 'untypedNumber' is not of type 'string' or 'number'.
     * @throws {Error} - Parameter 'untypedNumber' could not be converted to a number.
     */
    public ConvertNumber(untypedNumber: any) : number {
        if (!(typeof(untypedNumber) === JavaScriptStringConstants.StringType || typeof(untypedNumber) === JavaScriptStringConstants.NumberType)) 
            throw new TypeError(`Parameter 'untypedNumber' was expected to be of type '${JavaScriptStringConstants.StringType}' or '${JavaScriptStringConstants.NumberType}' but was '${typeof(untypedNumber)}'.`);

        let typedNumber: number = Number.parseFloat(untypedNumber);
        if (Number.isNaN(typedNumber) === true) 
            throw new Error(`Parameter 'untypedNumber' with value '${untypedNumber.toString()}' could not be converted to a number.`);

        return typedNumber;
    }

    /**
     * @name ConvertNullableNumber
     * @desc Converts an object of type 'any' to a number or null.

     * @param {any} untypedNumber - An un-typed number or null value.
     * 
     * @returns {number | null} - The typed number or null.
     * @throws {TypeError} - Parameter 'untypedNumber' is not of type 'string' or 'number'.
     * @throws {Error} - Parameter 'untypedNumber' could not be converted to a number.
     */
    public ConvertNullableNumber(untypedNumber: any) : number | null {

        if (untypedNumber === null)
            return null;
        else
            return this.ConvertNumber(untypedNumber);
    }

    /**
     * @name ConvertBoolean
     * @desc Converts an object of type 'any' to a boolean.

     * @param {any} untypedBoolean - An un-typed boolean.
     * 
     * @returns {boolean} - The typed boolean.
     * @throws {TypeError} - Parameter 'untypedBoolean' is not of type 'string' or 'boolean'.
     * @throws {Error} - Parameter 'untypedBoolean' could not be converted to a boolean.
     */
    public ConvertBoolean(untypedBoolean: any) : boolean {
        if (!(typeof(untypedBoolean) === JavaScriptStringConstants.StringType || typeof(untypedBoolean) === JavaScriptStringConstants.BooleanType)) 
            throw new TypeError(`Parameter 'untypedBoolean' was expected to be of type '${JavaScriptStringConstants.StringType}' or '${JavaScriptStringConstants.BooleanType}' but was '${typeof(untypedBoolean)}'.`);

        if (typeof(untypedBoolean) === JavaScriptStringConstants.BooleanType)
            return untypedBoolean;
        else {
            let trimmedString: string = untypedBoolean.trim().toLowerCase();
            if (trimmedString === "true")
                return true;
            else if (trimmedString === "false")
                return false;
            else
                throw new Error(`Value '${untypedBoolean.toString()}' of parameter 'untypedBoolean' could not be converted to a boolean.`);
        }
    }

    /**
     * @name ConvertNullableBoolean
     * @desc Converts an object of type 'any' to a boolean or null.

     * @param {any} untypedBoolean - An un-typed boolean or null value.
     * 
     * @returns {boolean | null} - The typed boolean or null.
     * @throws {TypeError} - Parameter 'untypedBoolean' is not of type 'string' or 'boolean'.
     * @throws {Error} - Parameter 'untypedBoolean' could not be converted to a boolean.
     */
    public ConvertNullableBoolean(untypedBoolean: any) : boolean | null {

        if (untypedBoolean === null)
            return null;
        else
            return this.ConvertBoolean(untypedBoolean);
    }

    /**
     * @name ConvertString
     * @desc Converts an object of type 'any' to a string.

     * @param {any} untypedString - A un-typed string.
     * 
     * @returns {string} - The typed string.
     * @throws {TypeError} - Parameter 'untypedString' is not of type 'string', 'number' or 'boolean'.
     */
    public ConvertString(untypedString: any) : string {
        if (!(typeof(untypedString) === JavaScriptStringConstants.StringType || 
              typeof(untypedString) === JavaScriptStringConstants.BooleanType ||
              typeof(untypedString) === JavaScriptStringConstants.NumberType)
              ) 
            throw new TypeError(`Parameter 'untypedString' was expected to be of type '${JavaScriptStringConstants.StringType}', '${JavaScriptStringConstants.BooleanType}', or '${JavaScriptStringConstants.NumberType}' but was '${typeof(untypedString)}'.`);

        return untypedString.toString();
    }

    /**
     * @name ConvertNullableString
     * @desc Converts an object of type 'any' to a string or null.

     * @param {any} untypedString - An un-typed string or null value.
     * 
     * @returns {string | null} - The typed string or null.
     * @throws {TypeError} - Parameter 'untypedString' is not of type 'string', 'number' or 'boolean'.
     */
    public ConvertNullableString(untypedString: any) : string | null {

        if (untypedString === null)
            return null;
        else
            return this.ConvertString(untypedString);
    }

    /**
     * @name ConvertDate
     * @desc Converts an object of type 'any' to a Date.

     * @param {any} untypedDate - A un-typed date.
     * 
     * @returns {Date} - The typed date.
     * @throws {TypeError} - Parameter 'untypedDate' is not of type 'string' or 'object'.
     * @throws {Error} - Parameter 'untypedDate' could not be converted to a Date.
     */
    public ConvertDate(untypedDate: any) : Date {
        if (!(typeof(untypedDate) === JavaScriptStringConstants.StringType || typeof(untypedDate) === JavaScriptStringConstants.ObjectType)) 
            throw new TypeError(`Parameter 'untypedDate' was expected to be of type '${JavaScriptStringConstants.StringType}' or '${JavaScriptStringConstants.ObjectType}' but was '${typeof(untypedDate)}'.`);

        let typedDate = new Date(untypedDate);
        if (typedDate.toString() === JavaScriptStringConstants.InvalidDate)
            throw new Error(`Value '${untypedDate.toString()}' of parameter 'untypedDate' could not be converted to a Date.`);

        return typedDate;
    }

    /**
     * @name ConvertNullableDate
     * @desc Converts an object of type 'any' to a Date or null.

     * @param {any} untypedDate - An un-typed date or null value.
     * 
     * @returns {Date | null} - The typed date or null.
     * @throws {TypeError} - Parameter 'untypedDate' is not of type 'string' or 'object'.
     * @throws {Error} - Parameter 'untypedDate' could not be converted to a Date.
     */
    public ConvertNullableDate(untypedDate: any) : Date | null {

        if (untypedDate === null)
            return null;
        else
            return this.ConvertDate(untypedDate);
    }

    /**
     * @name ConvertEnum
     * @desc Validates and converts an object of type 'any' to an enum value.

     * @param {any} untypedEnumValue - A un-typed enum value.
     * @param {EnumTypeConversionDefinition} enumValuesAndMappings - A Union representing all the valid enum values.  Accepts either of the following types...
     *          Array<string> - All valid enum values, where the value to be passed in parameter 'untypedEnumValue' exactly matches the enum value in the array.
     *          Array<[ string, string ]> - All valid enum values, where the value to be passed in parameter must be mapped to the enum value.
     *            Item 1 of tuple contains the mapped value which should match the value in parameter 'untypedEnumValue'.
     *            Item 2 of the tuple contains the TypeScript enum value.
     * 
     * @returns {string} - The the validated and typed enum value.
     * @throws {Error} - Parameter 'enumValuesAndMappings' is an empty array.
     * @throws {Error} - Parameter 'untypedEnumValue' with could not be matched to an enum mapping value.
     */
    public ConvertEnum(untypedEnumValue: any, enumValuesAndMappings: EnumTypeConversionDefinition) : string {
        if (enumValuesAndMappings.length == 0)
            throw new Error("Parameter 'enumValuesAndMappings' cannot be an empty array.");

        // Not really necessary to put all values in a map since it will only be used once, but this does mean the code can be more succinct 
        //   as we don't need separate routines for Array<string> and Array<[ string, string ]>
        let enumValueMappings: Map<string, string> = new Map<string, string>();
        for (let currentEnumValuesAndMapping of enumValuesAndMappings) {
            if (typeof(currentEnumValuesAndMapping) === "string") {
                enumValueMappings.set(currentEnumValuesAndMapping, currentEnumValuesAndMapping);
            }
            else {
                let typedCurrentEnumValuesAndMapping = <[ string, string ]>currentEnumValuesAndMapping
                if (typeof(typedCurrentEnumValuesAndMapping[0]) === JavaScriptStringConstants.Undefined || typedCurrentEnumValuesAndMapping[0] === null)
                    throw new Error(`Parameter 'enumValuesAndMappings' contains an undefined or null mapping value.`);
                if (typeof(typedCurrentEnumValuesAndMapping[1]) === JavaScriptStringConstants.Undefined || typedCurrentEnumValuesAndMapping[1] === null)
                    throw new Error(`Parameter 'enumValuesAndMappings' contains an undefined or null local value.`);
                enumValueMappings.set(typedCurrentEnumValuesAndMapping[0].toString(), typedCurrentEnumValuesAndMapping[1]);
            }
        }
        if (enumValueMappings.has(untypedEnumValue.toString()) === false)
            throw new Error(`Parameter 'untypedEnumValue' with value '${untypedEnumValue.toString()}' could not be matched to an enum mapping value in '${Array.from( enumValueMappings.keys() )}'.`);

        return <string>enumValueMappings.get(untypedEnumValue.toString());
    }

    protected InitializeTypeToConversionFunctionMaps() : void {
        this.typeToConversionFunctionMap.set(JavascriptBasicType.String, (untypedObject: any): any => { return this.ConvertString(untypedObject); });
        this.typeToConversionFunctionMap.set(JavascriptBasicType.Number, (untypedObject: any): any => { return this.ConvertNumber(untypedObject); });
        this.typeToConversionFunctionMap.set(JavascriptBasicType.Boolean, (untypedObject: any): any => { return this.ConvertBoolean(untypedObject); });
        this.typeToConversionFunctionMap.set(JavascriptBasicType.Date, (untypedObject: any): any => { return this.ConvertDate(untypedObject); });
        this.nullableTypeToConversionFunctionMap.set(JavascriptBasicType.String, (untypedObject: any): any => { return this.ConvertNullableString(untypedObject); });
        this.nullableTypeToConversionFunctionMap.set(JavascriptBasicType.Number, (untypedObject: any): any => { return this.ConvertNullableNumber(untypedObject); });
        this.nullableTypeToConversionFunctionMap.set(JavascriptBasicType.Boolean, (untypedObject: any): any => { return this.ConvertNullableBoolean(untypedObject); });
        this.nullableTypeToConversionFunctionMap.set(JavascriptBasicType.Date, (untypedObject: any): any => { return this.ConvertNullableDate(untypedObject); });
    }

    protected CheckParameterIsArray(parameterName: string, parameterValue: any) : void {
        if (Array.isArray(parameterValue) === false)
            throw new TypeError(`Parameter '${parameterName}' is not an array.`);
    }
}