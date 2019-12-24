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

 /**
  * @name EnumTypeConversionDefinition
  * @desc An enum mapping definition.  Either of the following values can be accepted...
  *          Array<string> - A list of the possible enum values in an un-typed ('any') object.
  *          Array<[ string, string ]> - A list of enum values in an un-typed ('any') object., and the corresponding local
  *              typescript enum value (e.g. in the case the un-typed object contains numeric representation of the enum values 
  *              which need to be mapped)
  */
export type EnumTypeConversionDefinition = Array<string | [ string, string ]>;

/**
 * @name TypeConversionDefinition
 * @desc A Union representing a data type, method of type conversion, or enum mapping definition.  Any of the following values can be accepted...
 *          JavascriptBasicType - A javascript basic type (i.e. 'string', 'number', 'boolean', or 'Date').
 *          ITypedObjectConversionFunction<any> - An implementation of function interface ITypedObjectConversionFunction<any>.
 *          Array<string> - For enum types, a list of the possible enum values in an un-typed ('any') object.
 *          Array<[ string, string ]> - For enum types, a list of enum values in an un-typed ('any') object., and the corresponding local
 *              typescript enum value (e.g. in the case the un-typed object contains numeric representation of the enum values 
 *              which need to be mapped)
 */
export type TypeConversionDefinition = JavascriptBasicType | ITypedObjectConversionFunction<any> | EnumTypeConversionDefinition;

/**
 * @name JavascriptBasicType
 * @desc The basic data types in JavaScript.
 */
export enum JavascriptBasicType
{
    String, 
    Boolean, 
    Number, 
    Date
}

/**
 * @name ITypedObjectConversionFunction
 * @desc Converts an object of type 'any' to a typed object.
 * 
 * @argument {any} untypedObject - An un-typed object.
 * @template T - The type of object to convert to.
 * @returns {T} - The typed object.
 */
export interface ITypedObjectConversionFunction<T> {
    (untypedObject: any): T;
}

/**
 * @name ObjectTypeConversionDefinition
 * @desc Defines how an un-typed object should be converted to a typed object.
 */
export class ObjectTypeConversionDefinition {

    // A map of container object property names (key), and their data type or method of validation/conversion (value)
    protected propertyDefinitions: Map<string, TypeConversionDefinition>;
    // A collection of names of properties on the un-typed object which should be excluded from validation/conversion.
    protected excludeProperties: Map<string, string>;
    // A collection of names of properties on the un-typed object which are allowed to be set null.
    protected nullableProperties: Map<string, string>;

    /**
     * @param {Iterable<[string, TypeConversionDefinition]>} propertyDefinitions- An Iterable containing object property names (key), and their data type or method of validation/conversion (value)
     * @param {Array<string>} excludeProperties - Names of properties on the un-typed object which should be excluded from validation/conversion.
     * @param {Array<string>} nullableProperties - Names of properties on the un-typed object which are allowed to be set null.
     */ 
    constructor (propertyDefinitions: Iterable<[string, TypeConversionDefinition]>, excludeProperties: Array<string> = [], nullableProperties: Array<string> = []) {

        this.propertyDefinitions = new Map<string, TypeConversionDefinition>(propertyDefinitions);
        if (this.propertyDefinitions.size === 0)
            throw new Error(`Parameter 'propertyDefinitions' cannot be empty.`);

        this.excludeProperties = new Map<string, string>();
        for (let currentExcludeProperty of excludeProperties) {
            if (currentExcludeProperty.trim() === "") 
                throw new Error(`Parameter 'excludeProperties' contains a blank or empty property name.`);

            this.excludeProperties.set(currentExcludeProperty, currentExcludeProperty);
        }

        this.nullableProperties = new Map<string, string>();
        for (let currentNullableProperty of nullableProperties) {
            if (currentNullableProperty.trim() === "") 
                throw new Error(`Parameter 'nullableProperties' contains a blank or empty property name.`);
            if (this.propertyDefinitions.has(currentNullableProperty) === false)
                throw new Error(`Parameter 'nullableProperties' contains a property name '${currentNullableProperty}' which is not defined in parameter 'propertyDefinitions'.`);

            this.nullableProperties.set(currentNullableProperty, currentNullableProperty);
        }
    }
    
    /**
     * @name HasDefinition
     * @desc Checks whether a validation/conversion definition exists for the specified property name.

     * @param {string} propertyName - The property name to check for.
     * 
     * @returns {boolean} - True if a validation/conversion definition exists for the specified property, false otherwise.
     */
    public HasDefinition(propertyName: string) : boolean {

        return this.propertyDefinitions.has(propertyName);
    }

    /**
     * @name GetDefinition
     * @desc Returns the validation/conversion definition for the property with the specified name.

     * @param {string} propertyName - The property name.
     * 
     * @returns {TypeConversionDefinition} - The validation/conversion definition for the property.
     * @throws {Error} - No validation/conversion definition exists for the specified property name.
     */
    public GetDefinition(propertyName: string) : TypeConversionDefinition {
        if (this.propertyDefinitions.has(propertyName) === false)
            throw new Error(`No validation/conversion definition exists for property name '${propertyName}'.`);

        return <TypeConversionDefinition>this.propertyDefinitions.get(propertyName);
    }

    /**
     * @name PropertyIsExcluded
     * @desc Checks whether the property with the specified name should be excluded from validation/conversion.

     * @param {string} propertyName - The property name to check for.
     * 
     * @returns {boolean} - True if the property should be excluded from validation/conversion, false otherwise.
     */
    public PropertyIsExcluded(propertyName: string) : boolean {

        return this.excludeProperties.has(propertyName);
    }

    
    /**
     * @name PropertyIsNullable
     * @desc Checks whether the property with the specified name can be set null.

     * @param {string} propertyName - The property name to check for.
     * 
     * @returns {boolean} - True if the property can bet set null, false otherwise.
     */
    public PropertyIsNullable(propertyName: string) : boolean {

        return this.nullableProperties.has(propertyName);
    }
}