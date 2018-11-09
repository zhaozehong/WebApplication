define(['config'], function (config) {
  var imageSettings = config.imageSettings;
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

  function sessionInitializer(session) {
    session.tagsFormatted = ko.computed(function () {
      var text = session.tags();
      return text ? text.replace(/\|/g) : text;
    });
  };
  function personInitializer(person) {
    person.fullName = ko.computed(function () {
      return person.firstName() + ' ' + person.lastName();
    });
    person.imageName = ko.computed(function () {
      return imageSettings.imageBasePath + (person.imageSource() || imageSettings.unknownPersonImageSource);
    });
  };
  function timeSlotInitializer(timeSlot) {
    timeSlot.name = ko.computed(function () {
      return timeSlot.start() ? moment.utc(timeSlot.start()).format('ddd hh:mm a') : '';
    });
  };
  //#endregion
});