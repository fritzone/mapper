var utils = require('../utils')
var express = require('express');
var router = express.Router();
var couchbase = require('couchbase')

router.use(function timeLog (req, res, next) {
  console.log('Time: ', Date.now())
  next()
})

/* Get the loations */
router.get('/',  function locationGet(req, res) {

  var cluster = new couchbase.Cluster('http://localhost:8091')
  cluster.authenticate("placer", "s321851gper")
  var bucket = cluster.openBucket('places')
  var n1ql = 'SELECT * FROM places'
  bucket.enableN1ql(['1.1.1.1:8093'])

  var N1qlQuery = couchbase.N1qlQuery;

  var query = N1qlQuery.fromString(n1ql)
  console.log("start query")

  bucket.query(query, function (err, result) {
    if (err) {
      releaseEvents.status(500).send("")
    } else {
      res.send(result)
    }
  })
});

module.exports = router;
