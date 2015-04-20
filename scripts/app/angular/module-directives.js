angular.module('app.init', [])
	.value('meta', {
		name: '',
		setName: function(name) {
			this.name = name;
		},
		author: '',
		setAuthor: function(author) {
			this.author = author;
		},
		description: '',
		setDescription: function(description) {
			this.description = description;
		}
	});


angular.module('CustomFilter', []).
  filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
  });

var app = angular.module('app.main', ['app.init', 'CustomFilter', 'ngAnimate'])
	.run(function(meta, $http) {
		// Initialisation code
		// Set the meta values of the init module
		meta.setName('City Stats Cyprus');
		meta.setAuthor('Christos Koumenides');
		meta.setDescription('Open data visualisation built in Angular and D3.js. Explores 2011 statistics about xxx cities and villages in Cyprus. Allows grouping of cities/villages for deeper exploration and comparison. Cities/villages can be grouped together for aggregated results, hence deeper exploration and comparison. Data sourced from the Cyprus Statistical Agency. Datasets used: xxx, xxx, and xxx.');
	});

app.directive("utilsSelectWidget", function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'utilsTooltip.html'
	};
});

app.directive("utilsNodeWidget", function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'nodeTooltip.html'
	};
});

app.directive("statsDetailsWidget", function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'statsDetails.html'
	};
});