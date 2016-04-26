var express    = require('express');
var app        = express();
var port = process.env.PORT || 8080;

var NodeCache = require( "node-cache" );
var myCache = new NodeCache( { stdTTL: 20 } );
var exec = require('child-process-promise').exec;
var MsmHelper = require('./msm_helper.js');
var msmHelper = new MsmHelper(exec, myCache);

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
};

var router = express.Router();

router.post('/v1/start', function(req, res) {
  msmHelper.startAll();
  res.sendStatus(200);
});

router.post('/v1/stop', function(req, res) {
  msmHelper.stopAll(true);
  res.sendStatus(200);
});

router.get('/v1/:id', function(req, res) {
  msmHelper.getAllInfo(req.params.id, function(result) {
    res.json(result);
  });
});

router.post('/v1/:id/start', function(req, res) {
  msmHelper.start(req.params.id);
  res.sendStatus(200);
});

router.post('/v1/:id/stop', function(req, res) {
  msmHelper.stop(req.params.id, true);
  res.sendStatus(200);
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

app.use(allowCrossDomain);
app.use('/api', router);
app.listen(port);
console.log('Magic happens on port ' + port);
