define(['durandal/system', 'services/logger', 'durandal/plugins/router', 'config', 'services/datacontext'],
    function (system, logger, router, config, datacontext) {
      var shell = {
        activate: activate,
        router: router
      };
      return shell;

      function activate() {
        datacontext.primeData()
          .then(boot)
          .fail(failedInitialization);
      }
      function boot() {
        logger.log('CodeCamper JumpStart Loaded!', null, system.getModuleId(shell), true);
        router.map(config.routes);
        return router.activate(config.startModule); // ZEHONG: must call router.activate action here, or navigation will not work.
      }
      function failedInitialization(error) {
        var msg = 'App initialization failed: ' + error.message;
        logger.logError(msg, error, system.getModuleId(shell), true);
      }
    }
);