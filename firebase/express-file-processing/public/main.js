const worker = new Worker('fileupload.js');
function sendRequest(event) {
  event.preventDefault();
  const fileInput = document.getElementById('fileToUpload');
  worker.postMessage(fileInput.files[0]);
}

worker.onmessage = function(e) {
  console.log('worker-onmessage', e.data);
};

worker.onerror = function(error) {
  console.log('Worker error: ' + error.message + '\n');
  throw error;
};
