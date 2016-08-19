angular.module('myapp')
.controller('BaseCtrl', function($rootScope, $scope, $state, CONFIG) {
  'use strict';
  $scope.ctrlName = 'BaseCtrl';
  $scope.state = $state;
  $scope.pageTitle = CONFIG.appTitle;
  $rootScope.context = {};
});
