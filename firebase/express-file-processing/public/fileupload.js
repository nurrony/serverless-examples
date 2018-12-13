console.log('in web worker', self);

self.onmessage = event => {
  uploadFile(event.data);
};
function uploadFile(file) {
  const formData = new FormData();
  console.log('file', file);
  formData.append('avatar', file);
  const request = new XMLHttpRequest();
  request.open('POST', '{gcf-url}', true);
  request.onload = function() {
    const data = JSON.parse(request.responseText);
    if (request.status >= 200 && request.status < 400) {
    } else {
      self.postMessage('error happened');
    }
  };

  request.onerror = function() {
    // There was a connection error of some sort
  };

  request.send(formData);
}
