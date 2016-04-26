var exec, myCache, msmBin = '/usr/local/bin/msm';

var msmExec = function(cmd) {
    return exec(msmBin + ' ' + cmd);
};

var MsmHelper = function(execIn, myCacheIn) {
  exec = execIn;
  myCache = myCacheIn;
};

MsmHelper.prototype.getStatus = function(id, callback) {
  var value = myCache.get(id + '_status');
  if (value === undefined) {
    msmExec(id + ' status')
      .then(function(result) {
        var message = result.stdout.trim();
        value = {status: message.slice(-8, -1), updated_at: new Date()};
        myCache.set('status', value);
        callback(value);
      })
      .fail(function(err) {
        console.error('Failed to get status for id: ' + id)
        console.error(err)
        callback({status: 'failed', updated_at: new Date()});
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
      var value = myCache.get(id + '_users');
      if (value === undefined) {
        msmExec(id + ' connected')
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
            console.error('Failed to get user list for id: ' + id)
            console.error(err)
            callback({userlist: ['ERROR'], updated_at: new Date()});
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

MsmHelper.prototype.start = function(id) {
  msmExec(id + ' start')
};

MsmHelper.prototype.stop = function(id, stop_now) {
  msmExec(id + ' stop' + (stop_now ? ' now' : ''))
};

MsmHelper.prototype.startAll = function() {
  msmExec('start')
};

MsmHelper.prototype.stopAll = function(stop_now) {
  msmExec('stop' + (stop_now ? ' now' : ''))
};

module.exports = MsmHelper;
