// Stats controller that holds tools needed by the chart and stats table only.

app.controller('stats', ['$scope', 'srv', 'workgroup', '$timeout', function($scope, srv, workgroup, $timeout) {
	
	// Set a context for the chart (used for clicking/coloring rects)
	BarChart.prototype.context = $scope;
	
	
	/*
	// Variable to hold the ID of the entity selected. Not used.
	$scope.statsEntitySelected = null;
	
	$scope.statsEntityClicked = function(id) {
		$scope.statsEntitySelected = workgroup.entities.find(id);
	}
	*/
	
	$scope.displayTools = {
		showStats: false,
		showStatsChartLabel: false
	}
	
	// The group ID and value representing a rectangle in the chart
	// These are hard coded in the HTML (attrs of rect) and passed here when a rectangle is clicked
	$scope.chartSelection = {
		groupID: -1,
		value: 0
	}
	
	// Callback for when a rectangle in the bar chart is clicked
	$scope.rectClicked = function(id, value) {
		$scope.chartSelection.groupID = parseInt(id);
		$scope.chartSelection.value = value;
		$scope.displayTools.showStatsChartLabel = true;
		$scope.$digest();
	}

	// Fade in on page load
	$scope.statsLoadInit = function() {
		$timeout(function() { $scope.displayTools.showStats = true; }, 700);
	}
	
} ]);