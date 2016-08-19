// A factory method defining global application service variables
function Globals($document, Workgroup) {
  'use strict';
  var _this = this;
  
  _this.forceGraph = [];
  _this.statChart = [];
  _this.data = {};
  _this.colorScale = d3.scale.ordinal();
  
  // Variable to hold the ID of the city's group when selected
  _this.statsGroupSelected = {};

  // Variable to hold the group nationalities aggregated via "setGroupNationalities"
  // Best be moved to a convenient object
  // Format: array of objects: {name: "nationality name", value: 0}
  _this.groupNationalities = [];

  // Variable to hold the group languages aggregated via "setGroupLanguages"
  // Best be moved to a convenient object
  // Format: array of objects: {name: "language name", value: 0}
  _this.groupLanguages = [];

  // Data lookups for use in views that require the scope
  // plus an additional citiesIndex lookup
  _this.dataLookup = {
    citiesIndex: {}, // CitisIndex used for retrieving city by ID
    cities: [], // Cities array from Globals.data
    population: {}, // Population object from Globals.data
    languagesPerLocation: {}, // languagesPerLocation array from Globals.data
    naitonalitiesPerLocation: {} // nationalitiesPerLocation array from Globals.data
  };
  
  _this.graphingTools = {
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
      for (var i = 0, len = Workgroup.groupsActive.groups.length; i < len; i++) {
        domain.push(Workgroup.groupsActive.groups[i].id);
      }
      return domain;
    }
  };

  // Callback to render the chart upon model changes
  _this.renderChart = function() {
    if (Workgroup.groupsActive.groups.length > 0) {
      // Compute data for the chart

      var chartData = [];
      /* We want the data in this format (where a, b, c are group IDs):
        [ {name: 'educated', value: [{"a":100}, {"b":150}, {"c":200}]},
          {name: 'uneducated', value: [{"a":200}, {"b":250}, {"c":300}]} ]
      */

      // for each education level
      for (var i = 0, len = _this.data.educationLevels.length; i < len; i++) {
        var eduName = _this.data.educationLevels[i];
        var eduValue = [];
        // for each active group
        for (var j = 0, len2 = Workgroup.groupsActive.groups.length; j < len2; j++) {
          var groupTotal = 0;
          // for each entity in active group
          for (var k = 0, len3 = Workgroup.groupsActive.groups[j].entities.length; k < len3; k++) {
            // add to group total
            groupTotal += _this.data.education[Workgroup.groupsActive.groups[j].entities[k].id][eduName];
          }
          // Push group result { groupID : group total } to chartData's value array (eduValue)
          var groupResult = {};
          groupResult[Workgroup.groupsActive.groups[j].id] = groupTotal;
          eduValue.push(groupResult);
        }
        // push into chartData the final education level's results
        chartData.push({name: eduName, value: eduValue});
      }
      // Render the chart with the new data (will replace previous chart)
      BarChart.render(chartData, _this.statChart);
    } else {
      // Run the init code to clear graph and display only the x/y axes
      BarChart.init(_this.statChart);
    }
  };

  // When a node is clicked we need the group languages and nationalities to be computed dynamically
  // to reflect any changes in node grouping/adding/removal etc.
  _this.statsGroupClicked = function(id) {
    _this.statsGroupSelected = Workgroup.groupsActive.find(id);
    _this.setGroupLanguages();
    _this.setGroupNationalities();
    console.log(_this.statsGroupSelected);
  };

  _this.setGroupLanguages = function() {
    var groupLanguages = [];

    if (_this.statsGroupSelected === null) return false;

    var group = Workgroup.groupsActive.find(_this.statsGroupSelected.id);

    if (group === null) return false;

    for (var i = 0, len = group.entities.length; i < len; i += 1) {
      var entity = group.entities[i];
      var entityLanguages = _this.dataLookup.languagesPerLocation[entity.id];

      for (var j = 0, len2 = entityLanguages.length; j < len2; j += 1) {
        var language = entityLanguages[j];
        var index = arrayObjectIndexOf(groupLanguages, 'name', language.name);

        if (index !== -1) {
          var inc = groupLanguages[index].value + language.value;
          groupLanguages[index].value = inc;
        } else {
          groupLanguages.push({name:language.name, value: language.value});
        }
      }
    }
    _this.groupLanguages = groupLanguages;
  };

  _this.setGroupNationalities = function() {
    var groupNationalities = [];

    if (_this.statsGroupSelected === null) return false;

    var group = Workgroup.groupsActive.find(_this.statsGroupSelected.id);

    if (group === null) return false;

    for (var i = 0, len = group.entities.length; i < len; i += 1) {
      var entity = group.entities[i];
      var entityNationalities = _this.dataLookup.nationalitiesPerLocation[entity.id];

      for (var j = 0, len2 = entityNationalities.length; j < len2; j += 1) {
        var nationality = entityNationalities[j];
        var index = arrayObjectIndexOf(groupNationalities, 'name', nationality.name);

        if (index !== -1) {
          var inc = groupNationalities[index].value + nationality.value;
          groupNationalities[index].value = inc;
        } else {
          groupNationalities.push({name:nationality.name, value: nationality.value});
        }
      }
    }
    _this.groupNationalities = groupNationalities;
  };
}

Globals.$inject = ['$document', 'Workgroup'];
angular.module('myapp').service('Globals', Globals);

