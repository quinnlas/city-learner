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

Now these can give a lot of random small roads, like a service road for a highway listed at the motorway level. So I think the best way to handle this is to sort the ways by number of nodes.

# OSM Notes

These are some general notes about OSM that are relevant to this project.

## Data Structure

### Element Types

All OSM data is made of elements. Elements have exactly one type:

-   Node - a point with a lat/lon.
-   Way - a connected sequence of nodes.
    -   Closed way - a way with the same first and last node, forming a loop. This is not an element type, it's just an implicit property some ways have.
-   Relation - A group of nodes, ways, or further relations that can be used for various purposes.

### Areas

Since a city is an area, they are especially important to this project.

An area can be represented multiple ways. It is not an element type.

-   Way - If an area can be represented by one polygon, it can be a closed way. Most closed ways are areas (the exception would be something like a roundabout, where the region inside the loop is not important). Determining if a closed way is an area or not is not important for this project.
-   Relation - Commonly called "multipolygon". These contain exclusively ways. The ways can be "outer" or "inner", since areas can have holes in them. For our purposes, we can probably ignore inner areas.

### IDs

Each element type has its own type of ID, which is unique within that element type. So a node and a way can have the same ID, for example, but two nodes will have different IDs. Since closed ways and areas all still have the element type "way", they have unique IDs from each other.

### Tags

Any element can have tags. "A tag is a key=value pair describing what the element is." Of particular importance for this project is the key "highway", which is used to denote "highways, roads, paths, footways, cycleways, bus stops, etc". The values of this tag are also important.

## Nominatim

This is a search service that returns different useful information about the search matches. The main parts we want are the display_name, osm_type, and osm_id.

## Overpass API

This is a service used primarily for complex read-only querying. The main OSM API is optimized for editing. Since this project is read-only and makes complex queries filtering for area, street type, etc, we need to use the Overpass API.

There are many layers to the Overpass API, but the basic idea is that you submit a query written in "Overpass QL" and get a result back. Overpass QL is documented here: https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL

One important note is that there is a difference between the `out:` setting and the `out` statement in Overpass QL. `out:` controls the format of the data (this project always uses JSON) and `out` controls which data about each OSM element is provided.