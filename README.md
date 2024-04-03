This project helps people to learn the geography of their city (or any other city). Right now, it just displays a city map, adjusted for the curvature of the Earth.

It is built with React. I run the website on my Raspberry Pi, which I will connect to my domain name at some point.

# Commands
```sh
# Install dependencies
npm i

# Run locally for development:
npm run dev

# Build for production:
npm run build

# Run locally for production:
npm run pi
```
Since Vite is not intended to be used for locally hosted apps, they only provide the `preview` command for running a production build locally. This is good enough for my purposes so I use that with the --host option to expose the port to outside connections (Inside the `npm run pi` script).

# TODOs
- do CSS to it
- connect the website to my domain name [quinnlas.com](http://quinnlas.com)
- implement a game where roads/other features are drawn and the user can guess what they are
- various code TODO comments

# Using OpenStreetMaps
The APIs related to OSM are very unintuitive. I have found it useful to go to the [main site](https://www.openstreetmap.org/), right click, select `Query features` and then explore the relationships between the different data types that come up. From there, attempt to put something that works into the wizard at [Overpass Turbo](https://overpass-turbo.eu/). The visualization should tell you if you got the right thing, but the `Data` tab is also useful. The query that Overpass Turbo gives you can be sent to the [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API#Quick_Start_(60_seconds):_for_Developers/Programmers).


Following is the README for the React + Vite template:
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
