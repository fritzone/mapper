var utils = require('../utils')
var express = require('express');
var router = express.Router();
var couchbase = require('couchbase')

/* POST users listing. */
router.post('/create',  function(req, res) {
  var coords = req.body.coords;
  console.log(coords);

  var cluster = new couchbase.Cluster('http://localhost:8091')
  cluster.authenticate("placer", "s321851gper")
  var bucket = cluster.openBucket('places')

  //geojson object

  var jsonData = {};
  jsonData["type"] = "Feature"
  jsonData["properties"] = {}
  jsonData["properties"]["name"] = "Nameless"
  jsonData["geometry"] = {}
  jsonData["geometry"]["type"] = "MultiPolygon"
  jsonData["geometry"]["coordinates"] = []

  var v1 = []
  for(i=0; i<coords.length; i++)
  {
    var ccor = []
    ccor.push(coords[i]["lng"])
    ccor.push(coords[i]["lat"])
    v1.push(ccor)
  }

  var v2 = []
  v2.push(v1)
  jsonData["geometry"]["coordinates"].push(v2)

  var id = utils.makeid()
  // create the ID for it
  jsonData["id"] = id

  // add a document to a bucket
  bucket.insert(id, jsonData, function(err, result) {
    if (!err) {
        console.log("stored document successfully. CAS is %j", result.cas);
    } else {
        console.error("Couldn't store document: %j", err);
    }
  });

  console.log("Still here")

  res.send(id);
});

module.exports = router;
