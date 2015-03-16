/*! Text Entry on Tiny QWERTY Soft Keyboards - Callout keyboard protoype. */
$(function(){

  /*
   * Author: Luis A. Leiva <http://personales.upv.es/luileito/>
   * License: MIT <http://opensource.org/licenses/MIT>
   *
   * Accepted URL parameters for this demo:
   * size  - Keyboard size (px)
   * spell - Enable error auto-correction via spell checking
   * uid   - User ID
   * txt   - Text used as input stimulus (url-encoded)
   */

  // Routes are relative to the 'common' dir, unless stated explicitly.
  var kbd = require("./kbd.min")
    , log = require("log.min")
    , url = require("url.min")
    ;

  // Configure event logging.
  log.config({
      excludeEvents: [log.event.ENTER, log.event.LEAVE]
    , saveUrl: "results/save.php"
  });

  // Define our DOM actors.
  var $keyboard  = $('.keyboard')
    , $kWrapper  = $('.k-container')
    , $tWrapper  = $('.t-container')
    , $message   = $('.message')
    , $overlay   = $('.overlay')
    , $typed     = $('.typed')
    , $typedWrap = $('.typed-wrap')
    , $cursor    = $('.cursor')
    , $hint      = $('.hint')
    , $widget    = $('.kbd-widget')
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

  // Setup layout.
  var size = parseInt(url.param("size"), 10) || 150
    , ar   = $widget.width()/$widget.height()   // Aspect Ratio
    , nw   = size                               // New Width
    , nh   = size/ar                            // New Height
    , hh   = (nh/2) * 0.8                       // Hint Height (80% padding)
    ;
  // Override styles relatives to sizing et al.
  $widget.css({
      'width'         : nw
    , 'height'        : nh
  });
  $kWrapper.css({
      'width'         : nw
    , 'height'        : nh/2
  });
  $tWrapper.css({
      'width'         : nw
    , 'height'        : nh/2
  });
  $typedWrap.css({
      'width'         : nw - 2 // Discount padding
    , 'height'        : nh/2
    , 'font-size'     : nh/6
  });
  $keyboard.css({
      'width'         : nw
    , 'height'        : nh/2
  });
  $hint.css({
      'width'         : hh
    , 'height'        : hh
    , 'font-size'     : hh * 0.8
    , 'top'           : ($typedWrap.height() - hh)/2
    , 'left'          : ($typedWrap.width()  - hh)/2
  });
  // Make overlay font-size as big as 80% of current keyboard size.
  $message.css('font-size', (nh/2) * 0.8);

  var flashTimer
    , keyboardIndex     = 0
    , isDown            = false
    , isGesture         = false
    , touchEnabled      = hasTouch()
    , containerSize     = {
        width  : $kWrapper.width()
      , height : $kWrapper.height()
    }
    , KEY_COLOR_STROKE  = '#DDD'
    , KEY_COLOR_FILL    = '#CCC'
    , KEY_COLOR_TEXT    = '#000'
    , SWIPE_MS          = 150
    , SWIPE_DX          = containerSize.width/5
    , SWIPE_DY          = containerSize.height/4
    ;

  function hasTouch() {
    return !!('ontouchstart' in window)     // most browsers
        || !!(navigator.msMaxTouchPoints);  // IE10
  };

  function drawKey(k, options) {
    var op = options || {}
      , sc = op.strokeColor ? op.strokeColor : KEY_COLOR_STROKE
      , fc = op.fillColor   ? op.fillColor   : KEY_COLOR_FILL
      , tc = op.textColor   ? op.textColor   : KEY_COLOR_TEXT
      ;
    k = retargetKey(k);
    $('<div class="key" />').css({
        'left'      : k.x
      , 'top'       : k.y
      , 'width'     : k.width
      , 'height'    : k.height
      , 'font-size' : k.width * 0.9
    }).data(k)
      .text(k.char)
      .appendTo($keyboard);
  };

  function hilite(char) {
    log.register(log.event.CALLOUT, char);
    // Display the char shown in the callout.
    $hint.data("char", char);
    if (char === " ") char = "&#9251;";
    $hint.html(char).show();
  };

  function loadKeyboard(index) {
    $keyboard.html("");
    var keys = kbd.getKeys(index);
    for (var i = 0, l = keys.length; i < l; i++) {
      drawKey(keys[i]);
    }
    flash(kbd.keyboard.layouts[index].name, '#66CCFF');
    log.register(log.event.LOAD, index);
  };

  function cursorPos(event) {
    var evt = event.originalEvent
      , pos = {
          x: evt.pageX
        , y: evt.pageY
      };
    if (touchEnabled) {
      var touch = evt.touches[0] || evt.changedTouches[0];
      pos.x = touch.pageX;
      pos.y = touch.pageY;
    }
    return pos;
  };

  function globalToLocal(p) {
    var el = $widget[0]
      , ch = $tWrapper.height()
      ;
    return {
        x: p.x - el.offsetLeft
      , y: p.y - el.offsetTop - ch
    };
  };

  function onPointerPress(event) {
    isDown = true;
    var p = globalToLocal(cursorPos(event));
    log.register(log.event.PRESS, p);
    toggleText();
    hintLens(event);
  };

  function onPointerMove(event) {
    if (!isDown) return;
    var p = globalToLocal(cursorPos(event));
    log.register(log.event.MOVE, p);
    hintLens(event);
  };

  function onPointerRelease(event) {
    isDown = false;
    var p = globalToLocal(cursorPos(event));
    log.register(log.event.RELEASE, p);
    toggleText();
    var char = $hint.data("char");
    if (char) type(char);
  };

  function onPointerEnter(event) {
    isDown = false;
    var p = globalToLocal(cursorPos(event));
    log.register(log.event.ENTER, p);
    toggleText();
  };

  function onPointerLeave(event) {
    isDown = false;
    var p = globalToLocal(cursorPos(event));
    log.register(log.event.LEAVE, p);
    toggleText();
  };

  function retargetKey(k) {
    var km = kbd.measure(keyboardIndex)
      , sc = containerSize.width/km.width * 0.9
      ;
    var keyboardWidth  = km.width  * sc
      , keyboardHeight = km.height * sc
      , ow = (containerSize.width  - keyboardWidth)  / 2
      , oh = (containerSize.height - keyboardHeight) / 2
      ;
    return {
        x     : ow + k.x * sc
      , y     : oh + k.y * sc
      , width : k.width  * sc
      , height: k.height * sc
      , char  : k.char
    };
  };

  function getClosestKey(p) {
    var keys    = kbd.getKeys(keyboardIndex)
      , dist    = Number.MAX_VALUE
      , closest = null
      , k       // Actual key object
      , q       // Key object copy
      ;
    for (var i = 0, l = keys.length; i < l; i++) {
      k = keys[i];
      q = $.extend({}, k);
      k = retargetKey(k);
      // Collision detection.
      if (p.x > k.x && p.x < k.x + k.width && p.y > k.y && p.y < k.y + k.height) {
        closest = q;
        break;
      } else {
        var cX = k.x + k.width/2
          , cY = k.y + k.height/2
          , d2 = Math.pow(p.x - cX, 2) + Math.pow(p.y - cY, 2)
          ;
        if (d2 < dist) {
          dist    = d2;
          closest = q;
        }
      }
    }
    return closest;
  };

  function hintLens(event) {
    var key
      , $target = getTarget(event)
      ;
    if ($target.hasClass("key")) {
      key = $target.data();
    } else {
      // The user hasn't hovered over any key... find closest match.
      var p = globalToLocal(cursorPos(event));
      key = getClosestKey(p);
    }
    var char = key ? key.char : null;
    hilite(char);
  };

  function getTarget(event) {
    var target;
    if (touchEnabled) {
      var evt   = event.originalEvent
        , touch = evt.touches[0] || evt.changedTouches[0]
        ;
      target = document.elementFromPoint(touch.pageX, touch.pageY);
    } else {
      target = event.target;
    }
    return $(target);
  };

  function toggleText() {
    if (isDown) {
      $hint.show();
      $typed.addClass("highlighted");
    } else {
      $hint.text("").hide();
      $typed.removeClass("highlighted");
    }
  };

  function handleSwipe(event) {
    event.preventDefault();
    function removeSwipeHandlers() {
      $kWrapper.off("touchmove.swipe touchend.swipe mousemove.swipe mouseup.swipe");
    };
    var start     = cursorPos(event)
      , startTime = event.timeStamp
      ;
    $kWrapper.on("touchmove.swipe mousemove.swipe", function addSwipe(ev){
      var end     = cursorPos(ev)
        , endTime = ev.timeStamp
        , dx      = start.x - end.x
        , dy      = start.y - end.y
        ;
      if (endTime - startTime < SWIPE_MS) {
        if (Math.abs(dx) >= SWIPE_DX) {
          if (dx > 0) {
            onSwipe(kbd.swipeKey.LEFT);
            removeSwipeHandlers();
          } else {
            onSwipe(kbd.swipeKey.RIGHT);
            removeSwipeHandlers();
          }
        } else if (Math.abs(dy) >= SWIPE_DY) {
          if (dy > 0) {
            onSwipe(kbd.swipeKey.DOWN);
            removeSwipeHandlers();
          } else {
            onSwipe(kbd.swipeKey.UP);
            removeSwipeHandlers();
          }
        }
      }
    });
    $kWrapper.on("touchend.swipe mouseup.swipe", removeSwipeHandlers);
  };

  function actionType(char) {
    flash(char);
    char = char.toLowerCase();
    log.register(log.event.TYPE, char);
    $typed.append(char);
    $hint.data("char", null);
    // Always scroll to the bottom to see newer text onscreen.
    $typedWrap.scrollTop($typedWrap[0].scrollHeight);
  };

  function actionDelete() {
    flash("&#8656;");
    $typed.contents().last().remove();
  };

  function actionEnter() {
    flash("&#8629;");
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
         if (res.err > 0) alert(res.msg);
         else window.top.location.reload();
      });
    }
  };

  function actionSpace() {
    flash("&#9251;");
    if (langCheck) {
      var lastWord = $typed.text().split(" ").pop();
      spellCheck(lastWord);
    }
    $typed.append(kbd.actionKey.SPACE);
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

  function type(char) {
    if (isGesture) return;
    switch (char) {
      case kbd.actionKey.ENTER:
        actionEnter();
        break;
      case kbd.actionKey.DELETE:
        actionDelete();
        break;
      case kbd.actionKey.SPACE:
        actionSpace();
        break;
      default:
        actionType(char);
        break;
    }
    log.register(log.event.TEXT_CHANGE, $typed.text());
  };

  function onSwipe(direction) {
    isGesture = true;
    log.register(log.event.SWIPE, direction);
    switch (direction) {
      case kbd.swipeKey.LEFT:
        actionDelete();
        break;
      case kbd.swipeKey.RIGHT:
        actionSpace();
        break;
      case kbd.swipeKey.UP:
        init(++keyboardIndex);
        break;
      case kbd.swipeKey.DOWN:
        init(--keyboardIndex);
        break;
      default:
        break;
    }
    setTimeout(function cbGesture(){
      isGesture = false;
    }, SWIPE_MS);
  };

  function isPrintable(event) {
    if (typeof event.which === undefined) {
      // IE only fires keypress events for printable keys.
      return true;
    } else if (typeof event.which == "number" && event.which > 0) {
      return !event.ctrlKey && !event.metaKey && !event.altKey && event.which != 8;
    }
    return false;
  };

  function flash(char, color) {
    color = color || 'white';
    clearTimeout(flashTimer);
    $message.html(char);
    $overlay.css({
        'zIndex'  : 1
      , 'opacity' : 0.5
    }).show();
    var mw = $message.width()
      , mh = $message.height()
      , ow = $overlay.width()
      , oh = $overlay.height()
      , op = $overlay.position()
      ;
    $message.css({
        'zIndex' : 2
      , 'color'  : color
      , 'top'    : op.top  + (oh - mh)/2
      , 'left'   : op.left + (ow - mw)/2
    });
    flashTimer = setTimeout(function cbFlash(){
      $message.html("");
      $overlay.css({
          'zIndex'  : 0
        , 'opacity' : 0
      }).hide();
    }, 250);
  };

  function addTouchEvent(event, fn) {
    $kWrapper.on(event, function cb(evt){
      evt.preventDefault();
      fn(evt);
    });
  };

  if (touchEnabled) {
    var evts = {
        'touchstart': onPointerPress
      , 'touchmove' : onPointerMove
      , 'touchend'  : onPointerRelease
      , 'touchenter': onPointerEnter
      , 'touchleave': onPointerLeave
    };
    for (var e in evts) {
      addTouchEvent(e, evts[e]);
    }
  } else {
    $kWrapper
      .on('mousedown',  onPointerPress)
      .on('mousemove',  onPointerMove)
      .on('mouseup',    onPointerRelease)
      .on('mouseleave', onPointerLeave)
      .on('mouseenter', onPointerEnter)
  }

  // Allow text entry with a regular keyboard for the in-browser demos.
  $(document).keypress(function cbKeyPress(event){
    event.preventDefault();
    var keyCode = event.keyCode || event.which;
    var char = String.fromCharCode(keyCode);
    if (isPrintable(event)) {
      type(char);
    }
  });

  // Handle special keys for the in-browser demos.
  $(document).keydown(function cbKeyDown(event){
    var keyCode = event.keyCode || event.which;
    if (keyCode === 37) {
      onSwipe(kbd.swipeKey.LEFT);
    } else if (keyCode === 39) {
      onSwipe(kbd.swipeKey.RIGHT);
    } else if (keyCode === 38) {
      onSwipe(kbd.swipeKey.UP);
    } else if (keyCode === 40) {
      onSwipe(kbd.swipeKey.DOWN);
    } else {
      if (keyCode === 8) {
        event.preventDefault();
        type(kbd.actionKey.DELETE);
      } else if (keyCode === 13) {
        type(kbd.actionKey.ENTER);
      }
    }
  });

  function init(index) {
    $hint.hide();
    $overlay.hide();
    // This allows for "circular" keyboard selection.
    if (index < 0) {
      index = kbd.keyboard.layouts.length - 1;
    } else if (index > kbd.keyboard.layouts.length - 1) {
      index = 0;
    }
    keyboardIndex = index;
    loadKeyboard(index);
    // This amends visually the lack of touchleave support on mobile browsers.
    $typed.removeClass("highlighted");
  };

  // Add swipe listeners.
  $kWrapper.on("touchstart.swipe mousedown.swipe", handleSwipe);

  // Tap to submit phrase.
  $typedWrap.click(actionEnter);

  // Disable text selection on mobile devices.
  $(document).on('selectstart', function cbCancelSelection(event){
    event.preventDefault();
  });

  // Launch demo.
  init(keyboardIndex);

});
