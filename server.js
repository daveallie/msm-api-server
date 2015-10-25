var express    = require('express');
var app        = express();
var port = process.env.PORT || 8080;

var NodeCache = require( "node-cache" );
var myCache = new NodeCache( { stdTTL: 20 } );
var exec = require('child-process-promise').exec;
var MsmHelper = require('./msm_helper.js');
var msmHelper = new MsmHelper(exec, myCache);

var router = express.Router();

router.get('/v1/:id', function(req, res) {
  msmHelper.getAllInfo(req.params.id, function(result) {
    res.json(result);
  });
});

router.get('/v1/:id/status', function(req, res) {
  msmHelper.getStatus(req.params.id, function(status) {
    res.json(status);
  });
});

router.get('/v1/:id/users', function(req, res) {
  msmHelper.getUsers(req.params.id, function(users) {
    res.json(users);
  });
});


app.use('/api', router);
app.listen(port);
console.log('Magic happens on port ' + port);
