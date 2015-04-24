angular.module('app.init', [])
	// Global metadata that may be referenced later
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

// A custom filter for capitalising the first letter of each word in a sequence
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
		meta.setDescription('Open data visualisation built in Angular and D3.js. Explores 2011 statistics about xxx cities and villages in Cyprus. Allows grouping of cities/villages for deeper exploration and comparison. Data sourced from the Cyprus Statistical Agency. Datasets used: xxx, xxx, and xxx.');
	});

// Template for displaying a list of cities to explore
app.directive("utilsSelectWidget", function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/utilsTooltip.html'
	};
});

// Template for displaying utilites when a node is clicked
app.directive("utilsNodeWidget", function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/nodeTooltip.html'
	};
});

// Template for the main stats table
app.directive("statsDetailsWidget", function () {
	return {
		restrict: 'E',
		replace: true,
		templateUrl: 'templates/statsDetails.html'
	};
});