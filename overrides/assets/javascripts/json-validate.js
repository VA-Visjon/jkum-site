
function generateErrorMessage(input) {
    const entities = [];
    const regex = /\/(\w+)(?:\/(\d+))?/g;
    let match;

    while ((match = regex.exec(input)) !== null) {
        const [, entity, index] = match;
        if (index !== undefined) {
            entities.push({ entity, index: parseInt(index) });
        } else {
            entities.push({ entity });
        }
    }

    const errorMessages = {
        manholes: "manhole",
        pipes: "pipe",
        material: "material"
    };

    let errorMessage = "There is an error with";
    for (let i = 0; i < entities.length; i++) {
        const { entity, index } = entities[i];
        const errorMessagePart = errorMessages[entity] || entity;

        if (i === entities.length - 1) {
            errorMessage += ` ${errorMessagePart}`;
            if (index !== undefined) {
                errorMessage += ` for the ${index === 0 ? "first" : "second"} ${errorMessagePart}`;
            }
        } else {
            errorMessage += ` ${errorMessagePart} in the`;
            if (index !== undefined) {
                errorMessage += ` ${index === 0 ? "first" : "second"} ${errorMessagePart} of the`;
            }
        }
    }

    return errorMessage;
}

function validateSchema() {
    // Start with formatting contents to trigger potential errors
    formatContents();

    const pretty = document.getElementById('upload_file_presentation');
    const text = pretty.innerHTML.replace(/<[^>]*>?/gm, '');
    modules.validateJson(text, "jkum-schema-1.0.json", (errors) => {
      // First clear the inner of the wrapper
      const report = document.getElementById('schema-report');
      report.innerHTML = '';

      if(errors){
        formatContents(errors);
        // See: https://ajv.js.org/api.html#validation-errors
        for (const err of errors) {
          console.log(err)
          const node = document.createElement("div");
          node.classList.add("validation");
          node.classList.add("alert-warning");

//          // Get instancePath data
//          const message = generateErrorMessage(err.instancePath);
//          console.log(message);

          // Build contents
          const heading = document.createElement("h4");
          heading.classList.add("validation-header");
          heading.innerHTML = "Validation error: " + err.keyword;
          const text = document.createElement("p");
          text.innerHTML = "<b>" + err.instancePath + "</b> " + err.message;

          // Handle special stuff
          switch(err.keyword){
            case "enum":
                text.innerHTML += ": <b>" + err.params.allowedValues.join(", ") + "</b>";
                break;
            case "if":
                text.innerHTML += ": You're missing required parameters as a result of dependencies";
                break;
            default:
                // Do nothing
          }

          node.appendChild(heading);
          node.appendChild(text);

          report.appendChild(node);
        }
      } else{
        const node = document.createElement("div");
        node.classList.add("alert-success");
        node.innerHTML = "Success!";
        report.appendChild(node);
      }
    });
  }