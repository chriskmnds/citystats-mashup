function BarChart(width, height, id) {

  this.data = {};

  this.margin = {top: 20, right: 0, bottom:30, left: 40};

  this.width = width - this.margin.right - this.margin.left;
  this.height = height - this.margin.top - this.margin.bottom;

  this.x = d3.scale.ordinal().rangeRoundBands([0, this.width], .1);
  this.y = d3.scale.linear().range([this.height, 0]);

  this.xAxis = d3.svg.axis().scale(this.x).orient('bottom');
  this.yAxis = d3.svg.axis().scale(this.y).orient('left').ticks(10)
             .tickFormat(function(d) {
                var axisFormatter = d3.format('f');
                if (d > 1000) return axisFormatter(d/1000);
                else return d;
              });

  this.container = d3.select(id);
  this.svg = [];

  // NOT USED - Use for standalone version. Currently using $scope's colorScale.
  // this.colorScale = d3.scale.ordinal();
  // Set range of colors for colorScale
  // this.colorScale.range(['#96B566', '#C3C3C3', '#BCE27F', '#7C7C7C', '#F6FF97']);

  //this.context = {};
}

// Method to be run once at initialisation when no data is available
//  - will simply render the container with no data and show a scale on the y-axis
BarChart.init = function(chart) {
  // Remove any previous svg/chart element
  chart.container.selectAll('svg').remove();

  chart.svg = chart.container.append('svg')
       .attr('width', chart.width + chart.margin.right + chart.margin.left)
       .attr('height', chart.height + chart.margin.top + chart.margin.bottom)
       .style('background-color', 'hsl(228, 24%, 96%)')
       .attr('class', 'empty');//#efefef

  var g = chart.svg.append('g')
       .attr('transform', 'translate(' + chart.margin.left + ',' + chart.margin.top + ')');

  //group x axis
  g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + chart.height + ')')
      .call(chart.xAxis);

  //group y axis
  g.append('g')
      .attr('class', 'y axis')
      .call(chart.yAxis)
     .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Frequency (k)');
}

