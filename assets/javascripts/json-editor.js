
const previousRevisions = [];
let redoRevisions = [];
const editor = document.getElementById("upload_file_presentation");

function formatContents() {
    const pretty = document.getElementById('upload_file_presentation');
    const raw = document.getElementById('upload_file');
    const errorDiv = document.getElementById('formatting_error');
    // Strip all tags
    const text = pretty.innerHTML.replace(/<[^>]*>?/gm, '');
    raw.innerHTML = text;
    const highlighted = syntaxHighlight(raw.innerHTML);
    if (jsonParseError === null){
      errorDiv.innerHTML = "";
      errorDiv.style = "display:none;";
      pretty.innerHTML = highlighted;
    } else{
      errorDiv.innerHTML = jsonParseError.message;
      errorDiv.style = "display:block;";
    }
    // Then save the state for undo/redo
    saveState(pretty.innerHTML);
}


function updateRaw() {
    const pretty = document.getElementById('upload_file_presentation');
    const raw = document.getElementById('upload_file');
    const text = pretty.innerHTML.replace(/<[^>]*>?/gm, '');
    raw.innerHTML = text;
}

let debounceTimer;
function debounce(func, timeout = 500){
  return (...args) => {
//  console.log("RUNNING");
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}

function updateUndoRedoButtonEnabled() {
    const undoButton = document.getElementById("undo");
    const redoButton = document.getElementById("redo");

    // The first state is the initial state, should never be popped
    if (previousRevisions.length > 1) {
        undoButton.disabled = false;
    } else{
        undoButton.disabled = true;
    }
    if (redoRevisions.length > 0) {
        redoButton.disabled = false;
    } else{
        redoButton.disabled = true;
    }
}

function saveState() {
//  console.log("SAVE");
  if (previousRevisions.length > 0) {
      const previous = previousRevisions[previousRevisions.length - 1];
      if(previous !== editor.innerHTML){
        previousRevisions.push(editor.innerHTML);
      }
  } else{
    previousRevisions.push(editor.innerHTML);
  }
  redoRevisions = [];
  updateUndoRedoButtonEnabled();
}

function undoEdit() {
  if (previousRevisions.length > 1) {
      let content = previousRevisions.pop();
      if(content === editor.innerHTML){
        // Pop again, since we do not want to revert to the current state, but the state before
        content = previousRevisions.pop();
      }
      redoRevisions.push(editor.innerHTML);
      editor.innerHTML = content;
  }
  updateUndoRedoButtonEnabled();
}

function redoEdit() {
//    console.log("REDO", redoRevisions.length, redoRevisions);
  if (redoRevisions.length > 0) {
      const content = redoRevisions.pop();
      previousRevisions.push(editor.innerHTML);
      editor.innerHTML = content;
  }
  updateUndoRedoButtonEnabled();
}


function pasteAsPlainText(event) {
  event.preventDefault();
  // event.target.innerText = event.clipboardData.getData("text/plain");
  document.execCommand('insertText', false, event.clipboardData.getData("text/plain"));
}


// Stuff that needs to run on load
editor.addEventListener('paste', function (event) {
  pasteAsPlainText(event);
});

editor.addEventListener("keydown", (ev) => {
console.log(ev)
if (ev.ctrlKey && ev.key === 'z') {
    ev.preventDefault();
    undoEdit();
  } else if (ev.ctrlKey && ev.key === 'y') {
    ev.preventDefault();
    redoEdit();
  } else if(ev.key !== "Control" && ev.key !== "Shift" && ev.key !== "Alt"
         && ev.key !== "ArrowLeft" && ev.key !== "ArrowRight" && ev.key !== "ArrowUp" && ev.key !== "ArrowDown"){
    // Only run on real changes
    const processChange = debounce(() => saveState());
    processChange();
  }
})

formatContents();