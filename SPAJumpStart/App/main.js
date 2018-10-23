require.config({
  paths: { "text": "durandal/amd/text" }
});

define(function (require) {
  var system = require('durandal/system'),
      app = require('durandal/app'),
      viewLocator = require('durandal/viewLocator');

  system.debug(true);
  app.start().then(function () {
    viewLocator.useConvention();
    app.setRoot('viewmodels/shell');
  });
});