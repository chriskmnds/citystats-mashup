// A custom filter for capitalising the first letter of each word in a sequence
function Capitalize() {
  return function(input, all) {
    return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
  }
};

angular.module('myapp').filter('capitalize', Capitalize);
