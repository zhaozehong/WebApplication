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
      return $.ajax(options).then(querySucceeded).fail(queryFailed);

      // handler the ajax callback
      function querySucceeded(data) {
        var speakers = [];
        data.sort(sortSpeakers);
        data.forEach(function (item) {
          var s = new model.SpeakerPartial(item);
          speakers.push(s);
        });
        speakersObservable(speakers);
        log('Retireved [Speakers Partials] from remote data source', speakers, true);
      }
    };
    var getSessionsPartials = function (sessionsObservable) {
      // reset the observable
      sessionsObservable([]);

      // set ajax call
      var options = {
        url: '/api/sessions',
        type: 'GET',
        dataType: 'json'
      };

      // make call
      return $.ajax(options).then(querySucceeded).fail(queryFailed);

      // handler the ajax callback
      function querySucceeded(data) {
        var sessions = [];
        data.sort(sortSessions);
        data.forEach(function (item) {
          var s = new model.SessionPartial(item);
          sessions.push(s);
        });
        sessionsObservable(sessions);
        log('Retireved [Sessions Partials] from remote data source', sessions, true);
      }
    };
    var dataservice = {
      getSpeakersPartials: getSpeakersPartials,
      getSessionsPartials: getSessionsPartials
    };
    return dataservice;

    // #region Internal methods
    function sortSpeakers(s1, s2) {
      return s1.firstName + s1.lastName > s2.firstName + s2.lastName ? 1 : -1;
    }
    function sortSessions(s1, s2) {
      if (s1.timeSlotStart === s2.timeSlotStart) {
        return s1.speakerFirstName + s1.speakerLastName > s2.speakerFirstName + s2.speakerLastName ? 1 : -1;
      } else {
        return s1.timeSlotStart > s2.timeSlotStart ? 1 : -1;
      }
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