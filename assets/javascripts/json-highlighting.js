
let jsonParseError = null;

function getSyntaxErrors(text) {
    const regex = /position (\d+) \(line (\d+) column (\d+)\)/;
    const match = text.match(regex);

    if (match) {
        const position = parseInt(match[1]);
        const line = parseInt(match[2]);
        const column = parseInt(match[3]);

        console.log("Position:", position);
        console.log("Line:", line);
        console.log("Column:", column);
        return {
            position: position,
            line: line,
            column: column
        }
    } else {
        console.log("No match found.");
    }
    return null;
}

const jsonToValidPrettyString = (json) => {
    jsonParseError = null;
    if (typeof json !== 'string') {
        json = JSON.stringify(json, undefined, 2);
    } else {
        try {
            json = JSON.parse(json)
            json = JSON.stringify(json, undefined, 2);
        } catch (e) {
            if (e.name === "StackError"){
                errorLocation = getSyntaxErrors(e.stack);
                jsonParseError = {
                    message: e.message,
                    stack: e.stack,
                    position: errorLocation
                };
                return console.error(e);
            } else {
                jsonParseError = {
                    message: e.message,
                    stack: e.stack,
                    position: null
                };
                return console.error(e);
            }
        }
    }
    return json;
}

const syntaxHighlight = (json, validationErrors) => {

//    const options = {};
//    var json = neatJSON( json, options );
//    return json;
    json = jsonToValidPrettyString(json);
    if(!json) return;

    // Regex to strip out all image data
    let regex = /"base64String":\s*"[^"]+"/g;
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(regex, '"base64String": "IMAGE_REMOVED_FOR_READABILITY"');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}