define(function () {
  var imageSettings = {
    imageBasePath: '../content/images/photos/',
    unknownPersonImageSource: 'unknown_person.jpg'
  };
  var SpeakerPartial = function (dto) {
    // Map to observables and add computeds
    return addSpeakerPartialComputeds(mapToObservable(dto));
  };
  var SessionPartial = function (dto) {
    // Map to observables and add computeds
    return addSessionPartialComputeds(mapToObservable(dto));
  };
  var model = {
    SpeakerPartial: SpeakerPartial,
    SessionPartial: SessionPartial
  };
  return model;

  //#region Internal Methods
  function mapToObservable(dto) {
    var mapped = {};
    for (prop in dto) {
      if (dto.hasOwnProperty(prop)) {
        mapped[prop] = ko.observable(dto[prop]);
      }
    }
    return mapped;
  };
  function addSpeakerPartialComputeds(entity) {
    entity.fullName = ko.computed(function () {
      return entity.firstName() + ' ' + entity.lastName;
    });
    entity.imageName = ko.computed(function () {
      return makeImageName(entity.imageSource());
    });
    return entity;
  };
  function addSessionPartialComputeds(entity) {
    entity.speakerImageName = ko.computed(function () {
      return makeImageName(entity.speakerImageSource());
    });
    entity.speakerFullName = ko.computed(function () {
      return entity.speakerFirstName() + ' ' + entity.speakerLastName();
    });
    entity.timeSlotName = ko.computed(function () {
      return entity.timeSlotStart() ? moment.utc(entity.timeSlotStart()).format('ddd hh:mm a') : '';
    });
    entity.tagsFormatted = ko.computed(function () {
      var text = entity.tags();
      return text ? text.replace(/\|/g) : text;
    });
    return entity;
  };
  function makeImageName(source) {
    return imageSettings.imageBasePath +
      (source || imageSettings.unknownPersonImageSource);
  }
  //#endregion
});