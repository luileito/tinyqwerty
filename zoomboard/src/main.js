$(function() {

  /*
   * ZoomBoard author: Stephen Oney <http://from.so/>
   * Integration code by Luis A. Leiva <http://personales.upv.es/luileito/>
   * License: MIT <http://opensource.org/licenses/MIT>
   *
   * Accepted URL parameters for this demo:
   * size  - Keyboard size (px)
   * spell - Enable error auto-correction via spell checking for given lang code
   * uid   - User ID
   * txt   - Text used as input stimulus (url-encoded)
   */

  var url = require("../common/url.min")
    , log = require("../common/log.min")
    ;

  // Configure event logging.
  log.config({
      excludeEvents: [log.event.ENTER, log.event.LEAVE]
    , saveUrl: "results/save.php"
  });

  var $typed     = $(".typed")
    , $typedWrap = $(".typed-wrap")
    , $widget    = $(".kbd-widget")
    , $cursor    = $(".cursor")
    , $container = $(".container")
    ;

  // Cursor blinking loops forever.
  (function blinkCursor() {
    var tick = 1;
    setInterval(function cbAddBlink(){
      $cursor.css({
        'color': tick % 2 === 0 ? "black" : "transparent"
      });
      tick++;
    }, 700);
  })();

  // Optionally enable error auto-correction (see our CHI'15 workshop paper).
  var langCheck = url.param('spell');
  if (langCheck) {
    // We use a jQuery plugin, which delegates the work to a PHP-based webservice.
    // The plugin just exposes a constructor in the jQuery namespace.
    require('jquery.spellchecker.min');
    var spellChecker = new $.SpellChecker(null, {
        lang       : langCheck
      , parser     : "text"
      , webservice : {
          path   : "../common/spellservice/SpellChecker.php"
        , driver : "PSpell"
      }
    });
  }

  var size = parseInt(url.param("size")) || 150
    , ar   = $widget.width()/$widget.height()
    , nw   = size
    , nh   = size/ar
    ;
  $widget.css({
      width       : nw
    , height      : nh
  });
  $container.css({
      width       : nw
    , height      : nh/2
  });
  $typedWrap.css({
      'width'     : nw - 2 // Discount padding
    , 'height'    : nh/2
    , 'font-size' : nh/6
  });

  function getTarget() {
    return $container.data('zoomboard');
  };

  function actionType(char) {
    getTarget().flash(char);
    char = char.toLowerCase();
    log.register(log.event.TYPE, char);
    $typed.append(char);
    // Always scroll to the bottom to see newer text onscreen.
    $typedWrap.scrollTop($typedWrap[0].scrollHeight);
  };

  function actionDelete() {
    getTarget().flash("&#8656;");
    $typed.contents().last().remove();
  };

  function actionEnter() {
    getTarget().flash("&#8629;");
    var typed  = $typed.text()
      , userId = url.param("uid")
      , phrase = url.decode(url.param("txt"))
      ;
    log.register(log.event.SUBMIT, typed);
    alert("You typed: '" + typed + "'");
    $typed.text("");
    if (userId && phrase) {
      log.finish({
         uid     : userId
       , phrase  : phrase
       , kbdsize : size
      }, function cbFinish(json){
         // Expect a json-formatted response with err === 0 if success.
         var res = JSON.parse(json);
         if (res.err > 0)
           alert(res.msg);
         else
           window.top.location.reload();
      });
    }
  };

  function actionSpace() {
    getTarget().flash("&#9251;");
    if (langCheck) {
      var lastWord = $typed.text().split(" ").pop();
      spellCheck(lastWord);
    }
    $typed.append( $container.data("zoomboard").actionKey.SPACE );
  };

  function spellCheck(word) {
    if ( $.trim(word) === "") return word;
    spellChecker.check(word, function cbCheck(args){
      var incorrectWords = args[0];
      if (incorrectWords.length > 0) {
        for (var i = 0, l = incorrectWords.length; i < l; i++) {
          var wrongWord = incorrectWords[i];
          spellChecker.getSuggestions(wrongWord, function cbSuggest(suggestions){
            if (suggestions) {
              var bestWord = suggestions[0]
                , newWord  = $typed.text().replace(wrongWord, bestWord)
                ;
              onSpell(newWord);
            }
          });
        }
      }
    });
  };

  function onSpell(corrected) {
    var newTokens = corrected.split("");
    $typed.contents().remove();
    for (var i = 0, l = newTokens.length; i < l; i++) {
      actionType(newTokens[i]);
    }
  };

  // Tap to submit phrase.
  $typedWrap.click(actionEnter);

  // Disable text selection on mobile devices.
  $(document).on('selectstart', function cbCancelSelection(event){
    event.preventDefault();
  });

  // Init
  $container.zoomboard({
    original_scale: size/1000 || 0.15
  }).on("zb_key", function cbKey(event) {
    var key = event.key;
    if (!key) return;
    var actionKey = $(this).data("zoomboard").actionKey;
    switch (key) {
      case actionKey.ENTER:
        actionEnter();
        break;
      case actionKey.DELETE:
        actionDelete();
        break;
      case actionKey.SPACE:
        actionSpace();
        break;
      default:
        actionType(key);
        break;
    }
    log.register(log.event.TEXT_CHANGE, $typed.text());
  });

});
