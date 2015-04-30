app.controller('main', ['$scope', '$http', 'meta', 'srv', 'workgroup', function($scope, $http, meta, srv, workgroup) {
	
	// Set the metadata available in scope
	$scope.appName = meta.name;
	$scope.appAuthor = meta.author;
	$scope.appDescription = meta.description;
			
	// Data lookups for use in views that require the scope
	// plus an additional citiesIndex lookup
	$scope.dataLookup = {
		citiesIndex: {},
		cities: [], 
		population: {},
		languagesPerLocation: {},
		naitonalitiesPerLocation: {}
	}
	
	// References to workgroup models for use in views
	$scope.modelLookup = {
		groupsActive: workgroup.groupsActive
	}
	
	// Initialise and render the graph
	srv.forceGraph = new ForceGraphVoronoi(700, 300, '#forceGraph');
	ForceGraphVoronoi.render(srv.forceGraph);
	
	// Initialise and render the chart (container and y-axis only)
	srv.statChart = new BarChart(500, 300, "#statsChart");
	BarChart.init(srv.statChart);
	
		
	// Retrieve data and assign to factory variable
	$http.get('data.json')
		.success(function(data, status, headers, config) {
			srv.data = data;
			// Create data lookups here
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
	
	
	// Callback to render the chart upon graph changes (from graph controller)
	$scope.renderChart = function() {
	
		//return true;
	
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
	
	
	$scope.statsGroupSelected = null;
	
	$scope.statsGroupClicked = function(id) {
		$scope.statsGroupSelected = workgroup.groupsActive.find(id);
		$scope.setGroupLanguages();
	}
	
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
	
} ]);

app.controller('chart', ['$scope', 'srv', 'workgroup', function($scope, srv, workgroup) {

	
} ]);


app.controller('statsDetails', ['$scope', 'srv', 'workgroup', function($scope, srv, workgroup) {
	$scope.statsEntitySelected = null;
	
	$scope.statsEntityClicked = function(id) {
		$scope.statsEntitySelected = workgroup.entities.find(id);	
	}
} ]);


app.controller('graph', ['$scope', 'srv', 'workgroup', function($scope, srv, workgroup) {
	
	$scope.entitySelected = null;
	
	$scope.tooltipTools = {
		init: true,
		utils: false,
		node: false,
		timesOpened: 0
	}
	
	$scope.utilsClicked = function(e) {
		$scope.tooltipTools.init = false;
		$scope.tooltipTools.node = false;
		$scope.tooltipTools.timesOpened = $scope.tooltipTools.timesOpened + 1;
		$scope.tooltipTools.utils = true;
	}
	
	$scope.nodeClicked = function(id) {
		$scope.tooltipTools.utils = false;
		$scope.tooltipTools.node = true;
		$scope.entitySelected = workgroup.entities.find(id);
		$scope.statsGroupClicked($scope.entitySelected.group.id);
		$scope.$apply();
	}
	
	// Set a context for the graph (used for clicking nodes)
	srv.forceGraph.context = $scope;
	
	// Check if passed entity's ID is different from selected entity's ID
	$scope.differentIDs = function(entity) {
		if (entity.id === $scope.entitySelected.id) {
			return false;
		}
		return true;
	} 
	
	// Check if passed group is the same as selected entity's group
	$scope.filterGroups = function(group) {
		if (group === $scope.entitySelected.group) {
			return false;
		}
		return true;
	}
	
	// Retrieve group if in active groups
	$scope.getActiveGroup = function(groupID) {
		//console.log(groupID);//called twice...
		return workgroup.groupsActive.find(groupID);
	}
	
	
	$scope.addNode = function(entityID) {
	
		// The node is added automatically to the activeEntities, unless the limit is exceeded.
		
		// If entity with ID entityID is already present in workgroup, do nothing
		if (arrayObjectIndexOf(workgroup.entities.entities, 'id', entityID) < 0) {
			// Create new entity
			var group = new workgroup.Group();
			var entity = new workgroup.Entity(entityID, group);
			group.add(entity);
			// Add to entities buffer for later search
			workgroup.entities.add(entity);
			// Add new node in the graph if not present
			ForceGraphVoronoi.utils.addNode(srv.forceGraph, entity.id, $scope.dataLookup.citiesIndex[entity.id].name);
			// Include entity in stats by default
			workgroup.activateEntity(entity.id);
			// Set entity to selected entity
			$scope.entitySelected = workgroup.entities.find(entity.id);
			// Callback from rootscope
			$scope.renderChart();
			$scope.setGroupLanguages();
		}
	};
	
	$scope.activateEntity = function(entityID) {
		if (workgroup.activateEntity(entityID)) {
			// Callback form rootscope
			$scope.renderChart();
			$scope.setGroupLanguages();
			return true;
		}	
		return false;
	};
	
	$scope.deactivateEntity = function(entityID) {
		if (workgroup.deactivateEntity(entityID)) {
			// Callback from rootscope
			$scope.renderChart();
			$scope.setGroupLanguages();
			return true;
		}	
		return false;
	};
	
	$scope.groupWithActiveEntity = function(entityAID, entityBID) {
		// Assign entityA to entityB's group
		// EntityB must be an active entity
		if (workgroup.groupWithActiveEntity(entityAID, entityBID)) {
			// Remove any existing links from/to node
			ForceGraphVoronoi.utils.removeLinksFromToNode(srv.forceGraph, entityAID);
			// Render the graph with new link between entities A and B
			ForceGraphVoronoi.utils.addLink(srv.forceGraph, entityAID, entityBID);
			// Callback from rootscope
			$scope.renderChart();
			$scope.setGroupLanguages();
			return true;
		}
		return false;
	};
	
	$scope.removeFromGroup = function(groupID, entityID, activate) {	
		if (workgroup.removeFromGroup(groupID, entityID, activate)) {
			// Remove links from/to the entity (only 'from' links, since not group owner)
			ForceGraphVoronoi.utils.removeLinksFromToNode(srv.forceGraph, entityID);
			// Callback from rootscope
			$scope.renderChart();
			$scope.setGroupLanguages();
			return true;
		}
		return false;
	};
	
	$scope.removeEntity = function(entityID) {
		if (workgroup.removeEntity(entityID)) {
			// Remove node from graph
			ForceGraphVoronoi.utils.removeNode(srv.forceGraph, entityID);
			$scope.tooltipTools.node = false;
			// Callback from rootscope
			$scope.renderChart();
			$scope.setGroupLanguages();
			return true;
		}
		return false;
	};
		
} ]);


	/*$scope.resolveGroup = function(groupID) {
		// TODO Test
		// If group exists
	};*/
	
	
	/*$scope.incrementNodesActive = function(increment) {
		$scope.nodesActive += increment;
	}*/
	
		/*
	$scope.addToGroup = function(groupID, entityID) {
		
		//Returns message
	
		// Retrieve group from workgroup
		var group = workgroup.groups.find(groupID);
		if (group !== null) {
			// Retrieve entity from workgroup
			var entity = workgroup.entities.find(entityID);
			// Buffer entity's original group
			var groupOld = { group: entity.group, flag: entity.groupOwner };
			if (entity !== null) {
				try {
					// Step 1: Add entity in group
					group.add(entity);
					// Step 2: Change entity's group to group
					entity.group = group;
					entity.groupOwner = false;
					// Step 3: Add link from entity to group's entity owner (first element in entitis array)
					ForceGraphVoronoi.utils.addLink(srv.forceGraph, entity.id, group.entities[0].id);
				} catch (err) {
					// Reverse Step 1
					group.remove(entity);
					// Reverse Step 2
					entity.group = groupOld;
					entity.groupOwner = groupOld.flag;
					// Reverse Step 3
					ForceGraphVoronoi.utils.removeLink(srv.forceGraph, entity.id, group.entities[0].id);
				}
			}
		}
		return 'success';
	}
	
	
	*/
	
	//$scope.maxNodes = 3;//not used
	//$scope.nodesActive = 0;//not used
	
	// Set the local data to use for this controller's Views etc. //not used
	/*$scope.data = function() {
		return { 
			cities: srv.data.cities, 
			population: srv.data.population
		};
	}*/
