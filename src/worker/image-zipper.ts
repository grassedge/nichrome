declare var postMessage:any;
declare var Promise:any;
var global = self;
importScripts("/public/js/jszip.js");
importScripts("/public/js/promise-3.2.0.js");

var zip = new JSZip();

self.addEventListener('message', function(event) {
    var urls = event.data.urls;
    var promises = urls.map((url) => new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.responseType = "arraybuffer";

        xhr.onload = (event) => {
            var arrayBuffer = xhr.response;
            var filename = url.replace(/^(.*)\//, '');
            zip.file(filename, arrayBuffer, {binary:true});
            postMessage({
                command: 'download',
                filename: filename
            });
            resolve(true);
        };
        xhr.onerror = (event) => { resolve(false) };
        xhr.send();
    }));
    Promise.all(promises).then(() => {
        postMessage({
            command: 'complete',
            blob: zip.generate({type:"blob"})
        });
    });
});
