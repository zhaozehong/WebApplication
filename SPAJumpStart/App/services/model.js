define(['config'], function (config) {
  var imageSettings = config.imageSettings;
  var nulloDate = new Date(1900, 0, 1);
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
  //#endregion
});