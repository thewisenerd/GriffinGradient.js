/*! GriffinGradient.js - v0.0.1 - 2016-05-26
* Copyright (c) 2016 Vineeth Raj; Licensed MIT */

;(function(root, definition) {
    if (typeof module != 'undefined') module.exports = definition();
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition);
    else root['GriffinGradient'] = definition();
}(this, function() {
  "use strict"

  // http://stackoverflow.com/a/4819886/1221082
  var isMobile = 'ontouchstart' in window || navigator.maxTouchPoints;
  // http://stackoverflow.com/a/12625907/1221082
  var isWebkit = 'WebkitAppearance' in document.documentElement.style;

  // debug mode
  var isDebug = true;

  // Force webkit repaint on resize
  isWebkit && window.addEventListener('resize', function(e){
    document.body.style.visibility = 'hidden';
    e = document.body.offsetHeight;
    document.body.style.visibility = '';
  });

  Array.prototype.contains = function(obj) {
      var i = this.length;
      while (i--) {
          if (this[i] === obj) {
              return true;
          }
      }
      return false;
  }

  var GriffinGradient = function(options) {
    if( ! (this instanceof GriffinGradient)) return new GriffinGradient(options);

    ['selector', 'from', 'to', 'direction'].forEach(function(option) {
      this[option] = options[option];
    }.bind(this));

    this.gradiate();
  }

  GriffinGradient.prototype = {
    constructor: GriffinGradient,
    supportedDirections: ['left', 'right'],
    each: function(nodes, callback) {
      Array.prototype.slice.call(nodes).forEach(callback.bind(this));
    },
    getNodes: function(select) {
      return Array.prototype.slice.call(document.querySelectorAll(select));
    },
    // http://stackoverflow.com/a/5624139/2873157
    componentToHex: function(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    },
    rgbToHex: function(r, g, b) {
      return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    },
    addGradient: function(left, right, init, elem) {

      var leftRGB = this.rgbToHex(this.gradient[0][left], this.gradient[1][left], this.gradient[2][left]);
      var rightRGB = this.rgbToHex(this.gradient[0][right], this.gradient[1][right], this.gradient[2][right]);

      console.log(rightRGB);

      var value =
        "-webkit-linear-gradient(left, " + leftRGB + " , " + rightRGB + ")" + ", "
        "-moz-linear-gradient(right, " + leftRGB + " , " + rightRGB + ")" + ", "
        "-o-linear-gradient(right, " + leftRGB + " , " + rightRGB + ")" + ", "
        "linear-gradient(to right, " + leftRGB + " , " + rightRGB + ")";

      elem[0].style["background"] = value;

    },
    gradiate: function() {

      if (this.from.length < 3 || this.to.length < 3) {
        if (this.isDebug)
          console.err("invalid arguments passed to GriffinGradient");
        return;
      }

      // TODO: actually take care of direction.
      if (this.supportedDirections.contains(this.direction) == false) {
        if (this.isDebug)
          console.err("invalid direction");
        return;
      }

      // TODO: add valid argument parsing.
      if (this.from.length == 3)
        this.from.push(100);
      if (this.to.length == 3)
        this.to.push(100);

      this.nodes = [];
      this.initLeft = null;
      this.finalRight = null;

      this.each(this.getNodes(this.selector), function(elem) {
        var rect = elem.getBoundingClientRect();

        if (this.initLeft == null) {
          this.initLeft = rect.left;
        } else {
          if (rect.left < this.initLeft) {
            this.initLeft = rect.left;
          }
        }

        if (this.finalRight == null) {
          this.finalRight = rect.right;
        } else {
          if (rect.right > this.finalRight) {
            this.finalRight = rect.right;
          }
        }

        this.nodes.push([elem, rect]);
      });

      this.gradient = [[], [], []];

      this.steps = this.finalRight - this.initLeft;

      // http://stackoverflow.com/a/27553/2873157
      for (var i = 0 ; i < this.steps + 1; i++) { // TODO: fix this n+1 index
        var ratio = i / this.steps;
        var red = Math.floor( (this.to[0] * ratio) + (this.from[0] * (1 - ratio)) )
        var green = Math.floor( (this.to[1] * ratio) + (this.from[1] * (1 - ratio)) )
        var blue = Math.floor( (this.to[2] * ratio) + (this.from[2] * (1 - ratio)) )
        this.gradient[0].push(red);
        this.gradient[1].push(green);
        this.gradient[2].push(blue);
      }

      this.each(this.nodes, function(elem) {

        var dimens = elem[1];
        console.log( (dimens.left - this.initLeft) + ' ' + (dimens.right - this.initLeft));

        this.addGradient(
          (dimens.left - this.initLeft),
          (dimens.right - this.initLeft),
          this.initLeft,
          elem
        );

      });

    }
  }

  return GriffinGradient;
}));
