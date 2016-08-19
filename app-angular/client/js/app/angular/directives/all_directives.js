// Directive for displaying a list of cities to explore
function UtilsSelectWidget(CONFIG) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/' + CONFIG.appVersion + '/directives/utils_tooltip.html'
  };
}

UtilsSelectWidget.$inject = ['CONFIG'];
angular.module('myapp').directive('utilsSelectWidget', UtilsSelectWidget);

// Directive for displaying utilites when a node is clicked
function UtilsNodeWidget(CONFIG) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/' + CONFIG.appVersion + '/directives/node_tooltip.html'
  };
}

UtilsNodeWidget.$inject = ['CONFIG'];
angular.module('myapp').directive('utilsNodeWidget', UtilsNodeWidget);

// Directive for the main stats table
function StatsDetailsWidget(CONFIG) {
  'use strict';
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/' + CONFIG.appVersion + '/directives/stats_details.html'
  };
}

StatsDetailsWidget.$inject = ['CONFIG'];
angular.module('myapp').directive('statsDetailsWidget', StatsDetailsWidget);