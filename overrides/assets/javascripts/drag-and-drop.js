const isAdvancedUpload = function() {
  const div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}();

function handle_file_select( evt ) {
    let fl_files = evt.target.files; // JS FileList object
    process_file(fl_files[0]);
}


function process_file(file){

    const reader = new FileReader(); // built in API

    const display_file = ( e ) => { // set the contents of the <textarea>
        console.info( '. . got: ', e.target.result.length, e );
        const text = e.target.result;
        const highlighted = syntaxHighlight(text);
        document.getElementById('upload_file_presentation').innerHTML = highlighted;
        document.getElementById('upload_file').innerHTML = e.target.result;
    };

    const on_reader_load = ( fl ) => {
        return display_file;
    };

    // Closure to capture the file information.
    reader.onload = on_reader_load( file );

    // Read the file as text.
    reader.readAsText( file );
}

function initDragAndDrop(){
    uploadForm = document.querySelector('.box');
    if (isAdvancedUpload) {
      uploadForm.classList.add('has-advanced-upload');

      uploadForm.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadForm.classList.add('is-dragover');
      });

      uploadForm.addEventListener('dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadForm.classList.add('is-dragover');
      });

      uploadForm.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadForm.classList.remove('is-dragover');
      })

      uploadForm.addEventListener('dragend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadForm.classList.remove('is-dragover');
      })

      uploadForm.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadForm.classList.remove('is-dragover');
      })

      uploadForm.addEventListener('drop', function(e, b) {
        process_file(e.dataTransfer.files[0])
      });
    }

    uploadForm.addEventListener( 'change', handle_file_select, false );
    uploadForm.addEventListener( 'submit', handle_file_select, false );

}
