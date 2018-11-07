define(['services/datacontext'], function (datacontext) {
  var sessions = ko.observableArray();
  var vm = {
    activate: activate,
    sessions: sessions,
    title: 'Sessions',
    refresh: refresh
  };
  return vm;

  function activate() {
    // go get local data, if we have it
    return datacontext.getSessionPartials(sessions);
  }
  function refresh() {
    return datacontext.getSessionPartials(sessions, true);
  }
});