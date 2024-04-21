
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
        // See: https://ajv.js.org/api.html#validation-errors
        for (const err of errors) {
          console.log(err)
          const node = document.createElement("div");
          node.classList.add("validation");
          node.classList.add("alert-warning");

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
                console.log(err);
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