BarChart.render = function(json, chart) {

  // Remove any previous svg/chart element
  chart.container.selectAll('svg').remove();

  chart.svg = chart.container.append('svg')
       .attr('width', chart.width + chart.margin.right + chart.margin.left)
       .attr('height', chart.height + chart.margin.top + chart.margin.bottom)
       //.style('background-color', 'hsl(228, 24%, 96%)')
       .attr('class', 'full');//#efefef

  chart.data = json;

  // --------------------------------------
  // x-y scales - based on data volume
  // --------------------------------------

  // x-scale:
  chart.x.domain(chart.data.map(function(d) { return d.name; }));

  // Retrieve all values in array
  var items = [];
  for (var i = 0, len1 = json.length; i < len1; i++) {
    for (var j = 0, len2 = json[i].value.length; j < len2; j++) {
      items = items.concat(d3.values(json[i].value[j]));
    }
  }

  // y-scale:
  chart.y.domain([0, d3.max(items)]);

  // --------------------------------------

  // Color Scheme domain for rectangles
  // (NOT USED - Use for standalone version)
  // --------------------------------------

  //var domain = [];

  /*for (var i = 0, len = chart.data[0].value.length; i < len; i++) {
    domain.push(i);
  }

  chart.colorScale.domain(domain);
  */

  /*for (var i = 0, len = chart.context.modelLookup.groupsActive.groups.length; i < len; i++) {
    domain.push(chart.context.modelLookup.groupsActive.groups[i].id);
  }

  chart.context.srvLookup.colorScale.domain(domain);
  */

  // --------------------------------------

  var g = chart.svg.append('g').attr('transform', 'translate(' + chart.margin.left + ',' + chart.margin.top + ')');

  //group x axis
  g.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + chart.height + ')')
      .call(chart.xAxis);

  //group y axis
  g.append('g')
      .attr('class', 'y axis')
      .call(chart.yAxis)
     .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Frequency (k)');

  //group bars
  var barsContainer = g.append('g').attr('id', 'bars');

  //Data join - Append g elements to the bars element
  var bars = barsContainer.selectAll('g')
    .data(chart.data);

  bars.enter().append('g')
    .attr('transform', function(d) { return 'translate(' + (chart.x(d.name) + 1) + ',0)'; });

  // Create rects based on data
  for (var j = 0, len = json[0].value.length; j < len; j++) {

    bars.append('rect')
      .attr('x', function(d) {
          if (j === 0) return 0;
          else return (chart.x.rangeBand()/len) * j;
        })
      .attr('width', chart.x.rangeBand()/len)
      .attr('y', function(d) { return chart.height; })
      .attr('height', 0)
      .attr('fill', 'white')
      .attr('opacity', 0.5)

      .attr('groupID', function(d) {
        return d3.keys(d.value[j]);
      })
      .attr('value', function(d) {
        return d3.values(d.value[j]);
      })

      .on('click', function(d) {
        var groupID = d3.select(this).attr('groupID');
        var value = d3.select(this).attr('value');
        chart.context.rectClicked(groupID, value);
            d3.event.stopPropagation();
      })

      .transition()
      .delay(function(d, i) { return i * 100; })
      .duration(400)
      //.attr('fill', chart.colorScale(j)) // (NOT USED - Use for standalone version)
      .attr('fill', function(d) {
        // Retrieve color from context's ($scope) colorScale.
        // Remove in standalone version.
        return chart.context.srvLookup.colorScale(d3.keys(d.value[j]));
      })
      .attr('opacity', 1)
      .attr('y', function(d) { return chart.y(d3.values(d.value[j])); })
      .attr('height', function(d) { return chart.height - chart.y(d3.values(d.value[j])); });
  }

  /*var g2 = chart.svg.append('g').append('text')
    .text('blabla')
    .attr('y', chart.height + chart.margin.top + chart.margin.bottom + 10)
    .attr('x', chart.margin.left);*/

  //Append texts to each g node (2 per node)
  /*bars.append('text')
    .attr('x', chart.x.rangeBand() / 4)
    .attr('y', function(d){ return chart.y(d.a) + 5; })
    .attr('dy', '.75em')
    .text(function(d) {return d.a; });

  bars.append('text')
    .attr('x', (chart.x.rangeBand()/2 - 3) + (chart.x.rangeBand() / 4))
    .attr('y', function(d){ return chart.y(d.b) + 5; })
    .attr('dy', '.75em')
    .text(function(d) {return d.b; });
  */
}

/*
//Append rects to each g node (2 per node)
bars.append('rect')
  .attr('y', function(d) {return chart.height; })
  .attr('width', chart.x.rangeBand()/2)
  .attr('height', 0)
  .attr('fill', 'white')
  .attr('opacity', 0.5)
  .attr('onmouseover', '')
  .transition()
  .delay(function(d, i) { return i * 100; })
  .duration(400)
  .attr('fill', 'steelblue')
  .attr('opacity', 1)
  .attr('y', function(d) {return chart.y(d.a); })
  .attr('height', function(d) { return chart.height - chart.y(d.a); });

bars.append('rect')
  .attr('x', function(d) {return chart.x.rangeBand()/2; })
  .attr('y', function(d) {return chart.height; })
  .attr('width', chart.x.rangeBand()/2)
  .attr('height', 0)
  .attr('fill', 'white')
  .attr('opacity', 0.5)
  .attr('onmouseover', '')
  .transition()
  .delay(function(d, i) { return i * 100; })
  .duration(400)
  .attr('fill', 'silver')
  .attr('opacity', 1)
  .attr('y', function(d) {return chart.y(d.b); })
  .attr('height', function(d) { return chart.height - chart.y(d.b); });
*/