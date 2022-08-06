/*! @name videojs-logo @version 2.1.6 @license MIT */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e(require("video.js")):"function"==typeof define&&define.amd?define(["video.js"],e):(t="undefined"!=typeof globalThis?globalThis:t||self).videojsLogo=e(t.videojs)}(this,(function(t){"use strict";function e(t){return t&&"object"==typeof t&&"default"in t?t:{default:t}}var o=e(t);function i(t,e,o){return t(o={path:e,exports:{},require:function(t,e){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==e&&o.path)}},o.exports),o.exports}var s=i((function(t){function e(o,i){return t.exports=e=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},t.exports.default=t.exports,t.exports.__esModule=!0,e(o,i)}t.exports=e,t.exports.default=t.exports,t.exports.__esModule=!0})),n=i((function(t){t.exports=function(t,e){t.prototype=Object.create(e.prototype),t.prototype.constructor=t,s(t,e)},t.exports.default=t.exports,t.exports.__esModule=!0})),r=o.default.getPlugin("plugin"),p={image:void 0,url:void 0,position:"bottom-left",offsetH:0,offsetV:0,width:void 0,height:void 0,padding:5,fadeDelay:5e3,hideOnReady:!1,opacity:1},l=function(t){function e(e,i){var s;return(s=t.call(this,e)||this).tid=null,s.div=null,s.options=o.default.mergeOptions(p,i),s.player.ready((function(){return s._onPlayerReady()})),s}n(e,t);var i=e.prototype;return i._onPlayerReady=function(){this.player.addClass("vjs-logo"),this.options.image&&(this._setup(),this.options.hideOnReady||this.show())},i._setup=function(){var t=this,e=this.player.el(),o=document.createElement("div");o.classList.add("vjs-logo-content"),o.classList.add("vjs-logo-hide"),o.style.padding=this.options.padding+"px";var i=this.options,s=i.offsetH,n=i.offsetV;switch(this.options.position){case"top-left":o.style.top=n+"px",o.style.left=s+"px";break;case"top-right":o.style.top=n+"px",o.style.right=s+"px";break;case"bottom-left":o.style.bottom=n+"px",o.style.left=s+"px";break;case"bottom-right":o.style.bottom=n+"px",o.style.right=s+"px";break;default:o.style.top=n+"px",o.style.right=s+"px"}this.div=o;var r=document.createElement("img");r.src=this.options.image;var p=this.options,l=p.width,d=p.height,a=p.opacity;if(l&&(r.width=l),d&&(r.height=d),a&&(r.style.opacity=a),this.options.url){var u=document.createElement("a");u.href=this.options.url,u.onclick=function(e){e.preventDefault(),window.open(t.options.url)},u.appendChild(r),o.appendChild(u)}else o.appendChild(r);e.appendChild(o)},i.show=function(){var t=this;this.tid&&(clearTimeout(this.tid),this.tid=null),this.div&&this.div.classList.remove("vjs-logo-hide"),null!==this.options.fadeDelay&&(this.tid=setTimeout((function(){t.hide(),t.tid=null}),this.options.fadeDelay))},i.hide=function(){this.div&&this.div.classList.add("vjs-logo-hide")},e}(r);return l.defaultState={},l.VERSION="2.1.6",o.default.registerPlugin("logo",l),l}));
