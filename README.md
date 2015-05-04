# City Stats mashup

Project URL: (to be available soon)

## About

City Stats mashup is a stand-alone Open Data visualisation built in [Angular](https://angularjs.org/) and [D3.js](http://d3js.org/) intended for exploring statistical/demographic data about cities and villages. These can be grouped together via the graphical interface for aggregated results, hence deeper exploration and comparison. An online implementation exploring cities and villages in Cyprus will be available soon.

The project is currently under development, needs code clean-up and extensions, but it is in fully working condition. To **try out a demo** simply clone the repository, place in your web server, and open `dev/client/index.html` in any modern browser. A dummy dataset (dev/client/data.json) is used for testing and demonstrating purposes. See screenshots below for what to expect in a live deployment.

The following modules provide stand-alone APIs for dynamic chart and force-layout implementations:

- [D3 Dynamic Grouped Bar Chart](https://github.com/chriskmnds/d3-dynamic-grouped-bar-chart)
- [D3 Force Layout API](https://github.com/chriskmnds/d3-force-layout-api)

## Screenshots

Adding and grouping nodes/cities:

![alt tag](./img/05.55.17.png)

Start-up state of the application:

![alt tag](./img/05.55.47.png)

Background map image from Google Maps.

## License

MIT
