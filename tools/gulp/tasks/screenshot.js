// Create sceenshots
// - sometimes screenshots are blank (when WebGL is used, when render starts on mouse scroll, etc)
// - this 'sometimes' means ~50% of cases ...
// - the script sometimes doesn't stops, ctrl+c must be used


// Plugins
var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    onError = require('../utils/onError'),
    getJSONData = require('../utils/getJSONData'),

    data = require('gulp-data'),
    fs = require('fs'),
    webshot = require('webshot'),
    path = require('path'),
    titleize = require('titleize');


// Configuration
var paths = require('./../config');



// URL to filename
// - http://showroom.littleworkshop.fr/ => showroom.littleworkshop
var urlToFilename = function(url) {
  var ret = url.replace('http://', '');
  ret = ret.replace('https://', '');
  ret = ret.replace('www.', '');
  ret = ret.replace('/', '');
  ret = ret.replace(/\./g, '-');
  return ret;
}


// Filename to title
// - abscreenwear-com => Abscreenwear
var fileNameToTitle = function(fileName) {
  var s = fileName.replace(/-/g, ' ');
  s = s.split(' ');
  s = s.slice(0, s.length - 1).join(" ");
  return titleize(s);
}


// Create single screenshot for an url
var makeScreenshot = function(url, options, suffix, folder) {
  var fileName = urlToFilename(url);
  var dest = folder + fileName + '-' + suffix + '.png';
  webshot(url, dest, options, function(err) {
    console.log('Creating ' + dest);
  });
}


// Create multiple screenshots for an url
// - for portrait, landscape
var makeScreenshots = function(url, sizes, folder) {
  for (var i = 0; i < sizes.length; i++) {
    var options = {
      screenSize: {
        width: sizes[i].width,
        height: sizes[i].height
      },
      renderDelay: 20000,
      timout: 30000
    }
    makeScreenshot(url, options, sizes[i].suffix, folder);
  }
}


// Create screenshots for a list of urls
var screenshots = function(urls, sizes, folder) {
  for (var i = 0; i < urls.length; i++) {
    makeScreenshots(urls[i], sizes, folder);
  }
}


// Create an 'images' JSON descriptor from a list of urls
var jsonImages = function(urls, sizes, folder) {
  dest = folder + 'images.json';
  fs.openSync(dest, 'w');
  json = [];

  for (var i = 0; i < urls.length; i++) {
    var fileName = urlToFilename(urls[i]);
    var title = fileNameToTitle(fileName);

    var entry = {
      "title": title,
      "name": fileName + '-landscape',
      "responsive": [
        {
          "breakpoint": "mobile",
          "name": fileName + '-portrait'
        },
        {
          "breakpoint": "tablet",
          "name": fileName + '-portrait'
        }
      ],
      "link": {
        "title": title,
        "url": urls[i],
        "type": "external"
      }
    }

    json.push(entry);
  }

  //console.log(JSON.stringify(json));
  fs.appendFileSync(dest, JSON.stringify(json, null, 2));
}


// The main task
gulp.task('screenshot', function() {
  var fileName = process.argv[4];
  var action = process.argv[6]

  if (fileName === undefined || action === undefined) {
    console.log('Usage: gulp screenshot --file <complete-path-to-imagelist-file.json> --action json|screenshots');
  } else {
    return gulp.src(fileName)
      .pipe(plumber({errorHandler: onError}))
      .pipe(data(function(fileName) {
        var data = getJSONData(fileName);
        var folder = path.dirname(fileName.path) + '/@assets/images/';
        if (data) {
          var urls = data.urls;
          var sizes = data.sizes;

          switch (action) {
            case 'json':
              jsonImages(urls, sizes, folder);
              break;
            case 'screenshots':
              screenshots(urls, sizes, folder);
              break;
            default:

          }
        }
      }))
  }
});
