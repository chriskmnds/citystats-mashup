app.controller('stats', ['$scope', 'srv', 'workgroup', '$timeout', function($scope, srv, workgroup, $timeout) {
	
	// Set a context for the chart (used for clicking/coloring rects)
	BarChart.prototype.context = $scope;
	
	$scope.statsEntitySelected = null;
	
	$scope.statsEntityClicked = function(id) {
		$scope.statsEntitySelected = workgroup.entities.find(id);
	}
	
	$scope.displayTools = {
		showStats: false,
		showStatsChartLabel: false
	}
	
	$scope.chartSelection = {
		groupID: -1,
		value: 0
	}
	
	$scope.rectClicked = function(id, value) {
		$scope.chartSelection.groupID = parseInt(id);
		$scope.chartSelection.value = value;
		$scope.displayTools.showStatsChartLabel = true;
		$scope.$digest();
	}

	$scope.statsLoadInit = function() {
		$timeout(function() { $scope.displayTools.showStats = true; }, 700);
	}
	
} ]);