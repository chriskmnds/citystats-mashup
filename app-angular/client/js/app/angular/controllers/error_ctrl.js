angular.module('myapp')
.controller('ErrorCtrl', function($scope, $rootScope, $stateParams) {
  'use strict';
  $rootScope.pageTitle = 'Application Error Handler';
  $scope.errorMessage = $stateParams.err;

});
