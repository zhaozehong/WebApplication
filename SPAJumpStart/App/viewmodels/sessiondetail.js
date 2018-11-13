define(['services/datacontext',
  'durandal/plugins/router',
  'durandal/system',
  'durandal/app',
  'services/logger'],
  function (datacontext, router, system, app, logger) {
    var session = ko.observable();
    var rooms = ko.observable();
    var tracks = ko.observable();
    var timeSlots = ko.observable();
    var isSaving = ko.observable(false);
    var isDeleting = ko.observable(false);

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

    var deleteSession = function () {
      var msg = 'Delete session "' + session().title() + '" ?';
      var title = 'Confirm Delete';
      isDeleting(true);
      return app.showMessage(msg, title, ['Yes', 'No'])
        .then(confirmDelete);

      function confirmDelete(selectedOption) {
        if (selectedOption === 'Yes') {
          session().entityAspect.setDeleted(); // delete an entity
          save().then(success).fail(failed).fin(finish);

          function success() {
            router.navigateTo('#/sessions');
          }
          function failed(error) {
            cancel();
            var errorMsg = 'Error: ' + error.message;
            logger.logError(errorMsg, error, system.GetModuleId(vm), true);
          }
          function finish() {
            return selectedOption;
          }
        }
      }
    };
    var canDeactivate = function () {
      if (hasChanges()) {
        var title = 'Do you want to leave "' + session().title() + '"?';
        var msg = "Navigate and cancel your changes?";
        var answers = ['Yes', 'No'];
        return app.showMessage(title, msg, answers)
        .then(confirm);

        function confirm(selectedOption) {
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
      deleteSession: deleteSession,
      canSave: canSave,
      hasChanges: hasChanges,
      session: session,
      title: 'Session Details'
    };
    return vm;
  });