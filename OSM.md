Because OpenStreetMap is very confusing, I am documenting my process for using it here.

Useful reference:
https://github.com/anvaka/city-roads - This project uses OSM to display all roads for a city.
https://www.reddit.com/r/openstreetmap/comments/q4qfax/capture_details_at_each_zoom_level/ - someone trying to do something similar
https://www.reddit.com/r/openstreetmap/comments/q7veog/what_determines_which_points_of_interest_appear/ - an explanation thread for the person above

# Using OpenStreetMaps

The APIs related to OSM are very unintuitive. I have found it useful to go to the [main site](https://www.openstreetmap.org/), right click, select `Query features` and then explore the relationships between the different data types that come up. From there, attempt to put something that works into the wizard at [Overpass Turbo](https://overpass-turbo.eu/). The visualization should tell you if you got the right thing, but the `Data` tab is also useful. The query that Overpass Turbo gives you can be sent to the [Overpass API](<https://wiki.openstreetmap.org/wiki/Overpass_API#Quick_Start_(60_seconds):_for_Developers/Programmers>).

# Background

## Zoom Levels

Zoom levels are not inherently part of OSM data. However, the main site determines what to show at each zoom level from an official set of stylesheets, so that's what I will start with. This is found here: https://github.com/gravitystorm/openstreetmap-carto. So if you look at the main site in the network requests part of dev tools, you will see that it is loading images from URLs like this: https://tile.openstreetmap.org/11/494/738.png. Notice that the first part of the route is "11", this is the zoom level. A lower number means you are zoomed out. However, I'm not going to use the zoom level as it's somewhat arbitrary.

## Better than zoom levels

The data in OSM is already tiered. So for roads, for example, there are different levels depending on the value of the `highway` key: https://wiki.openstreetmap.org/wiki/Key:highway
So that gives us the order:

-   motorway
-   trunk
-   primary
-   secondary
-   tertiary
-   unclassified
-   residential
