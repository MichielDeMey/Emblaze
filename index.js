/**
 * Module dependencies.
 */
var queue       = require('./core/queue.js');

var express     = require('express');
var bodyParser  = require('body-parser');
var multiparty  = require('multiparty');
var util        = require('util');
var format      = util.format;

var app = module.exports = express();
app.use(bodyParser());

app.use(function(req, res, next) {

  // Send all multipart POST requests over to multiparty for parsing
  if(req.method === 'POST' && req.headers['content-type'].indexOf("multipart/form-data") !== -1){
    var form = new multiparty.Form({
      uploadDir: './uploads'
    });
    form.parse(req, function(err, fields, files){
      req.files = files;
      next();
    });

  }
  else next();

});


app.get('/', function(req, res) {
  res.send('<form method="post" enctype="multipart/form-data">'
    + '<p>Image: <input type="file" name="image" multiple/></p>'
    + '<p><input type="submit" value="Upload" /></p>'
    + '</form>');
});

app.post('/', function(req, res, next) {

  console.log('[File Upload] - ', util.inspect(req.files));

  var images = req.files.image;

  // Queue the images
  queue.queueJob(images);

  // Calculate the size of the uploaded images
  var size = 0;
  for (var i = images.length - 1; i >= 0; i--) {
    var img = images[i];
    size += img.size;
  }

  // the uploaded file can be found as `req.files.image` and the
  // title field as `req.body.title`
  res.send(format('\nuploaded %s (%d Kb) to %s',
    images.length + ' files',
    size / 1024 | 0,
    '/uploads'));
});

if (!module.parent) {
  app.listen(3000);
  console.log('Express started on port 3000');
}