define(['services/datacontext', 'durandal/plugins/router', 'durandal/app'],
  function (datacontext, router, app) {
    var session = ko.observable();
    var rooms = ko.observable();
    var tracks = ko.observable();
    var timeSlots = ko.observable();
    var isSaving = ko.observable(false);

    var activate = function (routeData) {
      var id = parseInt(routeData.id);
      initLookups();
      return datacontext.getSessionById(id, session);
    };

    var initLookups = function () {
      rooms(datacontext.lookups.rooms);
      tracks(datacontext.lookups.tracks);
      timeSlots(datacontext.lookups.timeslots);
    };

    var goBack = function () {
      router.navigateBack();
    };

    var hasChanges = ko.computed(function () {
      return datacontext.hasChanges();
    });

    var cancel = function () {
      datacontext.cancelChanges();
    };
    var save = function () {
      isSaving(true);
      return datacontext.saveChanges().fin(complete); // ZEHONG?: what is fin?

      function complete() {
        isSaving(false);
      };
    };
    var canSave = ko.computed(function () {
      return hasChanges() && !isSaving();
    });
    var canDeactivate = function () {
      if (hasChanges()) {
        var title = 'Do you want to leave "' + session().title() + '"?';
        var msg = "Navigate and cancel your changes?";
        var answers = ['Yes', 'No'];
        return app.showMessage(title, msg, answers)
        .then(configm);

        function configm(selectedOption) {
          if (selectedOption == 'Yes') {
            cancel();
          }
          return selectedOption;
        };
      }
      return true;
    };
    var vm = {
      activate: activate,
      canDeactivate: canDeactivate,
      goBack: goBack,
      rooms: rooms,
      tracks: tracks,
      timeSlots: timeSlots,
      cancel: cancel,
      save: save,
      canSave: canSave,
      hasChanges: hasChanges,
      session: session,
      title: 'Session Details'
    };
    return vm;
  });