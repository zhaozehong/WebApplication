﻿define(['services/datacontext', 'durandal/plugins/router'],
  function (datacontext, router) {
    var session = ko.observable();
    var rooms = ko.observable();
    var tracks = ko.observable();
    var timeSlots = ko.observable();

    var activate = function (routeData) {
      var id = parseInt(routeData.id);
      initLookups();
      return datacontext.getSessionById(id, session);
    };

    var initLookups = function () {
      rooms(datacontext.lookups.rooms);
      tracks(datacontext.lookups.tracks);
      timeSlots(datacontext.lookups.timeslots);
    };

    var goBack = function () {
      router.navigateBack();
    };
    var vm = {
      activate: activate,
      goBack: goBack,
      rooms: rooms,
      tracks: tracks,
      timeSlots: timeSlots,
      session: session,
      title: 'Session Details'
    };
    return vm;
  });