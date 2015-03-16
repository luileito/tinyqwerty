/*! Text Entry on Tiny QWERTY Soft Keyboards - ZShift keyboard definition. */
(function(module, global){

  /**
   * Author: Luis A. Leiva <http://personales.upv.es/luileito/>
   * License: MIT <http://opensource.org/licenses/MIT>
   */

  var t = 1.5         // Top key padding
    , l = 1.5         // Left key padding
    , w = 10          // Key width
    , h = 10          // Key height
    , ew = w - l * 2  // Effective key width
    , eh = h - t * 2  // Effective key height
    ;

  // Auxiliary functions for procedural drawing.
  function x(col, offset) {
    return l + w * col + (offset || 0);
  };
  function y(col, offset) {
    return t + h * col + (offset || 0);
  };

  module.exports = {

    keyWidth  : w
  , keyHeight : h
  , layouts   : [
      { 'name': "ABC"
      , 'keys': [
        x(0),        y(0),  ew,    eh, "Q",
        x(1),        y(0),  ew,    eh, "W",
        x(2),        y(0),  ew,    eh, "E",
        x(3),        y(0),  ew,    eh, "R",
        x(4),        y(0),  ew,    eh, "T",
        x(5),        y(0),  ew,    eh, "Y",
        x(6),        y(0),  ew,    eh, "U",
        x(7),        y(0),  ew,    eh, "I",
        x(8),        y(0),  ew,    eh, "O",
        x(9),        y(0),  ew,    eh, "P",

        x(0, w/2),   y(1),  ew,    eh, "A",
        x(1, w/2),   y(1),  ew,    eh, "S",
        x(2, w/2),   y(1),  ew,    eh, "D",
        x(3, w/2),   y(1),  ew,    eh, "F",
        x(4, w/2),   y(1),  ew,    eh, "G",
        x(5, w/2),   y(1),  ew,    eh, "H",
        x(6, w/2),   y(1),  ew,    eh, "J",
        x(7, w/2),   y(1),  ew,    eh, "K",
        x(8, w/2),   y(1),  ew,    eh, "L",

        x(0, w),     y(2),  ew,    eh, "Z",
        x(1, w),     y(2),  ew,    eh, "X",
        x(2, w),     y(2),  ew,    eh, "C",
        x(3, w),     y(2),  ew,    eh, "V",
        x(4, w),     y(2),  ew,    eh, "B",
        x(5, w),     y(2),  ew,    eh, "N",
        x(6, w),     y(2),  ew,    eh, "M",
        x(7, w),     y(2),  ew,    eh, ",",
        x(8, w),     y(2),  ew,    eh, ".",

        x(0, w*3),   y(3),  ew*5 + 8*l,  eh, " "
      ]}
    ,
      { 'name': "#1"
      , 'keys': [
        x(0),        y(0),  ew,    eh, "1",
        x(1),        y(0),  ew,    eh, "2",
        x(2),        y(0),  ew,    eh, "3",
        x(3),        y(0),  ew,    eh, "4",
        x(4),        y(0),  ew,    eh, "5",
        x(5),        y(0),  ew,    eh, "6",
        x(6),        y(0),  ew,    eh, "7",
        x(7),        y(0),  ew,    eh, "8",
        x(8),        y(0),  ew,    eh, "9",
        x(9),        y(0),  ew,    eh, "0",

        x(0, w/2),   y(1),  ew,    eh, "@",
        x(1, w/2),   y(1),  ew,    eh, "#",
        x(2, w/2),   y(1),  ew,    eh, "$",
        x(3, w/2),   y(1),  ew,    eh, "%",
        x(4, w/2),   y(1),  ew,    eh, "&",
        x(5, w/2),   y(1),  ew,    eh, "-",
        x(6, w/2),   y(1),  ew,    eh, "+",
        x(7, w/2),   y(1),  ew,    eh, "(",
        x(8, w/2),   y(1),  ew,    eh, ")",

        x(0, w),     y(2),  ew,    eh, "*",
        x(1, w),     y(2),  ew,    eh, '"',
        x(2, w),     y(2),  ew,    eh, "'",
        x(3, w),     y(2),  ew,    eh, ":",
        x(4, w),     y(2),  ew,    eh, ";",
        x(5, w),     y(2),  ew,    eh, "!",
        x(6, w),     y(2),  ew,    eh, "?",
        x(7, w),     y(2),  ew,    eh, "_",
        x(8, w),     y(2),  ew,    eh, "/",

        x(0, w*3),   y(3),  ew*5 + 8*l,  eh, " "
      ]}
    ,
      { 'name': "#2"
      , 'keys': [
        x(0),        y(0),  ew,    eh, "~",
        x(1),        y(0),  ew,    eh, "`",
        x(2),        y(0),  ew,    eh, "|",
        x(3),        y(0),  ew,    eh, "·",
        x(4),        y(0),  ew,    eh, "\u221A", // sqrt
        x(5),        y(0),  ew,    eh, "\u03C0", // pi
        x(6),        y(0),  ew,    eh, "\u00F7", // divide
        x(7),        y(0),  ew,    eh, "\u00D7", // times
        x(8),        y(0),  ew,    eh, "\u00FE", // thorn
        x(9),        y(0),  ew,    eh, "\u0153", // oe

        x(0, w/2),   y(1),  ew,    eh, "\u00A3", // pound
        x(1, w/2),   y(1),  ew,    eh, "\u00A2", // cent
        x(2, w/2),   y(1),  ew,    eh, "\u20AC", // euro
        x(3, w/2),   y(1),  ew,    eh, "\u00A5", // yen
        x(4, w/2),   y(1),  ew,    eh, "^",
        x(5, w/2),   y(1),  ew,    eh, "\u00B0", // deg
        x(6, w/2),   y(1),  ew,    eh, "=",
        x(7, w/2),   y(1),  ew,    eh, "{",
        x(8, w/2),   y(1),  ew,    eh, "}",

        x(0, w),     y(2),  ew,    eh, "\\",
        x(1, w),     y(2),  ew,    eh, '\u00A9', // copyright
        x(2, w),     y(2),  ew,    eh, "\u00AE", // registered
        x(3, w),     y(2),  ew,    eh, "\u2122", // trademark
        x(4, w),     y(2),  ew,    eh, "\u2030", // per thousand
        x(5, w),     y(2),  ew,    eh, "[",
        x(6, w),     y(2),  ew,    eh, "]",
        x(7, w),     y(2),  ew,    eh, "<",
        x(8, w),     y(2),  ew,    eh, ">",

        x(0, w*3),   y(3),  ew*5 + 8*l,  eh, " "
      ]}
    ]

  };

})('object' === typeof module ? module : {}, this);
