﻿define([
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

    var getSpeakerPartials = function (speakersObservable, forceRemote) {
      if (!forceRemote) {
        var p = getLocal('Persons', orderBy.speaker);
        if (p.length > 0) {
          if (speakersObservable) {
            speakersObservable(p);
          }
          return Q.resolve(); // ZEHONG?: why doesn't Q need to be defined in function define?
        }
      }

      // ZEHONG: will cause 'Speakers'(case-insensitive) action of Breeze Controller(manager knows it)
      // "Speakers" is the name of WebApi method
      var query = EntityQuery.from('Speakers')
        .select('id, firstName, lastName, imageSource')
        .orderBy(orderBy.speaker);
      return manager.executeQuery(query) // ZEHONG: executeQuery will cause communication with remote server
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
    var getSessionPartials = function (sessionsObservable, forceRemote) {
      if (!forceRemote) {
        var p = getLocal('Sessions', orderBy.session);
        if (p.length > 3) {
          // Edge case
          // We need this check because we may have 1 entity already.
          // If we start on a specific person, this may happen. So we check
          sessionsObservable(p);
          return Q.resolve();
        }
      }

      var query = EntityQuery.from('Sessions')
        // ZEHONG?: why must it call partialMapper.mapDtosToEntities() when .select() is applied?
        // I see both .from('Sessions') & .select(...) return EntiryQuery object.
        .select('id, title, code, speakerId, trackId, timeSlotId, roomId, level, tags')
        .orderBy(orderBy.session); // BreezeController.Sessions()
      return manager.executeQuery(query) // ZEHONG: executeQuery will cause communication with remote server
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
    var getSessionById = function (sessionId, sessionObservable) {
      // 1st:
      // fetchEntityByKey will look in local cache first (because the 3rd para is true)
      // if not there then it will go remote
      return manager.fetchEntityByKey(entityNames.session, sessionId, true)
        .then(fetchSucceeded)
        .fail(queryFailed);

      // 2nd:
      // refresh the entity from remote store (if needed)
      function fetchSucceeded(data) {
        var s = data.entity;
        return s.isPartial() ? refreshSession(s) : sessionObservable(s);
      }
      function refreshSession(session) {
        return EntityQuery.fromEntities(session)
          .using(manager).execute()
          .then(querySucceeded)
          .fail(queryFailed);
      }
      function querySucceeded(data) {
        var s = data.results[0];
        s.isPartial(false);
        log('Retireved [Session] from remote data source', s, true);
        return sessionObservable(s);
      }
    };
    var cancelChanges = function () {
      manager.rejectChanges();
      log('Canceled change', null, true);
    };
    var saveChanges = function () {
      return manager.saveChanges()
      .then(saveSucceeded)
      .fail(saveFailed);

      function saveSucceeded(saveResult) {
        log('Saved data successfully', saveResult, true);
      };
      function saveFailed(error) {
        var msg = 'Save failed: ' + getErrorMessages(error);
        logError(msg, error);
        error.message = msg;
        throw error;
      };
    };
    var primeData = function () {
      var promise = Q.all([
        getLookups(),
        getSpeakerPartials(null, true)])
        .then(applyValidators);
      return promise.then(success);

      function success() {
        datacontext.lookups = {
          rooms: getLocal('Rooms', 'name', true),
          tracks: getLocal('Tracks', 'name', true),
          timeslots: getLocal('TimeSlots', 'start', true),
          speakers: getLocal('Persons', orderBy.speaker, true)
        };
        log('Primed data', datacontext.lookups);
      }
      function applyValidators() {
        model.applySessionValidators(manager.metadataStore);
      }
    }
    var hasChanges = ko.observable(false);

    var createSession = function () {
      return manager.createEntity(entityNames.session); // create a new entity
    };
    manager.hasChangesChanged.subscribe(function (eventArgs) {
      hasChanges(eventArgs.hasChanges);
    });

    var datacontext = {
      createSession: createSession,
      getSpeakerPartials: getSpeakerPartials,
      getSessionPartials: getSessionPartials,
      getSessionById: getSessionById,
      hasChanges: hasChanges,
      cancelChanges: cancelChanges,
      saveChanges: saveChanges,
      primeData: primeData
    };
    return datacontext;

    // #region Internal methods
    function getLocal(resource, ordering, includeNullos) {
      var query = EntityQuery.from(resource).orderBy(ordering);
      if (!includeNullos) {
        query = query.where('id', '!=', 0);
      }
      return manager.executeQueryLocally(query);
    }
    function getErrorMessages(error) {
      var msg = error.message;
      if (msg.match(/validation error/i)) {
        return getValidationMessages(error);
      }
      return msg;
    }
    function getValidationMessages(error) {
      try {
        // foreach entity with a validation error
        return error.entitiesWithErrors.map(function (entity) {
          // get each validation error
          return entity.entityAspect.getValidationErrors().map(function (valError) {
            // return the error message from the validation
            return valError.errorMessage;
          }).join('; <br/>');
        }).join('; <br/>');
      }
      catch (e) { }
      return 'validation error';
    }
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
        .then(processLookups)
        .fail(queryFailed);
    }
    function processLookups() {
      model.createNullos(manager);
    }
    function log(msg, data, showToast) {
      logger.log(msg, data, system.getModuleId(datacontext), showToast);
    }
    function logError(msg, data) {
      logger.logError(msg, data, system.getModuleId(datacontext), true);
    }
    //#endregion
  });