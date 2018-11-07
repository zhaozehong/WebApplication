define([
  'durandal/system',
  'services/model',
  'config',
  'services/logger',
  'services/breeze.partial-entities'],
  function (system, model, config, logger, partialMapper) {
    var EntityQuery = breeze.EntityQuery;
    var manager = configureBreezeManager(); // ZEHONG: call configureBreezeManager() immediately
    var orderBy = model.orderBy;
    var entityNames = model.entityNames;

    var getSpeakerPartials = function (speakersObservable) {
      // ZEHONG: will cause 'Speakers'(case-insensitive) action of Breeze Controller(manager knows it)
      // "Speakers" is the name of WebApi method
      var query = EntityQuery.from('Speakers')
        .select('id, firstName, lastName, imageSource')
        .orderBy(orderBy.speaker);
      return manager.executeQuery(query)
        .then(querySucceeded)
        .fail(queryFailed);

      // handler the ajax callback
      function querySucceeded(data) {
        var list = partialMapper.mapDtosToEntities(
          manager, data.results, entityNames.speaker, 'id');
        // return data as Knockout observables
        if (speakersObservable) {
          speakersObservable(list);
        }
        log('Retireved [Speakers] from remote data source', data, true);
      }
    };
    var getSessionPartials = function (sessionsObservable) {
      var query = EntityQuery.from('Sessions')
        // ZEHONG?: why must it call partialMapper.mapDtosToEntities() when .select() is applied?
        // I see both .from('Sessions') & .select(...) return EntiryQuery object.
        .select('id, title, code, speakerId, trackId, timeSlotId, roomId, level, tags')
        .orderBy(orderBy.session); // BreezeController.Sessions()
      return manager.executeQuery(query)
        .then(querySucceeded)
        .fail(queryFailed);

      function querySucceeded(data) {
        var list = partialMapper.mapDtosToEntities(
          manager, data.results, entityNames.session, 'id');
        //var list = data.results;
        if (sessionsObservable) {
          sessionsObservable(list);
        }
        log('Retireved [Session] from remote data source', data, true);
      }
    };
    var primeData = function () {
      return Q.all([getLookups(), getSpeakerPartials(null, true)]);
    }

    var datacontext = {
      getSpeakerPartials: getSpeakerPartials,
      getSessionPartials: getSessionPartials,
      primeData: primeData
    };
    return datacontext;

    // #region Internal methods
    function queryFailed(error) {
      var msg = 'Error getting data. ' + error.message;
      logger.log(msg, error, system.getModuleId(datacontext), true);
    }
    function configureBreezeManager() {
      // this makes all of the properties on our objects use camel case.
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