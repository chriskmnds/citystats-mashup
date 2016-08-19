function MainCtrl($rootScope, $scope, $http, $window, $document, CONFIG, Globals, Workgroup, Common) {
  'use strict';

  var mainVm = this;

  mainVm.ctrlName = 'MainCtrl';

  // Tools needed to render the graph/chart
  mainVm.graphingTools = Globals.graphingTools;

  // Data lookups for use in views that require the scope
  mainVm.dataLookup = Globals.dataLookup;

  // References to Workgroup models for use in views and other scripts
  mainVm.modelLookup = {
    groupsActive: Workgroup.groupsActive
  };

  // References to service variables for use in views and other scripts
  mainVm.srvLookup = {
    colorScale: Globals.colorScale,
    statsGroupSelected: function() {
      return Globals.statsGroupSelected;
    },
    groupNationalities: function() {
      return Globals.groupNationalities;
    },
    groupLanguages: function() {
      return Globals.groupLanguages;
    }
  };

  mainVm.renderChart = Globals.renderChart;

  // When a node is clicked we need the group languages and nationalities to be computed dynamically
  // to reflect any changes in node grouping/adding/removal etc.
  mainVm.statsGroupClicked = function(id) {
    Globals.statsGroupClicked(id);
  }

  (function init() {
    // Retrieve data and assign to factory variable
    // This is asynchronous, but does not matter since application can load/function with no data in scope
    $http.get('/' + CONFIG.appVersion + '/json/data.json')
      .success(function(data, status, headers, config) {
        Globals.data = data;
        // Create data lookups here
        // Populate citiesIndex
        for (var i = 0, len = Globals.data.cities.length; i < len; i++) {
          mainVm.dataLookup.citiesIndex[Globals.data.cities[i].id] = Globals.data.cities[i];
        }
        mainVm.dataLookup.cities = Globals.data.cities;
        mainVm.dataLookup.population = Globals.data.population;
        mainVm.dataLookup.languagesPerLocation = Globals.data.languagesPerLocation;
        mainVm.dataLookup.nationalitiesPerLocation = Globals.data.nationalitiesPerLocation;
      })
      .error(function(data, status, headers, config) {
        console.log('error loading data.json.');
      });

    // ---------------------
    // Color Scale
    // ---------------------
    // Define range for the Color Scale to use in bar rects and graph nodes
    Globals.colorScale.range(['#96B566', '#C3C3C3', '#BCE27F', '#7C7C7C', '#F6FF97']);
    // We set the domain here, although it will be empty at this point
    // Domain is reset every time the chart is rendered and the graph is updated
    // We use graphingTools.colorScaleDomain to define scales dynamically based on groupsActive
    Globals.colorScale.domain(mainVm.graphingTools.colorScaleDomain);
    // ---------------------

    // Initialise and render the graph
    // Set width equal to the 'forceGraph' div (see mainVm.graphingTools)
    Globals.forceGraph = new ForceGraph(mainVm.graphingTools.forceWidth(), 435, '#forceGraph');
    ForceGraph.render(Globals.forceGraph);

    // Initialise and render the chart (container and y-axis only)
    Globals.statChart = new BarChart(mainVm.graphingTools.chartWidth(), 300, '#statsChart');//500
    //mainVm.renderChart();
    BarChart.init(Globals.statChart);

    // Bind RESIZE event to the $window element
    // See https://docs.angularjs.org/api/ng/service/$window
    // On resize, apply changes to the graph svg, voronoi (if voronoi), force, and chart.
    var resizeChart = true;

    angular.element($window).bind('resize', function() {
      // ForceGraph Resize
      var width = mainVm.graphingTools.forceWidth();
      Globals.forceGraph.width = width;
      Globals.forceGraph.svg.attr('width', width);
      //TODO: Unescape this for use with ForceGraphVoronoi (force-app-final-with-voronoi.js)
      //Globals.forceGraph.voronoi.clipExtent([[-10, -10], [width+10, Globals.forceGraph.height+10]]);
      Globals.forceGraph.force.size([width, Globals.forceGraph.height]).resume();

      // ChartGraph Resize
      Globals.statChart = new BarChart(mainVm.graphingTools.chartWidth(), 300, '#statsChart');//500
      mainVm.renderChart();
    });

    angular.extend($rootScope.context, mainVm);
    ForceGraph.prototype.context = $rootScope.context;
    BarChart.prototype.context = $rootScope.context;
  }());
}

MainCtrl.$inject = ['$rootScope', '$scope', '$http', '$window', '$document', 'CONFIG', 'Globals', 'Workgroup', 'Common'];
angular.module('myapp').controller('MainCtrl', MainCtrl);
