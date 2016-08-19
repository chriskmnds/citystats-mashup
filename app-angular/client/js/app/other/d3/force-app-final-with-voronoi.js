/*
  A custom force graph with utilities to add/remove nodes and links.

  Usage:
  ----------------

  forceGraph = new ForceGraph(960, 500, '#forceGraph');
  forceGraph.render(forceGraph);
  forceGraph.utils.addNode(forceGraph, 1);
  forceGraph.utils.addNode(forceGraph, 2);
  forceGraph.utils.addLink(forceGraph, 1, 2);

  etc.
*/

function ForceGraphVoronoi(width, height, id) {
  this.width = width;
  this.height = height;

  this.container = d3.select(id);
  this.svg = [];
  this.force = d3.layout.force();

  this.voronoi = d3.geom.voronoi();

  this.nodes = [];
  this.links = [];

  this.lines = [];
  this.circles = [];

  this.tip = d3.tip();

  this.context = {};
}

ForceGraphVoronoi.render = function(graph) {

  var color = d3.scale.category10();

  graph.force
    .charge(-500)
    .linkDistance(60)
    .theta(1)
    .size([graph.width, graph.height])
    .on('tick', tick);

  //associate the data arrays with the actual force element
  graph.force
    .nodes(graph.nodes)
    .links(graph.links);

  graph.svg = graph.container.append('svg')
      .attr('width', graph.width)
      .attr('height', graph.height);

  graph.lines = graph.svg.selectAll('.link');
  graph.circles = graph.svg.selectAll('.node');

  // Setup the tooltips
  graph.tip.attr('class', 'd3-tip')
       .offset([-10,0])
       .html(function(d) {
        return d.text;
       });

  graph.svg.call(graph.tip);

  graph.voronoi.x(function(d) { return d.x; })
         .y(function(d) { return d.y; })
         .clipExtent([[-10, -10], [graph.width+10, graph.height+10]]);

  function recenterVoronoi(nodes) {
      var shapes = [];
      graph.voronoi(nodes).forEach(function(d) {
          if ( !d.length ) return;
          var n = [];
          d.forEach(function(c){
              n.push([ c[0] - d.point.x, c[1] - d.point.y ]);
          });
          n.point = d.point;
          shapes.push(n);
      });
      return shapes;
  }

  function tick() {
    graph.circles
      .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
      .attr('clip-path', function(d) { return 'url(#clip-' + d.index + ')'; });

      graph.lines
        .attr('x1', function(d) { return d.source.x; })
      .attr('y1', function(d) { return d.source.y; })
      .attr('x2', function(d) { return d.target.x; })
      .attr('y2', function(d) { return d.target.y; });

    var clip = graph.svg.selectAll('.clip')
          .data( recenterVoronoi(graph.circles.data()), function(d) { return d.point.index; } );

    clip.enter().append('clipPath')
      .attr('id', function(d) { return 'clip-' + d.point.index; })
      .attr('class', 'clip');

      clip.exit().remove();

      clip.selectAll('path').remove();
      clip.append('path')
          .attr('d', function(d) { return 'M' + d.join(',') + 'Z'; });
  }
}

ForceGraphVoronoi.utils = {

  //utility to add a link
  addLink: function(graph, sourceId, targetId) {
    var a = arrayObjectIndexOf(graph.nodes, 'id', sourceId);
    var b = arrayObjectIndexOf(graph.nodes, 'id', targetId);

    var element = {source: a, target: b};

    //insert only if source and target are already in graph.nodes
    //and that the link does not already exist in graph.links (bidirectional)
    //we check for bidirectional links
    if (graph.nodes.inArray(function(e) { return e.id === sourceId; }) &&
      graph.nodes.inArray(function(e) { return e.id === targetId; }))
    {
      graph.links.pushIfNotExist(element, function(e) {
        //check for bidirectional links
        return (e.source.id === sourceId && e.target.id === targetId) ||
             (e.source.id === targetId && e.target.id === sourceId);
      });
    }

    this.renderLines(graph);
    graph.force.start();
  },

  //utility to add a node
  addNode: function(graph, identifier, name) {

    var element = {id: identifier, text: name, radius: 30};

    //insert only if not present
    var newNode = graph.nodes.pushIfNotExist(element, function(e) {
      return e.id === element.id;
    });

    this.renderCircles(graph);
    graph.force.start();
  },

  //utility to remove a node and associated links (from/to the node)
  removeNode: function(graph, id) {

    var index = arrayObjectIndexOf(graph.nodes, 'id', id);

    if (index >= 0) {

      graph.nodes.splice(index, 1);

      // remove all associated links
      cleanLinks(index);
      this.renderLines(graph);
      this.renderCircles(graph);
      graph.force.start();
    }

    //remove all links to or from the given node id
    function cleanLinks(index) {
      for(var i = 0, len = graph.links.length; i < len; i++) {
            if (graph.links[i].source.id === id || graph.links[i].target.id === id) {
              graph.links.splice(i, 1);
        }
      }
    }
  },

  //utility to remove all links to/from node
  removeLinksFromToNode: function(graph, id) {

    var index = arrayObjectIndexOf(graph.nodes, 'id', id);

    if (index >= 0) {
      // remove all associated links
      cleanLinks(index);
      this.renderLines(graph);
      this.renderCircles(graph);
      graph.force.start();
    }

    //remove all links to or from the given node id
    function cleanLinks(index) {
      for(var i = 0, len = graph.links.length; i < len; i++) {
            if (graph.links[i].source.id === id || graph.links[i].target.id === id) {
              graph.links.splice(i, 1);
        }
      }
    }
  },

  //utility to remove a link
  removeLink: function(graph, from, to) {
    for(var i = 0, len = graph.links.length; i < len; i++) {
      if (graph.links[i].source.id === from && graph.links[i].target.id === to) {
            graph.links.splice(i, 1);
            this.renderLines(graph);
            graph.force.start();
            return;
      }
    }
  },

  //helper function to render the lines in the graph
  //after an update to the data has occured (graph.links)
  renderLines: function(graph) {
    graph.lines = graph.lines.data(graph.force.links());
    graph.lines.enter().insert('line', '.node');
    graph.lines.attr('class', 'link');
    graph.lines.style('stroke-width', '1.5px');
    graph.lines.exit().remove();
  },

  //helper function to render the circles in the graph
  //after an update to the data has occured (graph.nodes)
  renderCircles: function(graph) {
    graph.circles = graph.circles.data(graph.force.nodes());
    graph.circles.enter().append('circle');
    graph.circles.attr('class', function(d) { return 'node ' + d.id; })
           .attr('r', 8)
           .attr('style', function(d) { return 'fill:'+ graph.context.nodeColor(d.id) + ';'; })
           .on('click', function(d) {
            graph.tip.hide();
            //console.log(d);
            graph.context.nodeClicked(d.id);
           })
           .on('mouseover', graph.tip.show)
           .on('mouseout', graph.tip.hide);
           //.call( graph.force.drag );

           /*function(d) {d3.select(this).select('text').style('visibility', 'visible');}*/

    // Remove existing text nodes on re-rendering the graph
    graph.circles.selectAll('text').remove();

    // Add new text node to each circle
    graph.circles.append('text')
      .text(function(d) {return d.text; })
      .style('visibility', 'hidden');

    graph.circles.transition()
      .duration(750)
      .delay(function(d, i) { return i * 5; })
      .attrTween('r', function(d) {
        var i = d3.interpolate(0, d.radius);
        return function(t) { return d.radius = i(t); };
      });

    graph.circles.exit().remove();
  }
}