define(['durandal/system', 'services/model', 'config', 'services/logger'],
  function (system, model, config, logger) {
    var EntityQuery = breeze.EntityQuery,
        manager = configureBreezeManager(); // ZEHONG: call configureBreezeManager() immediately

    var getSpeakers = function (speakersObservable) {
      var query = EntityQuery.from('Speakers').orderBy('firstName, lastName'); // ZEHONG: will cause 'Speakers'(case-insensitive) action of Breeze Controller(manager knows it)
      return manager.executeQuery(query)
      .then(querySucceeded)
      .fail(queryFailed);

      // handler the ajax callback
      function querySucceeded(data) {
        if (speakersObservable) {
          speakersObservable(data.results);
        }
        log('Retireved [Speakers] from remote data source', data, true);
      }
    };
    var getSessions = function (sessionsObservable) {
      var query = EntityQuery.from('Sessions').orderBy('timeSlotId, level, speaker.firstName'); // BreezeController.Sessions()
      return manager.executeQuery(query)
      .then(querySucceeded)
      .fail(queryFailed);

      function querySucceeded(data) {
        if (sessionsObservable) {
          sessionsObservable(data.results);
        }
        log('Retireved [Session] from remote data source', data, true);
      }
    };
    var primeData = function () {
      return Q.all([getLookups(), getSpeakers()]);
    }

    var datacontext = {
      getSpeakers: getSpeakers,
      getSessions: getSessions,
      primeData: primeData
    };
    return datacontext;

    // #region Internal methods
    function queryFailed(error) {
      var msg = 'Error getting data. ' + error.message;
      logger.log(msg, error, system.getModuleId(datacontext), true);
    }
    function configureBreezeManager() {
      breeze.NamingConvention.camelCase.setAsDefault();
      var mgr = new breeze.EntityManager(config.remoteServiceName);
      model.configureMetadataStore(mgr.metadataStore);
      return mgr;
    }
    function getLookups() {
      return EntityQuery.from('Lookups') // cause BreezeController.Lookups()
      .using(manager).execute()
      .fail(queryFailed);
    }
    function log(msg, data, showToast) {
      logger.log(msg, data, system.getModuleId(datacontext), showToast);
    }
    //#endregion
  });