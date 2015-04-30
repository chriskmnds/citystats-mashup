// Main controller that holds page-wide needed variables/methods/etc.

app.controller('main', ['$scope', '$http', 'meta', 'srv', 'workgroup', '$window', '$document', function($scope, $http, meta, srv, workgroup, $window, $document) {
	
	// Set the metadata available in scope
	$scope.appName = meta.name;
	$scope.appAuthor = meta.author;
	$scope.appDescription = meta.description;
			
	// Data lookups for use in views that require the scope
	// plus an additional citiesIndex lookup
	$scope.dataLookup = {
		citiesIndex: {}, // CitisIndex used for retrieving city by ID
		cities: [], // Cities array from srv.data
		population: {}, // Population object from srv.data
		languagesPerLocation: {}, // languagesPerLocation array from srv.data
		naitonalitiesPerLocation: {} // nationalitiesPerLocation array from srv.data
	}
	
	// References to workgroup models for use in views and other scripts
	$scope.modelLookup = {
		groupsActive: workgroup.groupsActive
	}
	
	// References to service variables for use in views and other scripts
	$scope.srvLookup = {
		colorScale: srv.colorScale
	}
	
	// Retrieve data and assign to factory variable
	// This is asynchronous, but does not matter since application can load/function with no data in scope
	$http.get('data.json')
		.success(function(data, status, headers, config) {
			srv.data = data;
			// Create data lookups here
			// Populate citiesIndex
			for (var i = 0, len = srv.data.cities.length; i< len; i++) {
				$scope.dataLookup.citiesIndex[srv.data.cities[i].id] = srv.data.cities[i];
			}
			$scope.dataLookup.cities = srv.data.cities;
			$scope.dataLookup.population = srv.data.population;
			$scope.dataLookup.languagesPerLocation = srv.data.languagesPerLocation;
			$scope.dataLookup.nationalitiesPerLocation = srv.data.nationalitiesPerLocation;
		})
		.error(function(data, status, headers, config) {
			console.log('error loading data.json.');
		});
	
	// Tools needed to render the graph/chart
	$scope.graphingTools = {
		// Retrieve the width of the 'forceGraph' div
		forceWidth: function() {
			// Using the $document service to retrieve width of 'forceGraph'
			// See https://docs.angularjs.org/api/ng/service/$document
			// On page load this is equal to the window size...
			var width = $document[0].getElementById('forceGraph').clientWidth;
			// No larger than 900
			if (width > 900) return 900;
			else return width;
		},
		// Retrieve the width of the 'statsChart' div
		chartWidth: function() {
			// considering 40px padding on statsElement left & right
			//var width = $document[0].getElementById('stats').clientWidth - 40 - $document[0].getElementById('statsDetails').clientWidth;
			var width = $document[0].getElementById('statsChart').clientWidth;
			return width;
		},
		// to use for colorScale domain. would need to be called everytime groupsActive change
		colorScaleDomain: function() {
			var domain = [];
			for (var i = 0, len = workgroup.groupsActive.groups.length; i < len; i++) {
				domain.push(workgroup.groupsActive.groups[i].id);
			}
			return domain;
		}
	}
	
	// ---------------------
	// Color Scale
	// ---------------------
	// Define range for the Color Scale to use in bar rects and graph nodes
	srv.colorScale.range(["#96B566", "#C3C3C3", "#BCE27F", "#7C7C7C", "#F6FF97"]);
	// We set the domain here, although it will be empty at this point
	// Domain is reset every time the chart is rendered and the graph is updated
	// We use graphingTools.colorScaleDomain to define scales dynamically based on groupsActive
	srv.colorScale.domain($scope.graphingTools.colorScaleDomain);
	// ---------------------

		
	// Initialise and render the graph
	// Set width equal to the 'forceGraph' div (see $scope.graphingTools)
	srv.forceGraph = new ForceGraph($scope.graphingTools.forceWidth(), 435, '#forceGraph');
	ForceGraph.render(srv.forceGraph);
	
	// Initialise and render the chart (container and y-axis only)
	srv.statChart = new BarChart($scope.graphingTools.chartWidth(), 300, "#statsChart");//500
	//$scope.renderChart();
	BarChart.init(srv.statChart);
	
	
	// Bind RESIZE event to the $window element
	// See https://docs.angularjs.org/api/ng/service/$window
	// On resize, apply changes to the graph svg, voronoi (if voronoi), force, and chart.
	var resizeChart = true;
	angular.element($window).bind('resize', function () {
		
		// ForceGraph Resize
		var width = $scope.graphingTools.forceWidth();
		srv.forceGraph.width = width;
		srv.forceGraph.svg.attr('width', width);
		//TODO: Unescape this for use with ForceGraphVoronoi (force-app-final-with-voronoi.js)
		//srv.forceGraph.voronoi.clipExtent([[-10, -10], [width+10, srv.forceGraph.height+10]]);
		srv.forceGraph.force.size([width, srv.forceGraph.height]).resume();
		
		// ChartGraph Resize
		srv.statChart = new BarChart($scope.graphingTools.chartWidth(), 300, "#statsChart");//500
		$scope.renderChart();
	});
	
	
	// Callback to render the chart upon model changes
	$scope.renderChart = function() {
	
		if (workgroup.groupsActive.groups.length > 0) {
			
			// Compute data for the chart
			
			var chartData = [];
			
			/* We want the data in this format (where a, b, c are group IDs):			
				[ {name: 'educated', value: [{"a":100}, {"b":150}, {"c":200}]}, 
				  {name: 'uneducated', value: [{"a":200}, {"b":250}, {"c":300}]} ]	
			*/
			
			// for each education level
			for (var i = 0, len = srv.data.educationLevels.length; i < len; i++) {
				var eduName = srv.data.educationLevels[i];
				var eduValue = [];
				// for each active group
				for (var j = 0, len2 = workgroup.groupsActive.groups.length; j < len2; j++) {
					var groupTotal = 0;
					// for each entity in active group
					for (var k = 0, len3 = workgroup.groupsActive.groups[j].entities.length; k < len3; k++) {
						// add to group total
						groupTotal += srv.data.education[workgroup.groupsActive.groups[j].entities[k].id][eduName];
					}
					// Push group result { groupID : group total } to chartData's value array (eduValue)
					var groupResult = {};
					groupResult[workgroup.groupsActive.groups[j].id] = groupTotal;
					eduValue.push(groupResult);
				}	
				// push into chartData the final education level's results
				chartData.push( { name: eduName, value: eduValue } );
			}
			// Render the chart with the new data (will replace previous chart)
			BarChart.render(chartData, srv.statChart);
		} else {
			// Run the init code to clear graph and display only the x/y axes
			BarChart.init(srv.statChart);
		}
	}
	
	// Variable to hold the ID of the city's group when selected
	$scope.statsGroupSelected = null;
	
	// When a node is clicked we need the group languages and nationalities to be computed dynamically
	// to reflect any changes in node grouping/adding/removal etc.
	$scope.statsGroupClicked = function(id) {
		$scope.statsGroupSelected = workgroup.groupsActive.find(id);
		$scope.setGroupLanguages();
		$scope.setGroupNationalities();
	}
	
	// Variable to hold the group languages aggregated via "setGroupLanguages"
	// Best be moved to a convenient object
	// Format: array of objects: {name: "language name", value: 0}
	$scope.groupLanguages = [];
	
	$scope.setGroupLanguages = function() {
		
		var groupLanguages = [];
				
		if ($scope.statsGroupSelected === null) return false;
		
		var group = workgroup.groupsActive.find($scope.statsGroupSelected.id);
		
		if (group === null) return false;
		
		for (var i = 0, len = group.entities.length; i < len; i += 1) {
			
			var entity = group.entities[i];
			var entityLanguages = $scope.dataLookup.languagesPerLocation[entity.id];

			for (var j = 0, len2 = entityLanguages.length; j < len2; j += 1) {
								
				var language = entityLanguages[j];
				var index = arrayObjectIndexOf(groupLanguages, "name", language.name);
				
				if (index !== -1) {
					var inc = groupLanguages[index].value + language.value;
					groupLanguages[index].value = inc; 
				} else {
					groupLanguages.push({name:language.name, value: language.value});
				}
			}
		}
		$scope.groupLanguages = groupLanguages;
		return true;
	}
	
	// Variable to hold the group nationalities aggregated via "setGroupNationalities"
	// Best be moved to a convenient object
	// Format: array of objects: {name: "nationality name", value: 0}
	$scope.groupNationalities = [];
	
	$scope.setGroupNationalities = function() {
		
		var groupNationalities = [];
				
		if ($scope.statsGroupSelected === null) return false;
		
		var group = workgroup.groupsActive.find($scope.statsGroupSelected.id);
		
		if (group === null) return false;
		
		for (var i = 0, len = group.entities.length; i < len; i += 1) {
			
			var entity = group.entities[i];
			var entityNationalities = $scope.dataLookup.nationalitiesPerLocation[entity.id];

			for (var j = 0, len2 = entityNationalities.length; j < len2; j += 1) {
								
				var nationality = entityNationalities[j];
				var index = arrayObjectIndexOf(groupNationalities, "name", nationality.name);
				
				if (index !== -1) {
					var inc = groupNationalities[index].value + nationality.value;
					groupNationalities[index].value = inc; 
				} else {
					groupNationalities.push({name:nationality.name, value: nationality.value});
				}
			}
		}
		$scope.groupNationalities = groupNationalities;
		return true;
	}
	
} ]);