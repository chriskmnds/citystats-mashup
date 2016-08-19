// check if an element exists in array using a comparer function
// comparer : function(currentElement)
Array.prototype.inArray = function(comparer) {
  for (var i = 0; i < this.length; i++) {
    if (comparer(this[i])) return true;
  }
  return false;
};

// adds an element to the array if it does not already exist using a comparer
// function
Array.prototype.pushIfNotExist = function(element, comparer) {
  if (!this.inArray(comparer)) {
    this.push(element);
    return true;
  }
  return false;
};


// find index of object in array given some property value
function arrayObjectIndexOf(myArray, property, searchTerm) {
  for (var i = 0, len = myArray.length; i < len; i++) {
    if (myArray[i][property] === searchTerm) return i;
  }
  return -1;
}

// find index of item in array
function arrayIndexOf(myArray, searchTerm) {
  for (var i = 0, len = myArray.length; i < len; i++) {
    if (myArray[i] === searchTerm) return i;
  }
  return -1;
}