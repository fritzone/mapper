// the states of the placer
const NOT_PLACING = 1;
const PLACING = 2;
const INSIDE_FIRST_CIRCLE = 3;

var state = NOT_PLACING;			 	// 1 - not placing, 2 - placing, 3 - inside the first circle
var clicks = [];			            // the points coordinates where we have clicked
var last_polyline = null;	            // contains the lines for the recent building contour 
var first_circle = null;                // the circle on the first click for the current contour
var small_circles = [];                 // the small circles

// The accumulated stuff comes here
var all_polylines = [];

var popup = L.popup();

function onMapClick(e) 
{
    if( state == NOT_PLACING)
    {
        console.log("Clickie, state will be 2");
        state = PLACING;
    }

    console.log("New click, clicks=", clicks);
    if(state != INSIDE_FIRST_CIRCLE)
    {
        clicks.push( e.latlng );	
        // create a small circle for it
        var new_circle = L.circle([e.latlng.lat, e.latlng.lng], 0.5, {
            color: 'blue',
            fillColor: '#f03',
            fillOpacity: 0.5
        }).addTo(mymap);
        small_circles.push(new_circle);
    }
    else
    {
        state = NOT_PLACING;
        console.log("Full polygon:", clicks);

        // fixing the polyline to be exact, not hanging around the last click
        if(last_polyline != null)
        {
            last_polyline.remove();  
        }

        var last_clicks = clicks.slice();   // copy
        last_clicks.push(clicks[0]);        // close the polygon
        last_polyline = L.polyline(last_clicks, {color: 'black'}).addTo(mymap);

        // remove the first circle, not needed anymore
        if(first_circle != null)
        {
            first_circle.remove();
            first_circle = null;
        }

        popup
            .setLatLng(e.latlng)
            .setContent("<button onclick='create_loc()'>Create location</button>")
            .openOn(mymap);
    }
    e.originalEvent.preventDefault();
}

function create_loc()
{  
    var t = JSON.stringify(clicks);
    console.log(t);
    $.post( "/create", {coords:JSON.parse(t)},
    function(data, status)
    {
            // here we have got back the ID of the new structure
            // save it to the all_polylines fur future reference
            all_polylines.push({"id": data, "coords":last_polyline});

            // clear previous stuff
            popup.remove();
            clicks = []
            last_polyline = null;
            
            // now make the data div visible
            $('#descdiv').show();

            console.log(all_polylines);
    }
    );
}

function onMouseMove(e)
{
    if(state == PLACING || state == INSIDE_FIRST_CIRCLE)
    {
        if(last_polyline != null && clicks.length > 2)
        {
            var i=0;
            var last_segment = L.polyline([ clicks[clicks.length - 1], e.latlng ]);

            for(i=0; i<clicks.length - 2; i++ )
            {
                var c_segment = L.polyline([ clicks[i], clicks[i+1] ]);
                // see if current line will intersect with any of the previous ones
                // current line:
                // does it intersect?
                var intersection = turf.lineIntersect(c_segment.toGeoJSON(), last_segment.toGeoJSON());

                if(intersection.features.length > 0)
                {
                    var intersectionCoord = intersection.features[0].geometry.coordinates;
                    L.circle(intersectionCoord, 300, {
                        color: 'red',
                        fillColor: '#f03',
                        fillOpacity: 0.5
                    }).addTo(mymap);

                    console.log("intersect:" , intersection);
                }
            }
        }

        if(last_polyline != null)
        {
            last_polyline.remove();  // remove from the map if it ws there
        }

        var last_clicks = clicks.slice();   // copy
        last_clicks.push(e.latlng);         // just the current position for the "moving" part, all the others are there already
        last_polyline = L.polyline(last_clicks, {color: 'black'}).addTo(mymap);
        var dist = clicks[0].distanceTo(e.latlng);
        if(dist < 2.0)
        {
            if( first_circle == null)
            {
                first_circle = L.circle([clicks[0].lat, clicks[0].lng], 1, {
                    color: 'green',
                    fillColor: '#f03',
                    fillOpacity: 0.5
                }).addTo(mymap);
            }
            state = INSIDE_FIRST_CIRCLE;
        }
        else
        {
            state = PLACING;
            if(first_circle != null)
            {
                first_circle.remove();
                first_circle = null;
            }
        }
    }
}

mymap.on('click', onMapClick);
mymap.on('mousemove', onMouseMove);
