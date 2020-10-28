// and now load all the places from the database

var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

function load_locations(each_building_callback, each_building_click)
{
    $.get( "/locations",
    function(data, status)
    {
        for(i=0;i<data.length;i++)
        {
            // console.log(data[i])
            var building = data[i]["places"]
            var polygonGjs = L.geoJSON(building,
                {    
                    style: myStyle,
                    onEachFeature: function (feature, layer) {
                        // save this outside
                        layer._leaflet_id = feature.id;                                   
                        console.log("id:", feature.id)
                        layer.on('mouseover', function () {
                          this.setStyle({
                            'fillColor': '#0000ff'
                          });
                        }); 
                        layer.on('mouseout', function () {
                          this.setStyle({
                            'fillColor': '#ff0000'
                          });
                        });
                        layer.on('click', function () {
                          // Let's say you've got a property called url in your geojsonfeature:
                          //window.location = feature.properties.url;
                          //each_building_click(feature.properties.building_id);
                        });
                    }
                })
            .addTo(mymap);

            each_building_callback(building, data[i]["places"]["id"]);
            glayers[data[i]["places"]["id"]] = polygonGjs;

        }
    }
    );
}
