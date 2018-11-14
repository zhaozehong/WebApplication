define(['config', 'durandal/system', 'services/logger'],
  function (config, system, logger) {
    var imageSettings = config.imageSettings;
    var nulloDate = new Date(1900, 0, 1);
    var referenceCheckValidator;
    var orderBy = {
      speaker: 'firstName, lastName',
      session: 'timeSlotId, level, speaker.firstName'
    };
    var entityNames = {
      speaker: 'Person',
      session: 'Session',
      room: 'Room',
      track: 'Track',
      timeSlot: 'TimeSlot'
    };

    var model = {
      applySessionValidators: applySessionValidators,
      configureMetadataStore: configureMetadataStore,
      createNullos: createNullos,
      entityNames: entityNames,
      orderBy: orderBy
    };
    return model;

    //#region Internal Methods
    function configureMetadataStore(metadataStore) {
      // ZEHONG: must be "Session", "Person" & "TimeSlot". Using "session", "person" & "timeslot" doesn't work
      // ZEHONG: Breeze will track any properties in the Ctor function, but will not track properties created in the initializer
      // ZEHONG: isPartial property must be defined here, or the application will not work(cannot find isPartial when create entity during mapDtosToEntities method)
      metadataStore.registerEntityTypeCtor('Session', function () { this.isPartial = false; }, sessionInitializer);
      metadataStore.registerEntityTypeCtor('Person', function () { this.isPartial = false; }, personInitializer);
      metadataStore.registerEntityTypeCtor('TimeSlot', null, timeSlotInitializer);

      referenceCheckValidator = createReferenceCheckValidator();
      breeze.Validator.register(referenceCheckValidator);
      log('Validators registered');
    }
    function createReferenceCheckValidator() {
      var name = 'realReferenceObject';
      var ctx = { messageTemplate: 'Missing %displayName%' };
      var val = new breeze.Validator(name, valFunction, ctx);
      log('Validators created');
      return val;

      function valFunction(value, context) {
        return value ? value.id() !== 0 : true;
      }
    }
    function applySessionValidators(metadataStore) {
      var types = ['room', 'track', 'timeSlot', 'speaker'];
      types.forEach(addValidator);

      function addValidator(propertyName) {
        var sesssionType = metadataStore.getEntityType('Session');
        sesssionType.getProperty(propertyName).validators.push(referenceCheckValidator);

      }
    }
    function createNullos(manager) {
      var unchanged = breeze.EntityState.Unchanged;

      createNullo(entityNames.timeSlot, { start: nulloDate, isSessionSlot: true });
      createNullo(entityNames.room);
      createNullo(entityNames.track);
      createNullo(entityNames.speaker, { firstName: '[Select a person]' });

      function createNullo(entityName, values) {
        var initialValues = values
          || { name: '[Select a ' + entityName.toLowerCase() + ']' };
        return manager.createEntity(entityName, initialValues, unchanged);
      }
    }
    function sessionInitializer(session) {
      session.tagsFormatted = ko.computed(function () {
        var text = session.tags();
        return text ? text.replace(/\|/g) : text;
      });
    }
    function personInitializer(person) {
      person.fullName = ko.computed(function () {
        var fistName = person.firstName();
        var lastName = person.lastName();
        return lastName ? fistName + ' ' + lastName : fistName;
      });
      person.imageName = ko.computed(function () {
        return makeImageName(person.imageSource());
      });
    }
    function timeSlotInitializer(timeSlot) {
      timeSlot.name = ko.computed(function () {
        var start = timeSlot.start();
        var value = ((start - nulloDate) === 0) ?
          '[Select a timeslot]' :
          (start && moment.utc(start).isValid()) ?
            moment.utc(start).format('ddd hh:mm a') : '[Unknown]';
        return value;
      });
    }

    function makeImageName(source) {
      return imageSettings.imageBasePath +
          (source || imageSettings.unknownPersonImageSource);
    }
    function log(msg, data, showToast) {
      logger.log(msg, data, system.getModuleId(model), showToast);
    }
    //#endregion
  });