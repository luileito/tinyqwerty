/*! Text Entry on Tiny QWERTY Soft Keyboards - ZShift keyboard protoype. */
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
    ;

  $widget.css({
      'width'     : nw
    , 'height'    : nh
  });
  $kWrapper.css({
      'width'     : nw
    , 'height'    : nh/2
  });
  $tWrapper.css({
      'width'     : nw
    , 'height'    : nh/2
  });
  $typedWrap.css({
      'width'     : nw - 2  // Discount padding
    , 'height'    : nh/2
    , 'font-size' : nh/6
  });
  $hint.css({
      'width'     : nw
    , 'height'    : nh/2
  });
  $keyboard.css({
      'width'     : nw
    , 'height'    : nh/2
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
    , IMG_UPSAMPLING    = 2 // Improves canvas rendering
    , KEY_COLOR_STROKE  = '#DDDDDD'
    , KEY_COLOR_FILL    = '#DDDDDD'
    , KEY_COLOR_TEXT    = '#000000'
    , SWIPE_MS          = 150
    , SWIPE_DX          = containerSize.width/5
    , SWIPE_DY          = containerSize.height/4
    , hintedKey
    ;

  function hasTouch() {
    return !!('ontouchstart' in window)     // most browsers
        || !!(navigator.msMaxTouchPoints);  // IE10
  };

  function drawKey(k, options) {
    if (!k) return;
    var op = options || {}
      , sc = op.strokeColor ? op.strokeColor : KEY_COLOR_STROKE
      , fc = op.fillColor   ? op.fillColor   : KEY_COLOR_FILL
      , tc = op.textColor   ? op.textColor   : KEY_COLOR_TEXT
      ;
    k = retargetKey(k);
    var ctx         = getContext($keyboard[0]);
    ctx.fillStyle   = fc;
    ctx.strokeStyle = sc;
    ctx.clearRect(k.x,k.y, k.width,k.height);
    // Draw key box.
    ctx.beginPath();
    ctx.rect(k.x,k.y, k.width,k.height);
    ctx.fill();
    ctx.stroke();
    // Draw key char.
    ctx.font         = 'bold ' + (k.width*1.2)/2 + 'pt sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = tc;
    ctx.fillText(k.char, (k.x + k.width/2), (k.y + k.height/2));
  };

  function hilite(k) {
    log.register(log.event.CALLOUT, k.char);
    drawKey(k, {
        fillColor   : "#FF9966"
      , textColor   : "#000000"
      , strokeColor : "#CC3300"
    });
  };

  function loadKeyboard(index) {
    var keys    = kbd.getKeys(index)
      , kCanvas = $keyboard[0]
      , hCanvas = $hint[0]
      , up      = IMG_UPSAMPLING
      ;
    // Redraw canvas.
    kCanvas.width  = hCanvas.width  = containerSize.width  * up;
    kCanvas.height = hCanvas.height = containerSize.height * up;
    var ctx = getContext(kCanvas);
    // Background.
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, kCanvas.width, kCanvas.height);
    for (var k, i = 0; i < keys.length; i++) {
      drawKey(keys[i]);
    }
    // Flag hinted key as dirty for redrawing later.
    hintedKey = null;
    // Display keyboard name.
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
      , up = IMG_UPSAMPLING
      ;
    return {
        x: (p.x - el.offsetLeft)     * up
      , y: (p.y - el.offsetTop - ch) * up
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
    drawKey(hintedKey);
    type(getClosestKey(p).char);
  };

  function onPointerEnter(event) {
    isDown = false;
    var p = globalToLocal(cursorPos(event));
    log.register(log.event.ENTER, p);
    drawKey(hintedKey);
    toggleText();
  };

  function onPointerLeave(event) {
    isDown = false;
    var p = globalToLocal(cursorPos(event));
    log.register(log.event.LEAVE, p);
    drawKey(hintedKey);
    toggleText();
  };

  function retargetKey(k) {
    var km = kbd.measure(keyboardIndex)
      , up = IMG_UPSAMPLING
      , sc = containerSize.width/km.width * 0.9 * up
      ;
    var keyboardWidth  = km.width  * sc
      , keyboardHeight = km.height * sc
      , ow = (containerSize.width  * up - keyboardWidth)  / 2
      , oh = (containerSize.height * up - keyboardHeight) / 2
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
        var center = {
            x: (k.x + k.width/2)
          , y: (k.y + k.height/2)
        };
        var distance = Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2);
        if (distance < dist) {
          dist = distance;
          closest = q;
        }
      }
    }
    return closest;
  };

  function hintLens(event) {
    var kCanvas = $keyboard[0]
      , hCanvas = $hint[0]
      , p       = globalToLocal(cursorPos(event))
      , key     = getClosestKey(p)
      , up      = IMG_UPSAMPLING
      , region  = {
          width : size/2 * up
        , height: size/2 * up
      }
      , sourceWidth  = region.width/2
      , sourceHeight = region.height/2
      , sourceX      = p.x - (region.width  - sourceWidth)/2
      , sourceY      = p.y - (region.height - sourceHeight)/2
      ;
    // Set image bounds.
    if (sourceX + sourceWidth > hCanvas.width)
      sourceX = hCanvas.width - sourceWidth;
    if (sourceY + sourceHeight > hCanvas.height)
      sourceY = hCanvas.height - sourceHeight;
    if (sourceX < 0)
      sourceX = 0;
    if (sourceY < 0)
      sourceY = 0;
    // Configure callout (zoomed area) layout.
    var radius     = hCanvas.height/2 * 0.9
      , destWidth  = radius * 2.5
      , destHeight = destWidth
      , destX      = (hCanvas.width  - destWidth)/2
      , destY      = (hCanvas.height - destHeight)/2
      , ctx        = getContext(hCanvas)
      ;
    hCanvas.width = hCanvas.width;
    // Add border to callout.
    ctx.beginPath();
    ctx.arc(hCanvas.width/2, hCanvas.height/2, radius, 0, 2 * Math.PI, false);
    var km = kbd.measure(keyboardIndex)
      , sc = containerSize.width/km.width
      ;
    ctx.lineWidth = 1 * sc * up; // baseline width: 1px
    ctx.stroke();
    // Clip callout.
    ctx.beginPath();
    ctx.arc(hCanvas.width/2, hCanvas.height/2, radius, 0, 2 * Math.PI, false);
    ctx.clip();
    // Hilite before copying the callout.
    hilite(key);
    ctx.drawImage(kCanvas, sourceX, sourceY, sourceWidth, sourceHeight, destX, destY, destWidth, destHeight);
    drawKey(hintedKey);
    hintedKey = key;
  };

  function getContext(canvas) {
    // Remove as much antialiasing as possible.
    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled       = false;
    ctx.mozImageSmoothingEnabled    = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.antialias = 'nearestneighbour';
    return ctx;
  };

  function toggleText() {
    if (isDown) {
      $hint.show();
      $typed.addClass("highlighted");
    } else {
      $hint.hide();
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
    var char = String.fromCharCode(keyCode).toLowerCase();
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
      event.preventDefault();
    } else if (keyCode === 40) {
      onSwipe(kbd.swipeKey.DOWN);
      event.preventDefault();
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
  };

  // Add swipe listeners.
  $kWrapper.on("touchstart.swipe mousedown.swipe", handleSwipe);

  // Tap/Click to submit phrase.
  $typedWrap.click(actionEnter);

  // Disable text selection on mobile devices.
  $(document).on('selectstart', function cbCancelSelection(event){
    event.preventDefault();
  });

  // Launch demo.
  init(keyboardIndex);

});
