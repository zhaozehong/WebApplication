define(['durandal/system', 'services/logger', 'durandal/plugins/router', 'config'],
    function (system, logger, router, config) {
      var shell = {
        activate: activate,
        router: router
      };
      return shell;

      function activate() {
        logger.log('CodeCamper JumpStart Loaded!', null, system.getModuleId(shell), true);
        router.map(config.routers);
        return router.activate(config.startModule);
      }
    }
);