var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', 
function(req, res, next) {
  var appDir = path.dirname(require.main.filename);
  res.sendFile(path.join(appDir + '/../public/places.html'));
}
);

module.exports = router;
