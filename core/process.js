module.exports = {

  process: function (job, done) {
    console.log('Processing job', job.data);

    for (var i = 0; i < job.data.images.length; i++) {
      var img = job.data.images[i];

      job.progress(i + 1, job.data.images.length);
    }

    done();
  }

};