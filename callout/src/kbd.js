/*! Text Entry on Tiny QWERTY Soft Keyboards - Callout keyboard. */
(function(module, global){

  /**
   * Author: Luis A. Leiva <http://personales.upv.es/luileito/>
   * License: MIT <http://opensource.org/licenses/MIT>
   */

  module.exports = {

    keyboard: require('./keys.min'),

    swipeKey: {
        LEFT  : "<left>"
      , RIGHT : "<right>"
      , UP    : "<up>"
      , DOWN  : "<down>"
    },

    actionKey: {
        ENTER  : "<enter>"
      , DELETE : "<delete>"
      , SPACE  : " "
    },

    getKeys: function(index) {
      var lout = this.keyboard.layouts[index]
        , keys = lout.keys
        , keyb = []
        ;
      for (var i = 0, l = keys.length; i < l; i += 5) {
        keyb.push({
            x      : keys[i]
          , y      : keys[i+1]
          , width  : keys[i+2]
          , height : keys[i+3]
          , char   : keys[i+4]
        });
      }
      return keyb;
    },

    measure: function(index) {
      var kdef = this.keyboard
        , keys = this.getKeys(index)
        ;
      var nr    = 0 // Num Rows
        , nc    = 0 // Num Cols
        , prevX = 0 // Previous X position
        , prevY = 0 // Previous Y position
        ;
      for (var k, i = 0, l = keys.length; i < l; i++) {
        k = keys[i];
        if (i === 0 || k.x > prevX) {
          prevX = k.x;
          nc++;
        }
        if (i === 0 || k.y > prevY) {
          prevY = k.y;
          nr++;
        }
      }
      return {
          width  : kdef.keyWidth  * nc
        , height : kdef.keyHeight * nr
      };
    }

  };

})('object' === typeof module ? module : {}, this);
