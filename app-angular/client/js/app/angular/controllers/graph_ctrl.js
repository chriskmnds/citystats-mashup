// Stats controller that holds tools needed by the chart and stats table only.
function GraphCtrl($rootScope, $scope, $timeout, Globals, Workgroup, Common) {
  'use strict';

  var graphVm = this;

  graphVm.renderChart = Globals.renderChart;

  // Tools needed to render the graph/chart
  graphVm.graphingTools = Globals.graphingTools;
  
  // Data lookups for use in views that require the scope
  graphVm.dataLookup = Globals.dataLookup;

  // When a node is clicked we need the group languages and nationalities to be computed dynamically
  // to reflect any changes in node grouping/adding/removal etc.
  graphVm.statsGroupClicked = function(id) {
    //console.log(123);
    //console.log(Globals);
    Globals.statsGroupClicked(id);
  }
  
  graphVm.setGroupNationalities = Globals.setGroupNationalities;
  graphVm.setGroupLanguages = Globals.setGroupLanguages;

  // Variable to hold the ID of the selected city/entity
  graphVm.entitySelected = null;

  // -------------------------------------------------------------------
  // Some variables to open/close the widgets for controlling the graph
  // This needs to be reworked...
  // -------------------------------------------------------------------

  graphVm.tooltipTools = {
    init: false,
    utils: false,
    node: false,
    timesOpened: 0
  };

  graphVm.utilsClicked = function(e) {
    graphVm.tooltipTools.init = false;
    graphVm.tooltipTools.node = false;
    graphVm.tooltipTools.timesOpened = graphVm.tooltipTools.timesOpened + 1;
    graphVm.tooltipTools.utils = true;
  };

  graphVm.nodeClicked = function(id) {
    graphVm.tooltipTools.utils = false;
    graphVm.tooltipTools.node = true;
    graphVm.entitySelected = Workgroup.entities.find(id);
    graphVm.statsGroupClicked(graphVm.entitySelected.group.id);
    $scope.$apply();
  };

  graphVm.loadInit = function() {
    $timeout(function() { graphVm.tooltipTools.init = true; }, 700);
  };

  // -------------------------------------------------------------------

  // Check if passed entity's ID is different from selected entity's ID
  graphVm.differentIDs = function(entity) {
    if (entity.id === graphVm.entitySelected.id) {
      return false;
    }
    return true;
  };

  // Check if passed group is the same as selected entity's group
  graphVm.filterGroups = function(group) {
    if (group === graphVm.entitySelected.group) {
      return false;
    }
    return true;
  };

  // Retrieve group if in active groups
  graphVm.getActiveGroup = function(groupID) {
    //console.log(groupID);//called twice...
    return Workgroup.groupsActive.find(groupID);
  };

  // Set graph node colors (for active/inactive nodes)
  graphVm.nodeColor = function(entityID) {
    var entity = Workgroup.entities.find(entityID);
    if (entity !== null) {
      if (Workgroup.groupsActive.find(entity.group.id) !== null) {
        return Globals.colorScale(entity.group.id); //"orange";//#BCE27F
      } else {
        return 'white';
      }
    }
  };

  // Everything from here on use the Workgroup models for adding/removing/grouping nodes

  graphVm.addNode = function(entityID) {

    // The node is added automatically to the activeEntities, unless the limit is exceeded.

    // If entity with ID entityID is already present in Workgroup, do nothing
    if (arrayObjectIndexOf(Workgroup.entities.entities, 'id', entityID) < 0) {
      // Create new entity
      var group = new Workgroup.Group();
      var entity = new Workgroup.Entity(entityID, group);
      group.add(entity);
      // Add to entities buffer for later search
      Workgroup.entities.add(entity);
      // Include entity in stats by default
      Workgroup.activateEntity(entity.id);

      // Set colorScale for use in graph/chart rendering
      Globals.colorScale.domain(graphVm.graphingTools.colorScaleDomain());

      // Add new node in the graph if not present
      ForceGraph.utils.addNode(Globals.forceGraph, entity.id, graphVm.dataLookup.citiesIndex[entity.id].name);
      // Set entity to selected entity
      graphVm.entitySelected = Workgroup.entities.find(entity.id);
      // Set stats entity to selected entity
      graphVm.statsGroupClicked(entity.group.id);
      // Callback from rootscope
      graphVm.renderChart();
      graphVm.setGroupLanguages();
      graphVm.setGroupNationalities();
    }
    // Since entity is already present in Workgroup, select its group in the stats table
    // ...if its group is already active...
    // No need to execute the callbacks from rootscope, since no action is taken, other than selecting an active group
    else {
      /*var entity = Workgroup.entities.find(entityID);
      if (Workgroup.groupsActive.find(entity.group.id) !== null) {
        graphVm.statsGroupClicked(entity.group.id);
      }*/
      graphVm.entitySelected = Workgroup.entities.find(entityID);
      graphVm.statsGroupClicked(graphVm.entitySelected.group.id);
    }
  };

  graphVm.activateEntity = function(entityID) {
    if (Workgroup.activateEntity(entityID)) {
      // Set colorScale for use in graph/chart rendering
      Globals.colorScale.domain(graphVm.graphingTools.colorScaleDomain());
      // Callback form rootscope
      graphVm.renderChart();
      graphVm.setGroupLanguages();
      graphVm.setGroupNationalities();
      // Select the entity's group in the statsTable
      graphVm.entitySelected = Workgroup.entities.find(entityID);
      graphVm.statsGroupClicked(graphVm.entitySelected.group.id);
      // Call renderCircles to update the force-graph, hence the color of the updated node
      ForceGraph.utils.renderCircles(Globals.forceGraph);
      return true;
    }
    return false;
  };

  graphVm.deactivateEntity = function(entityID) {
    if (Workgroup.deactivateEntity(entityID)) {
      // Set colorScale for use in graph/chart rendering
      Globals.colorScale.domain(graphVm.graphingTools.colorScaleDomain());
      // Callback from rootscope
      graphVm.renderChart();
      graphVm.setGroupLanguages();
      graphVm.setGroupNationalities();
      // Call renderCircles to update the force-graph, hence the color of the updated node
      ForceGraph.utils.renderCircles(Globals.forceGraph);
      return true;
    }
    return false;
  };

  graphVm.groupWithActiveEntity = function(entityAID, entityBID) {
    // Assign entityA to entityB's group
    // EntityB must be an active entity
    if (Workgroup.groupWithActiveEntity(entityAID, entityBID)) {
      // Set colorScale for use in graph/chart rendering
      Globals.colorScale.domain(graphVm.graphingTools.colorScaleDomain());
      // Remove any existing links from/to node
      ForceGraph.utils.removeLinksFromToNode(Globals.forceGraph, entityAID);
      // Render the graph with new link between entities A and B
      ForceGraph.utils.addLink(Globals.forceGraph, entityAID, entityBID);
      // Callback from rootscope
      graphVm.renderChart();
      graphVm.setGroupLanguages();
      graphVm.setGroupNationalities();
      return true;
    }
    return false;
  };

  graphVm.removeFromGroup = function(groupID, entityID, activate) {
    if (Workgroup.removeFromGroup(groupID, entityID, activate)) {
      // Set colorScale for use in graph/chart rendering
      Globals.colorScale.domain(graphVm.graphingTools.colorScaleDomain());
      // Remove links from/to the entity (only 'from' links, since not group owner)
      ForceGraph.utils.removeLinksFromToNode(Globals.forceGraph, entityID);
      // Callback from rootscope
      graphVm.renderChart();
      graphVm.setGroupLanguages();
      graphVm.setGroupNationalities();
      return true;
    }
    return false;
  };

  graphVm.removeEntity = function(entityID) {
    if (Workgroup.removeEntity(entityID)) {
      // Set colorScale for use in graph/chart rendering
      Globals.colorScale.domain(graphVm.graphingTools.colorScaleDomain());
      // Remove node from graph
      ForceGraph.utils.removeNode(Globals.forceGraph, entityID);
      graphVm.tooltipTools.node = false;
      // Callback from rootscope
      graphVm.renderChart();
      graphVm.setGroupLanguages();
      graphVm.setGroupNationalities();
      return true;
    }
    return false;
  };

  // Set a context for the graph (used for clicking/coloring nodes)
  //ForceGraph.prototype.context = graphVm;
  angular.extend($rootScope.context, graphVm);
}

GraphCtrl.$inject = ['$rootScope', '$scope', '$timeout', 'Globals', 'Workgroup', 'Common'];
angular.module('myapp').controller('GraphCtrl', GraphCtrl);
