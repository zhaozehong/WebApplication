define(function () {
  toastr.options.timeOut = 4000;
  toastr.options.positionClass = 'toast-bottom-right';

  var imageSettings = {
    imageBasePath: '../content/images/photos/',
    unknownPersonImageSource: 'unknown_person.jpg'
  };

  var remoteServiceName = 'api/breeze';
  //var appTitle = 'CCJS';
  var routes = [{
    url: 'sessions',
    moduleId: 'viewmodels/sessions',
    name: 'Sessions',
    visible: true,
    //caption: 'Sessions',
    //settings: { caption: '<i class="icon-book"></i> Sessions' }
  }, {
    url: 'speakers',
    moduleId: 'viewmodels/speakers',
    name: 'Speakers',
    visible: true,
    //caption: 'Speakers',
    //settings: { caption: '<i class="icon-user"></i> Speakers' }
  }, {
    url: 'sessiondetail/:id',
    moduleId: 'viewmodels/sessiondetail',
    name: 'Edit Session',
    visible: false
    //caption: 'Edit Session',
  }, {
    url: 'sessionadd',
    moduleId: 'viewmodels/sessionadd',
    name: 'Add Session',
    visible: false,
    caption: 'Add Session',
    settings: { admin: true }
  }];

  var startModule = 'sessions';

  return {
    imageSettings: imageSettings,
    routes: routes,
    startModule: startModule,
    remoteServiceName: remoteServiceName
    //appTitle: appTitle,
    //debugEnabled: ko.observable(true),
  };
});