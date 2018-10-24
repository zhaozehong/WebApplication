// AJAX via jQuery
define(['services/logger', 'durandal/system', 'services/model'],
  function (logger, system, model) {
    var getSpeakersPartials = function (speakersObservable) {
      // reset the observable
      speakersObservable([]);

      // set ajax call
      var options = {
        url: '/api/speakers',
        type: 'GET',
        dataType: 'json'
      };

      // make call
      return $.ajax(options)
        .then(querySucceeded)
        .fail(queryFailed);

      // handler the ajax callback
      function querySucceeded(data) {
        var speakers = [];
        data.sort(sortSpeakers);
        data.forEach(function (item) {
          var s = new model.SpeakerPartial(item);
          speakers.push(s);
        });
        speakersObservable(speakers);
        log('Retireved speakers partials from remote data source', speakers, true);
      }
    };
    var dataservice = {
      getSpeakersPartials: getSpeakersPartials
    };
    return dataservice;

    // #region Internal methods

    function sortSpeakers(s1, s2) {
      return s1.firstName + s1.lastName > s2.firstName + s2.lastName
        ? 1 : -1;
    }
    function queryFailed(jqXHR, textStatus) {
      var msg = 'Error getting data. ' + textStatus;
      logger.log(msg, jqXHR, system.getModuleId(dataservice), true);
    }
    function log(msg, data, showToast) {
      logger.log(msg, data, system.getModuleId(dataservice), showToast);
    }
    //#endregion
  });