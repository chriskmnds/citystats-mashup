app.controller('graph', ['$scope', 'srv', 'workgroup', '$timeout', function($scope, srv, workgroup, $timeout) {
	
	// Set a context for the graph (used for clicking/coloring nodes)
	ForceGraph.prototype.context = $scope;
	
	$scope.entitySelected = null;
	
	$scope.tooltipTools = {
		init: false,
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
	
	$scope.loadInit = function() {
		$timeout(function() { $scope.tooltipTools.init = true; }, 700);
	}
		
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
	
	// Set graph node colors (for active/inactive nodes)
	$scope.nodeColor = function(entityID) {
		var entity = workgroup.entities.find(entityID);
		if (entity !== null) {
			if (workgroup.groupsActive.find(entity.group.id) !== null) {
				return srv.colorScale(entity.group.id); //"orange";//#BCE27F
			} else {
				return "white";
			}
		}
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
			// Include entity in stats by default
			workgroup.activateEntity(entity.id);
			
			// Set colorScale for use in graph/chart rendering
			srv.colorScale.domain($scope.graphingTools.colorScaleDomain());
			
			// Add new node in the graph if not present
			ForceGraph.utils.addNode(srv.forceGraph, entity.id, $scope.dataLookup.citiesIndex[entity.id].name);
			// Set entity to selected entity
			$scope.entitySelected = workgroup.entities.find(entity.id);
			// Set stats entity to selected entity
			$scope.statsGroupClicked(entity.group.id);
			// Callback from rootscope
			$scope.renderChart();
			$scope.setGroupLanguages();
			$scope.setGroupNationalities();
		} 
		// Since entity is already present in workgroup, select its group in the stats table
		// ...if its group is already active...
		// No need to execute the callbacks from rootscope, since no action is taken, other than selecting an active group
		else {
			/*var entity = workgroup.entities.find(entityID);
			if (workgroup.groupsActive.find(entity.group.id) !== null) {
				$scope.statsGroupClicked(entity.group.id);
			}*/
			$scope.entitySelected = workgroup.entities.find(entityID);
			$scope.statsGroupClicked($scope.entitySelected.group.id);
		}
	};
	
	$scope.activateEntity = function(entityID) {
		if (workgroup.activateEntity(entityID)) {
			// Set colorScale for use in graph/chart rendering
			srv.colorScale.domain($scope.graphingTools.colorScaleDomain());
			// Callback form rootscope
			$scope.renderChart();
			$scope.setGroupLanguages();
			$scope.setGroupNationalities();
			// Select the entity's group in the statsTable
			$scope.entitySelected = workgroup.entities.find(entityID);
			$scope.statsGroupClicked($scope.entitySelected.group.id);
			// Call renderCircles to update the force-graph, hence the color of the updated node
			ForceGraph.utils.renderCircles(srv.forceGraph);
			return true;
		}	
		return false;
	};
	
	$scope.deactivateEntity = function(entityID) {
		if (workgroup.deactivateEntity(entityID)) {
			// Set colorScale for use in graph/chart rendering
			srv.colorScale.domain($scope.graphingTools.colorScaleDomain());
			// Callback from rootscope
			$scope.renderChart();
			$scope.setGroupLanguages();
			$scope.setGroupNationalities();
			// Call renderCircles to update the force-graph, hence the color of the updated node
			ForceGraph.utils.renderCircles(srv.forceGraph);
			return true;
		}	
		return false;
	};
	
	$scope.groupWithActiveEntity = function(entityAID, entityBID) {
		// Assign entityA to entityB's group
		// EntityB must be an active entity
		if (workgroup.groupWithActiveEntity(entityAID, entityBID)) {
			// Set colorScale for use in graph/chart rendering
			srv.colorScale.domain($scope.graphingTools.colorScaleDomain());
			// Remove any existing links from/to node
			ForceGraph.utils.removeLinksFromToNode(srv.forceGraph, entityAID);
			// Render the graph with new link between entities A and B
			ForceGraph.utils.addLink(srv.forceGraph, entityAID, entityBID);
			// Callback from rootscope
			$scope.renderChart();
			$scope.setGroupLanguages();
			$scope.setGroupNationalities();
			return true;
		}
		return false;
	};
	
	$scope.removeFromGroup = function(groupID, entityID, activate) {	
		if (workgroup.removeFromGroup(groupID, entityID, activate)) {
			// Set colorScale for use in graph/chart rendering
			srv.colorScale.domain($scope.graphingTools.colorScaleDomain());
			// Remove links from/to the entity (only 'from' links, since not group owner)
			ForceGraph.utils.removeLinksFromToNode(srv.forceGraph, entityID);
			// Callback from rootscope
			$scope.renderChart();
			$scope.setGroupLanguages();
			$scope.setGroupNationalities();
			return true;
		}
		return false;
	};
	
	$scope.removeEntity = function(entityID) {
		if (workgroup.removeEntity(entityID)) {
			// Set colorScale for use in graph/chart rendering
			srv.colorScale.domain($scope.graphingTools.colorScaleDomain());
			// Remove node from graph
			ForceGraph.utils.removeNode(srv.forceGraph, entityID);
			$scope.tooltipTools.node = false;
			// Callback from rootscope
			$scope.renderChart();
			$scope.setGroupLanguages();
			$scope.setGroupNationalities();
			return true;
		}
		return false;
	};
		
} ]);