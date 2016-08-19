// Stats controller that holds tools needed by the chart and stats table only.
function StatsCtrl($rootScope, $scope, $timeout) {
  'use strict';

  var statsVm = this;

  /*
  // Variable to hold the ID of the entity selected. Not used.
  statsVm.statsEntitySelected = null;

  statsVm.statsEntityClicked = function(id) {
    statsVm.statsEntitySelected = Workgroup.entities.find(id);
  }
  */

  statsVm.displayTools = {
    showStats: false,
    showStatsChartLabel: false
  };

  // The group ID and value representing a rectangle in the chart
  // These are hard coded in the HTML (attrs of rect) and passed here when a rectangle is clicked
  statsVm.chartSelection = {
    groupID: -1,
    value: 0
  };

  // Callback for when a rectangle in the bar chart is clicked
  statsVm.rectClicked = function(id, value) {
    statsVm.chartSelection.groupID = parseInt(id);
    statsVm.chartSelection.value = value;
    statsVm.displayTools.showStatsChartLabel = true;
    $scope.$digest();
  };

  // Fade in on page load
  statsVm.statsLoadInit = function() {
    $timeout(function() { statsVm.displayTools.showStats = true; }, 700);
  };

  // Set a context for the chart (used for clicking/coloring rects)
  //BarChart.prototype.context = statsVm;
  angular.extend($rootScope.context, statsVm);
}

StatsCtrl.$inject = ['$rootScope', '$scope', '$timeout'];
angular.module('myapp').controller('StatsCtrl', StatsCtrl);
