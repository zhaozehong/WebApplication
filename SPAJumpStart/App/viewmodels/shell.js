define(['durandal/system', 'services/logger'],
    function (system, logger) {
      var shell = {
        activate: activate,
      };
      return shell;

      function activate() {
        logger.log('CodeCamper JumpStart Loaded!', null, system.getModuleId(shell), true);
      }
    }
);