define(['services/datacontext'], function (datacontext) {
  var speakers = ko.observableArray();
  var vm = {
    activate: activate,
    speakers: speakers,
    title: 'Speakers',
    refresh: refresh
  };
  return vm;

  function activate() {
    // go get local data, if we have it
    return datacontext.getSpeakerPartials(speakers);
  }
  function refresh() {
    return datacontext.getSpeakerPartials(speakers, true);
  }
});