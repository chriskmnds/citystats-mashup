(function() {
  'use strict';
  angular.module('Configuration', [])
    .constant('CONFIG', {
      nodeApiBaseUrl: '%NODE_API_BASE_URL%',
      appTitle: '%APP_TITLE%',
      appVersion: '%APP_VERSION%'
    });
})();
