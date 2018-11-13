define(['services/datacontext', 'durandal/plugins/router'],
  function (datacontext, router) {
    var sessions = ko.observableArray();
    var activate = function () {
      // go get local data, if we have it
      return datacontext.getSessionPartials(sessions);
    }
    var deactivate = function () {
      sessions([]); // clear cached sessions
    }
    var refresh = function () {
      return datacontext.getSessionPartials(sessions, true);
    }

    var gotoDetails = function (selectedSession) {
      if (selectedSession && selectedSession.id()) {
        var url = '#/sessiondetail/' + selectedSession.id();
        router.navigateTo(url);
      }
    };
    var viewAttached = function (view) {
      bindEventToList(view, '.session-brief', gotoDetails);
    };
    var bindEventToList = function (rootSelector, selector, callback, eventName) {
      var eName = eventName || 'dblclick';
      $(rootSelector).on(eName, selector, function () {
        var session = ko.dataFor(this);
        callback(session);
        return false;
      });
    };

    var vm = {
      activate: activate,
      deactivate: deactivate,
      refresh: refresh,
      sessions: sessions,
      title: 'Sessions',
      viewAttached: viewAttached
    };
    return vm;
  });