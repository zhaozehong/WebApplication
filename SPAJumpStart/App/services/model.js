define(function () {
  var imageSettings = {
    imageBasePath: '../content/images/photos/',
    unknownPersonImageSource: 'unknown_person.jpg'
  };
  var SpeakerPartial = function (dto) {
    // Map to observables and add computeds
    return addSpeakerPartialComputeds(mapToObservable(dto));
  };
  var model = {
    SpeakerPartial: SpeakerPartial,
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
  function makeImageName(source) {
    return imageSettings.imageBasePath +
      (source || imageSettings.unknownPersonImageSource);
  }
  //#endregion
});