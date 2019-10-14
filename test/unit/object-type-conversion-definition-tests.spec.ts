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

import { JavascriptBasicType, ObjectTypeConversionDefinition } from '../../src/object-type-conversion-definition';

/**
 * @desc Unit tests for the ObjectTypeConversionDefinition class.
 */
describe("ObjectTypeConversionDefinition Tests", () => {
    let testObjectTypeConversionDefinition: ObjectTypeConversionDefinition;

    beforeEach(() => {
        let propertyDefinitions: Map<string, JavascriptBasicType> = new Map<string, JavascriptBasicType>( 
            [ 
                [ "Property1", JavascriptBasicType.String ], 
                [ "Property2", JavascriptBasicType.Boolean ], 
                [ "Property3", JavascriptBasicType.Number ]
            ] 
        );
        let excludeProperties: Array<string> = [ "Property4", "Property5" ];
        testObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(propertyDefinitions, excludeProperties);
    });
  
    afterEach(() => { 
    });

    it("Constructor(): Empty 'propertyDefinitions' parameter throws exception.", done => {
        expect(() => {
            testObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(new Map<string, JavascriptBasicType>());
        }).toThrow(new TypeError("Parameter 'propertyDefinitions' cannot be empty."));
        done();
    });

    it("Constructor(): 'excludeProperties' parameter with empty element throws exception.", done => {
        expect(() => {
            let propertyDefinitions: Map<string, JavascriptBasicType> = new Map<string, JavascriptBasicType>( [ [ "Property1", JavascriptBasicType.String ] ] );
            let excludeProperties: Array<string> = [ "Property2", "", "Property3" ];
            testObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(propertyDefinitions, excludeProperties);
        }).toThrow(new TypeError("Parameter 'excludeProperties' contains a blank or empty property name."));
        done();
    });

    it("GetDefinition(): No validation/conversion definition for specified property name throws exception.", done => {
        expect(() => {
            let propertyDefinitions: Map<string, JavascriptBasicType> = new Map<string, JavascriptBasicType>( [ [ "Property1", JavascriptBasicType.String ] ] );
            testObjectTypeConversionDefinition = new ObjectTypeConversionDefinition(propertyDefinitions);
            testObjectTypeConversionDefinition.GetDefinition("Property2");
        }).toThrow(new TypeError("No validation/conversion definition exists for property name 'Property2'."));
        done();
    });

    it("HasDefinition(): Success test.", done => {
        let result: boolean = testObjectTypeConversionDefinition.HasDefinition("Property1");
        expect(result).toBe(true);
        result = testObjectTypeConversionDefinition.HasDefinition("Property6");
        expect(result).toBe(false);
        done();
    });
    
    it("PropertyIsExcluded(): Success test.", done => {
        let result: boolean = testObjectTypeConversionDefinition.PropertyIsExcluded("Property4");
        expect(result).toBe(true);
        result = testObjectTypeConversionDefinition.PropertyIsExcluded("Property1");
        expect(result).toBe(false);
        done();
    });

    it("GetDefinition(): Success test.", done => {
        let result: JavascriptBasicType = <JavascriptBasicType>testObjectTypeConversionDefinition.GetDefinition("Property3");
        expect(result).toBe(JavascriptBasicType.Number);
        done();
    });
});
