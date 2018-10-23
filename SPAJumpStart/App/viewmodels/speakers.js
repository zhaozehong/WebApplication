define(function () {
  var vm = {
    activate: activate,
  };
  return vm;

  function activate() {
    logger.log('Speakers Loaded!', null, system.getModuleId(vm), true);
  }
});