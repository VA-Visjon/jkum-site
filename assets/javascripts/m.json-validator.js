import Ajv from 'ajv7';
const ajv = new Ajv({allErrors: true})

const validators = {}

export const loadValidator = async (schemaName) => {
    if(validators.hasOwnProperty(schemaName)){
        return validators[schemaName];
    }

    const response = await fetch("/assets/schemas/" + schemaName);
    if(!response.ok){
        return null;
    }

    const jsonSchema = await response.json();
    const validate = ajv.compile(jsonSchema);

    validators[schemaName] = validate;
    return validate;
}

export const validateJson = async (json, schemaName, callback) => {

    // First make sure we dont have any errors in the input
    json = jsonToValidPrettyString(json);
    json = JSON.parse(json);
    if(!json) return;

    const validate = await loadValidator(schemaName);
    console.log(validate);
    if (validate(json)) {
        callback(null);
    } else {
      // DefinedError is a type for all pre-defined keywords errors,
      // validate.errors has type ErrorObject[] - to allow user-defined keywords with any error parameters.
      // Users can extend DefinedError to include the keywords errors they defined.
      const errors = []
      for (const err of validate.errors) {
        errors.push(err);
//            switch (err.keyword) {
//              case "maximum":
//                console.log(err.limit);
//                break
//              case "pattern":
//                console.log(err.pattern);
//                break
//            }
      }
      callback(errors);
    }
};

