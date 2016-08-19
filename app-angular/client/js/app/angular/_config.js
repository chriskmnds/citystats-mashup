(function() {
  'use strict';
  angular.module('Configuration', [])
    .constant('CONFIG', {
      nodeApiBaseUrl: 'http://localhost:3000/api',
      appTitle: 'CityStats Mashup',
      appVersion: '0.0.2'
    });
})();
