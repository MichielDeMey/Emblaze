var kue       = require('kue');
var jobs      = kue.createQueue({ disableSearch: true });
var process   = require('./process.js');

kue.app.set('title', 'Emblaze Queue');
kue.app.listen(3001);
console.log('Kue listening on port', 3001);

module.exports = {

  queueJob: function (images) {
    console.log('Queing images', images);

    // Extract the image paths
    var imagePaths = [];
    for (var i = images.length - 1; i >= 0; i--) {
      var img = images[i];
      imagePaths.push(img.path);
    }

    var job = jobs.create('process-image', {
        title: 'Render an animated gif',
        images: imagePaths,
        template: 'swipe-up-down'
    });

    // Event callbacks
    job.on('complete', function(){
      console.log("Job complete");
    }).on('failed', function(){
      console.log("Job failed");
    }).on('progress', function(progress){
      console.log('\r  job #' + job.id + ' ' + progress + '% complete');
    });

    // Save this job to Redis
    job.save();

    this.processJobs();
  },

  processJobs: function () {
    jobs.process('process-image', function(job, done){
      process.process(job, done);
    });
  }

};