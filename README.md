# City Stats mashup

Project URL (to be available soon).

## About

City Stats mashup is an Open Data visualisation, a stand-alone client application, built in [Angular](https://angularjs.org/) and [D3.js](http://d3js.org/) intended for exploring statistical data. The current implementation explores statistics about cities and villages in [Cyprus](http://en.wikipedia.org/wiki/Cyprus). These can be grouped together via the graphical interface for aggregated results, hence deeper exploration and comparison.

The project is currently under development, needs code clean-up and extensions, but it is in fully working condition. To try out a demo simply clone the repository, place in your web server, and open "dev/client/index.html" in any modern browser. A dummy dataset (dev/client/data.json) is used for testing and demonstrating purposes. See screenshots below for what to expect in a live deployment.

The following modules have been extracted for stand-alone chart and graph rendering:

- [D3 dynamic grouped bar chart](https://github.com/chriskmnds/d3-dynamic-grouped-bar-chart)
- [D3 force layout API](https://github.com/chriskmnds/d3-force-layout-api)

### Screenshots

Adding and grouping nodes/cities:

![alt tag](./img/05.55.17.png)

Start-up state of the application:

![alt tag](./img/05.55.47.png)

Background map image from Google Maps.
