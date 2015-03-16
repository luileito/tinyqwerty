(function(module, global){

  module.exports = {

    // Context to resolve URLs.
    context: window.top,

    // This function behaves exactly as PHP's urlencode.
    encode: function(str) {
      return encodeURIComponent(str).replace(/!/g, '%21')
                                    .replace(/'/g, '%27')
                                    .replace(/\(/g, '%28')
                                    .replace(/\)/g, '%29')
                                    .replace(/\*/g, '%2A')
                                    .replace(/%20/g, '+');
    },

    // This function behaves exactly as PHP's urldecode.
    decode: function(str) {
      return decodeURIComponent(str).replace(/%21/g, '!')
                                    .replace(/%27/g, "'")
                                    .replace(/%28/g, '(')
                                    .replace(/%29/g, ')')
                                    .replace(/%2A/g, '*')
                                    .replace(/\+/g, ' ');
    },

    // Go to given URI.
    navTo: function(uri) {
      this.context.location.href = uri;
    },

    // Reload current URI.
    reload: function() {
      this.context.location.reload();
    },

    // Get given URL param.
    param: function(name, search) {
      name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
      var regexp  = new RegExp( "[\\?&]" + name + "=([^&#]*)" )
        , results = regexp.exec( (search || this.context.location.search) )
        ;
      return results === null ? "" : results[1];
    },

    // Get all URL parameters as an object.
    params: function(search) {
      var qStr = (search || this.context.location.search).replace('?','').split('&')
        , qObj = {}
        ;
      if (typeof qStr === 'undefined') return (typeof qStr);
      for (var i = 0, l = qStr.length; i < l; i++) {
        var tuple = qStr[i].split("=");
        qObj[ tuple[0] ] = tuple[1];
      }
      return qObj;
    }

  };

})('object' === typeof module ? module : {}, this);
