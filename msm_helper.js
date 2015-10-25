var exec, myCache;

var MsmHelper = function(execIn, myCacheIn) {
  exec = execIn;
  myCache = myCacheIn;
};

MsmHelper.prototype.getStatus = function(id, callback) {
  var value = myCache.get('status');
  if (value === undefined) {
    exec('sudo msm ' + id + ' status')
      .then(function(result) {
        var message = result.stdout.trim();
        value = {status: message.slice(-8, -1), updated_at: new Date()};
        myCache.set('status', value);
        callback(value);
      })
      .fail(function(err) {
        callback({status: 'failed', updated_at: null});
      });
  } else {
    callback(value);
  }
};

MsmHelper.prototype.getUsers = function(id, callback, status) {
  if (typeof status === 'undefined') {
    var msmThis = this;
    msmThis.getStatus(id, function(result) {
      msmThis.getUsers(id, callback, result.status);
    });
  } else {
    if (status === 'running') {
      var value = myCache.get('users');
      if (value === undefined) {
        exec('sudo msm ' + id + ' connected')
          .then(function(result) {
            var users = result.stdout.trim().split("\n");
            if (users[0] === "No players are connected.") {
              value = {userlist: [], updated_at: new Date()};
            } else {
              value = {userlist: result.stdout.trim().split("\n"), updated_at: new Date()};
            }
            myCache.set('users', value);
            callback(value);
          })
          .fail(function(err) {
            callback({userlist: ['ERROR'], updated_at: null});
          });
      } else {
        callback(value);
      }
    } else {
      callback({userlist: [], updated_at: new Date()});
    }
  }
};

MsmHelper.prototype.getAllInfo = function(id, callback) {
  var msmThis = this;
  msmThis.getStatus(id, function(result) {
    var status = result;
    msmThis.getUsers(id, function(result) {
      callback({status: status, users: result});
    }, status.status);
  });
};

module.exports = MsmHelper;