(function(module, global){

  var evts = []
    , conf = {
        debug         : false
      , saveUrl       : "path.to.saver.file.php"
      , excludeEvents : []
    };

  // Prepare data for submitting.
  function serialize(data) {
    var params = [];
    for (var d in data) {
      params.push(d + "=" + data[d]);
    }
    return params.join("&");
  };

  // Get milliseconds.
  function getMs() {
    return (new Date).getTime();
  };

  module.exports = {

    // Event names.
    event: {
        LOAD        : "load"
      , PRESS       : "press"
      , RELEASE     : "release"
      , MOVE        : "move"
      , ENTER       : "enter"
      , LEAVE       : "leave"
      , SWIPE       : "swipe"
      , TYPE        : "type"
      , SUBMIT      : "submit"
      , TEXT_CHANGE : "textchange"
      , CALLOUT     : "callout"
      , ZOOM_IN     : "zoomin"
      , ZOOM_OUT    : "zoomout"
    },

    // Configuration method.
    config: function(opts) {
      for (var o in opts) {
        if (opts.hasOwnProperty(o) && opts[o] !== null) {
          conf[o] = opts[o];
        }
      }
      return this;
    },

    // Event logging method.
    register: function() {
      if (conf.excludeEvents.indexOf(arguments[0]) === -1) {
        var args = Array.prototype.slice.call(arguments)
          , info = [ getMs(), args[0], args.slice(1) ]
          ;
        evts.push(info);
        if (conf.debug) console && console.log(info);
      }
      return this;
    },

    // Finish logging method. Assumes a JSON-formatted response.
    finish: function(data, callback) {
      if (!data) return false;
      data.events = JSON.stringify(evts);
      var request = new XMLHttpRequest();
      request.open("POST", conf.saveUrl, true);
      request.setRequestHeader('Content-Type', "application/x-www-form-urlencoded");
      request.onreadystatechange = function reqStatus() {
        if (request.readyState === 4) {
          if (request.status !== 200) {
            if (conf.debug) console && console.log(request);
          } else {
            if (typeof callback === 'function')
              callback(request.responseText);
          }
          evts = [];
        }
      };
      request.send( serialize(data) );
    }

  };

})('object' === typeof module ? module : {}, this);
