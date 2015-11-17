/*!
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery throttle / debounce: Sometimes, less is more!
//
// *Version: 1.1, Last updated: 3/7/2010*
// 
// Project Home - http://benalman.com/projects/jquery-throttle-debounce-plugin/
// GitHub       - http://github.com/cowboy/jquery-throttle-debounce/
// Source       - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.js
// (Minified)   - http://github.com/cowboy/jquery-throttle-debounce/raw/master/jquery.ba-throttle-debounce.min.js (0.7kb)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
// 
// Throttle - http://benalman.com/code/projects/jquery-throttle-debounce/examples/throttle/
// Debounce - http://benalman.com/code/projects/jquery-throttle-debounce/examples/debounce/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - none, 1.3.2, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-3.6, Safari 3-4, Chrome 4-5, Opera 9.6-10.1.
// Unit Tests      - http://benalman.com/code/projects/jquery-throttle-debounce/unit/
// 
// About: Release History
// 
// 1.1 - (3/7/2010) Fixed a bug in <jQuery.throttle> where trailing callbacks
//       executed later than they should. Reworked a fair amount of internal
//       logic as well.
// 1.0 - (3/6/2010) Initial release as a stand-alone project. Migrated over
//       from jquery-misc repo v0.4 to jquery-throttle repo v1.0, added the
//       no_trailing throttle parameter and debounce functionality.
// 
// Topic: Note for non-jQuery users
// 
// jQuery isn't actually required for this plugin, because nothing internal
// uses any jQuery methods or properties. jQuery is just used as a namespace
// under which these methods can exist.
// 
// Since jQuery isn't actually required for this plugin, if jQuery doesn't exist
// when this plugin is loaded, the method described below will be created in
// the `Cowboy` namespace. Usage will be exactly the same, but instead of
// $.method() or jQuery.method(), you'll need to use Cowboy.method().

(function(window,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  // Since jQuery really isn't required for this plugin, use `jQuery` as the
  // namespace only if it already exists, otherwise use the `Cowboy` namespace,
  // creating it if necessary.
  var $ = window.jQuery || window.Cowboy || ( window.Cowboy = {} ),
    
    // Internal method reference.
    jq_throttle;
  
  // Method: jQuery.throttle
  // 
  // Throttle execution of a function. Especially useful for rate limiting
  // execution of handlers on events like resize and scroll. If you want to
  // rate-limit execution of a function to a single time, see the
  // <jQuery.debounce> method.
  // 
  // In this visualization, | is a throttled-function call and X is the actual
  // callback execution:
  // 
  // > Throttled with `no_trailing` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X    X        X    X    X    X    X    X
  // > 
  // > Throttled with `no_trailing` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X    X    X    X    X             X    X    X    X    X
  // 
  // Usage:
  // 
  // > var throttled = jQuery.throttle( delay, [ no_trailing, ] callback );
  // > 
  // > jQuery('selector').bind( 'someevent', throttled );
  // > jQuery('selector').unbind( 'someevent', throttled );
  // 
  // This also works in jQuery 1.4+:
  // 
  // > jQuery('selector').bind( 'someevent', jQuery.throttle( delay, [ no_trailing, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  // 
  // Arguments:
  // 
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  no_trailing - (Boolean) Optional, defaults to false. If no_trailing is
  //    true, callback will only execute every `delay` milliseconds while the
  //    throttled-function is being called. If no_trailing is false or
  //    unspecified, callback will be executed one final time after the last
  //    throttled-function call. (After the throttled-function has not been
  //    called for `delay` milliseconds, the internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the throttled-function is executed.
  // 
  // Returns:
  // 
  //  (Function) A new, throttled, function.
  
  $.throttle = jq_throttle = function( delay, no_trailing, callback, debounce_mode ) {
    // After wrapper has stopped being called, this timeout ensures that
    // `callback` is executed at the proper times in `throttle` and `end`
    // debounce modes.
    var timeout_id,
      
      // Keep track of the last time `callback` was executed.
      last_exec = 0;
    
    // `no_trailing` defaults to falsy.
    if ( typeof no_trailing !== 'boolean' ) {
      debounce_mode = callback;
      callback = no_trailing;
      no_trailing = undefined;
    }
    
    // The `wrapper` function encapsulates all of the throttling / debouncing
    // functionality and when executed will limit the rate at which `callback`
    // is executed.
    function wrapper() {
      var that = this,
        elapsed = +new Date() - last_exec,
        args = arguments;
      
      // Execute `callback` and update the `last_exec` timestamp.
      function exec() {
        last_exec = +new Date();
        callback.apply( that, args );
      };
      
      // If `debounce_mode` is true (at_begin) this is used to clear the flag
      // to allow future `callback` executions.
      function clear() {
        timeout_id = undefined;
      };
      
      if ( debounce_mode && !timeout_id ) {
        // Since `wrapper` is being called for the first time and
        // `debounce_mode` is true (at_begin), execute `callback`.
        exec();
      }
      
      // Clear any existing timeout.
      timeout_id && clearTimeout( timeout_id );
      
      if ( debounce_mode === undefined && elapsed > delay ) {
        // In throttle mode, if `delay` time has been exceeded, execute
        // `callback`.
        exec();
        
      } else if ( no_trailing !== true ) {
        // In trailing throttle mode, since `delay` time has not been
        // exceeded, schedule `callback` to execute `delay` ms after most
        // recent execution.
        // 
        // If `debounce_mode` is true (at_begin), schedule `clear` to execute
        // after `delay` ms.
        // 
        // If `debounce_mode` is false (at end), schedule `callback` to
        // execute after `delay` ms.
        timeout_id = setTimeout( debounce_mode ? clear : exec, debounce_mode === undefined ? delay - elapsed : delay );
      }
    };
    
    // Set the guid of `wrapper` function to the same of original callback, so
    // it can be removed in jQuery 1.4+ .unbind or .die by using the original
    // callback as a reference.
    if ( $.guid ) {
      wrapper.guid = callback.guid = callback.guid || $.guid++;
    }
    
    // Return the wrapper function.
    return wrapper;
  };
  
  // Method: jQuery.debounce
  // 
  // Debounce execution of a function. Debouncing, unlike throttling,
  // guarantees that a function is only executed a single time, either at the
  // very beginning of a series of calls, or at the very end. If you want to
  // simply rate-limit execution of a function, see the <jQuery.throttle>
  // method.
  // 
  // In this visualization, | is a debounced-function call and X is the actual
  // callback execution:
  // 
  // > Debounced with `at_begin` specified as false or unspecified:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // >                          X                                 X
  // > 
  // > Debounced with `at_begin` specified as true:
  // > ||||||||||||||||||||||||| (pause) |||||||||||||||||||||||||
  // > X                                 X
  // 
  // Usage:
  // 
  // > var debounced = jQuery.debounce( delay, [ at_begin, ] callback );
  // > 
  // > jQuery('selector').bind( 'someevent', debounced );
  // > jQuery('selector').unbind( 'someevent', debounced );
  // 
  // This also works in jQuery 1.4+:
  // 
  // > jQuery('selector').bind( 'someevent', jQuery.debounce( delay, [ at_begin, ] callback ) );
  // > jQuery('selector').unbind( 'someevent', callback );
  // 
  // Arguments:
  // 
  //  delay - (Number) A zero-or-greater delay in milliseconds. For event
  //    callbacks, values around 100 or 250 (or even higher) are most useful.
  //  at_begin - (Boolean) Optional, defaults to false. If at_begin is false or
  //    unspecified, callback will only be executed `delay` milliseconds after
  //    the last debounced-function call. If at_begin is true, callback will be
  //    executed only at the first debounced-function call. (After the
  //    throttled-function has not been called for `delay` milliseconds, the
  //    internal counter is reset)
  //  callback - (Function) A function to be executed after delay milliseconds.
  //    The `this` context and all arguments are passed through, as-is, to
  //    `callback` when the debounced-function is executed.
  // 
  // Returns:
  // 
  //  (Function) A new, debounced, function.
  
  $.debounce = function( delay, at_begin, callback ) {
    return callback === undefined
      ? jq_throttle( delay, at_begin, false )
      : jq_throttle( delay, callback, at_begin !== false );
  };
  
})(this);

/*!
 * Parsley.js
 * Version 2.2.0-rc4 - built Thu, Oct 29th 2015, 4:25 pm
 * http://parsleyjs.org
 * Guillaume Potier - <guillaume@wisembly.com>
 * Marc-Andre Lafortune - <petroselinum@marc-andre.ca>
 * MIT Licensed
 */

// The source code below is generated by babel as
// Parsley is written in ECMAScript 6
//
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('jquery')) : typeof define === 'function' && define.amd ? define(['jquery'], factory) : global.parsley = factory(global.jQuery);
})(this, function ($) {
  'use strict';

  var globalID = 1;
  var pastWarnings = {};

  var ParsleyUtils__ParsleyUtils = {
    // Parsley DOM-API
    // returns object from dom attributes and values
    attr: function attr($element, namespace, obj) {
      var i;
      var attribute;
      var attributes;
      var regex = new RegExp('^' + namespace, 'i');

      if ('undefined' === typeof obj) obj = {};else {
        // Clear all own properties. This won't affect prototype's values
        for (i in obj) {
          if (obj.hasOwnProperty(i)) delete obj[i];
        }
      }

      if ('undefined' === typeof $element || 'undefined' === typeof $element[0]) return obj;

      attributes = $element[0].attributes;
      for (i = attributes.length; i--;) {
        attribute = attributes[i];

        if (attribute && attribute.specified && regex.test(attribute.name)) {
          obj[this.camelize(attribute.name.slice(namespace.length))] = this.deserializeValue(attribute.value);
        }
      }

      return obj;
    },

    checkAttr: function checkAttr($element, namespace, _checkAttr) {
      return $element.is('[' + namespace + _checkAttr + ']');
    },

    setAttr: function setAttr($element, namespace, attr, value) {
      $element[0].setAttribute(this.dasherize(namespace + attr), String(value));
    },

    generateID: function generateID() {
      return '' + globalID++;
    },

    /** Third party functions **/
    // Zepto deserialize function
    deserializeValue: function deserializeValue(value) {
      var num;

      try {
        return value ? value == "true" || (value == "false" ? false : value == "null" ? null : !isNaN(num = Number(value)) ? num : /^[\[\{]/.test(value) ? $.parseJSON(value) : value) : value;
      } catch (e) {
        return value;
      }
    },

    // Zepto camelize function
    camelize: function camelize(str) {
      return str.replace(/-+(.)?/g, function (match, chr) {
        return chr ? chr.toUpperCase() : '';
      });
    },

    // Zepto dasherize function
    dasherize: function dasherize(str) {
      return str.replace(/::/g, '/').replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2').replace(/([a-z\d])([A-Z])/g, '$1_$2').replace(/_/g, '-').toLowerCase();
    },

    warn: function warn() {
      if (window.console && 'function' === typeof window.console.warn) window.console.warn.apply(window.console, arguments);
    },

    warnOnce: function warnOnce(msg) {
      if (!pastWarnings[msg]) {
        pastWarnings[msg] = true;
        this.warn.apply(this, arguments);
      }
    },

    _resetWarnings: function _resetWarnings() {
      pastWarnings = {};
    },

    trimString: function trimString(string) {
      return string.replace(/^\s+|\s+$/g, '');
    },

    // Object.create polyfill, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create#Polyfill
    objectCreate: Object.create || (function () {
      var Object = function Object() {};
      return function (prototype) {
        if (arguments.length > 1) {
          throw Error('Second argument not supported');
        }
        if (typeof prototype != 'object') {
          throw TypeError('Argument must be an object');
        }
        Object.prototype = prototype;
        var result = new Object();
        Object.prototype = null;
        return result;
      };
    })()
  };

  var ParsleyUtils__default = ParsleyUtils__ParsleyUtils;

  // All these options could be overriden and specified directly in DOM using
  // `data-parsley-` default DOM-API
  // eg: `inputs` can be set in DOM using `data-parsley-inputs="input, textarea"`
  // eg: `data-parsley-stop-on-first-failing-constraint="false"`

  var ParsleyDefaults = {
    // ### General

    // Default data-namespace for DOM API
    namespace: 'data-parsley-',

    // Supported inputs by default
    inputs: 'input, textarea, select',

    // Excluded inputs by default
    excluded: 'input[type=button], input[type=submit], input[type=reset], input[type=hidden]',

    // Stop validating field on highest priority failing constraint
    priorityEnabled: true,

    // ### Field only

    // identifier used to group together inputs (e.g. radio buttons...)
    multiple: null,

    // identifier (or array of identifiers) used to validate only a select group of inputs
    group: null,

    // ### UI
    // Enable\Disable error messages
    uiEnabled: true,

    // Key events threshold before validation
    validationThreshold: 3,

    // Focused field on form validation error. 'first'|'last'|'none'
    focus: 'first',

    // `$.Event()` that will trigger validation. eg: `keyup`, `change`...
    trigger: false,

    // Class that would be added on every failing validation Parsley field
    errorClass: 'parsley-error',

    // Same for success validation
    successClass: 'parsley-success',

    // Return the `$element` that will receive these above success or error classes
    // Could also be (and given directly from DOM) a valid selector like `'#div'`
    classHandler: function classHandler(ParsleyField) {},

    // Return the `$element` where errors will be appended
    // Could also be (and given directly from DOM) a valid selector like `'#div'`
    errorsContainer: function errorsContainer(ParsleyField) {},

    // ul elem that would receive errors' list
    errorsWrapper: '<ul class="parsley-errors-list"></ul>',

    // li elem that would receive error message
    errorTemplate: '<li></li>'
  };

  var ParsleyAbstract = function ParsleyAbstract() {};

  ParsleyAbstract.prototype = {
    asyncSupport: true, // Deprecated

    actualizeOptions: function actualizeOptions() {
      ParsleyUtils__default.attr(this.$element, this.options.namespace, this.domOptions);
      if (this.parent && this.parent.actualizeOptions) this.parent.actualizeOptions();
      return this;
    },

    _resetOptions: function _resetOptions(initOptions) {
      this.domOptions = ParsleyUtils__default.objectCreate(this.parent.options);
      this.options = ParsleyUtils__default.objectCreate(this.domOptions);
      // Shallow copy of ownProperties of initOptions:
      for (var i in initOptions) {
        if (initOptions.hasOwnProperty(i)) this.options[i] = initOptions[i];
      }
      this.actualizeOptions();
    },

    _listeners: null,

    // Register a callback for the given event name.
    // Callback is called with context as the first argument and the `this`.
    // The context is the current parsley instance, or window.Parsley if global.
    // A return value of `false` will interrupt the calls
    on: function on(name, fn) {
      this._listeners = this._listeners || {};
      var queue = this._listeners[name] = this._listeners[name] || [];
      queue.push(fn);

      return this;
    },

    // Deprecated. Use `on` instead.
    subscribe: function subscribe(name, fn) {
      $.listenTo(this, name.toLowerCase(), fn);
    },

    // Unregister a callback (or all if none is given) for the given event name
    off: function off(name, fn) {
      var queue = this._listeners && this._listeners[name];
      if (queue) {
        if (!fn) {
          delete this._listeners[name];
        } else {
          for (var i = queue.length; i--;) if (queue[i] === fn) queue.splice(i, 1);
        }
      }
      return this;
    },

    // Deprecated. Use `off`
    unsubscribe: function unsubscribe(name, fn) {
      $.unsubscribeTo(this, name.toLowerCase());
    },

    // Trigger an event of the given name.
    // A return value of `false` interrupts the callback chain.
    // Returns false if execution was interrupted.
    trigger: function trigger(name, target, extraArg) {
      target = target || this;
      var queue = this._listeners && this._listeners[name];
      var result;
      var parentResult;
      if (queue) {
        for (var i = queue.length; i--;) {
          result = queue[i].call(target, target, extraArg);
          if (result === false) return result;
        }
      }
      if (this.parent) {
        return this.parent.trigger(name, target, extraArg);
      }
      return true;
    },

    // Reset UI
    reset: function reset() {
      // Field case: just emit a reset event for UI
      if ('ParsleyForm' !== this.__class__) return this._trigger('reset');

      // Form case: emit a reset event for each field
      for (var i = 0; i < this.fields.length; i++) this.fields[i]._trigger('reset');

      this._trigger('reset');
    },

    // Destroy Parsley instance (+ UI)
    destroy: function destroy() {
      // Field case: emit destroy event to clean UI and then destroy stored instance
      if ('ParsleyForm' !== this.__class__) {
        this.$element.removeData('Parsley');
        this.$element.removeData('ParsleyFieldMultiple');
        this._trigger('destroy');

        return;
      }

      // Form case: destroy all its fields and then destroy stored instance
      for (var i = 0; i < this.fields.length; i++) this.fields[i].destroy();

      this.$element.removeData('Parsley');
      this._trigger('destroy');
    },

    asyncIsValid: function asyncIsValid() {
      ParsleyUtils__default.warnOnce("asyncIsValid is deprecated; please use whenIsValid instead");
      return this.whenValid.apply(this, arguments);
    },

    _findRelatedMultiple: function _findRelatedMultiple() {
      return this.parent.$element.find('[' + this.options.namespace + 'multiple="' + this.options.multiple + '"]');
    }
  };

  var requirementConverters = {
    string: function string(_string) {
      return _string;
    },
    integer: function integer(string) {
      if (isNaN(string)) throw 'Requirement is not an integer: "' + string + '"';
      return parseInt(string, 10);
    },
    number: function number(string) {
      if (isNaN(string)) throw 'Requirement is not a number: "' + string + '"';
      return parseFloat(string);
    },
    reference: function reference(string) {
      // Unused for now
      var result = $(string);
      if (result.length === 0) throw 'No such reference: "' + string + '"';
      return result;
    },
    boolean: function boolean(string) {
      return string !== 'false';
    },
    object: function object(string) {
      return ParsleyUtils__default.deserializeValue(string);
    },
    regexp: function regexp(_regexp) {
      var flags = '';

      // Test if RegExp is literal, if not, nothing to be done, otherwise, we need to isolate flags and pattern
      if (/^\/.*\/(?:[gimy]*)$/.test(_regexp)) {
        // Replace the regexp literal string with the first match group: ([gimy]*)
        // If no flag is present, this will be a blank string
        flags = _regexp.replace(/.*\/([gimy]*)$/, '$1');
        // Again, replace the regexp literal string with the first match group:
        // everything excluding the opening and closing slashes and the flags
        _regexp = _regexp.replace(new RegExp('^/(.*?)/' + flags + '$'), '$1');
      } else {
        // Anchor regexp:
        _regexp = '^' + _regexp + '$';
      }
      return new RegExp(_regexp, flags);
    }
  };

  var convertArrayRequirement = function convertArrayRequirement(string, length) {
    var m = string.match(/^\s*\[(.*)\]\s*$/);
    if (!m) throw 'Requirement is not an array: "' + string + '"';
    var values = m[1].split(',').map(ParsleyUtils__default.trimString);
    if (values.length !== length) throw 'Requirement has ' + values.length + ' values when ' + length + ' are needed';
    return values;
  };

  var convertRequirement = function convertRequirement(requirementType, string) {
    var converter = requirementConverters[requirementType || 'string'];
    if (!converter) throw 'Unknown requirement specification: "' + requirementType + '"';
    return converter(string);
  };

  var convertExtraOptionRequirement = function convertExtraOptionRequirement(requirementSpec, string, extraOptionReader) {
    var main = null;
    var extra = {};
    for (var key in requirementSpec) {
      if (key) {
        var value = extraOptionReader(key);
        if ('string' === typeof value) value = convertRequirement(requirementSpec[key], value);
        extra[key] = value;
      } else {
        main = convertRequirement(requirementSpec[key], string);
      }
    }
    return [main, extra];
  };

  // A Validator needs to implement the methods `validate` and `parseRequirements`

  var ParsleyValidator = function ParsleyValidator(spec) {
    $.extend(true, this, spec);
  };

  ParsleyValidator.prototype = {
    // Returns `true` iff the given `value` is valid according the given requirements.
    validate: function validate(value, requirementFirstArg) {
      if (this.fn) {
        // Legacy style validator

        if (arguments.length > 3) // If more args then value, requirement, instance...
          requirementFirstArg = [].slice.call(arguments, 1, -1); // Skip first arg (value) and last (instance), combining the rest
        return this.fn.call(this, value, requirementFirstArg);
      }

      if ($.isArray(value)) {
        if (!this.validateMultiple) throw 'Validator `' + this.name + '` does not handle multiple values';
        return this.validateMultiple.apply(this, arguments);
      } else {
        if (this.validateNumber) {
          if (isNaN(value)) return false;
          arguments[0] = parseFloat(arguments[0]);
          return this.validateNumber.apply(this, arguments);
        }
        if (this.validateString) {
          return this.validateString.apply(this, arguments);
        }
        throw 'Validator `' + this.name + '` only handles multiple values';
      }
    },

    // Parses `requirements` into an array of arguments,
    // according to `this.requirementType`
    parseRequirements: function parseRequirements(requirements, extraOptionReader) {
      if ('string' !== typeof requirements) {
        // Assume requirement already parsed
        // but make sure we return an array
        return $.isArray(requirements) ? requirements : [requirements];
      }
      var type = this.requirementType;
      if ($.isArray(type)) {
        var values = convertArrayRequirement(requirements, type.length);
        for (var i = 0; i < values.length; i++) values[i] = convertRequirement(type[i], values[i]);
        return values;
      } else if ($.isPlainObject(type)) {
        return convertExtraOptionRequirement(type, requirements, extraOptionReader);
      } else {
        return [convertRequirement(type, requirements)];
      }
    },
    // Defaults:
    requirementType: 'string',

    priority: 2

  };

  var ParsleyValidatorRegistry = function ParsleyValidatorRegistry(validators, catalog) {
    this.__class__ = 'ParsleyValidatorRegistry';

    // Default Parsley locale is en
    this.locale = 'en';

    this.init(validators || {}, catalog || {});
  };

  var typeRegexes = {
    email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i,

    number: /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/,

    integer: /^-?\d+$/,

    digits: /^\d+$/,

    alphanum: /^\w+$/i,

    url: new RegExp("^" +
          // protocol identifier
        "(?:(?:https?|ftp)://)?" + // ** mod: make scheme optional
          // user:pass authentication
        "(?:\\S+(?::\\S*)?@)?" + "(?:" +
          // IP address exclusion
          // private & local networks
          // "(?!(?:10|127)(?:\\.\\d{1,3}){3})" +   // ** mod: allow local networks
          // "(?!(?:169\\.254|192\\.168)(?:\\.\\d{1,3}){2})" +  // ** mod: allow local networks
          // "(?!172\\.(?:1[6-9]|2\\d|3[0-1])(?:\\.\\d{1,3}){2})" +  // ** mod: allow local networks
          // IP address dotted notation octets
          // excludes loopback network 0.0.0.0
          // excludes reserved space >= 224.0.0.0
          // excludes network & broacast addresses
          // (first & last IP address of each class)
        "(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])" + "(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}" + "(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))" + "|" +
          // host name
        '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
          // domain name
        '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
          // TLD identifier
        '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' + ")" +
          // port number
        "(?::\\d{2,5})?" +
          // resource path
        "(?:/\\S*)?" + "$", 'i')
  };
  typeRegexes.range = typeRegexes.number;

  ParsleyValidatorRegistry.prototype = {
    init: function init(validators, catalog) {
      this.catalog = catalog;
      // Copy prototype's validators:
      this.validators = $.extend({}, this.validators);

      for (var name in validators) this.addValidator(name, validators[name].fn, validators[name].priority);

      window.Parsley.trigger('parsley:validator:init');
    },

    // Set new messages locale if we have dictionary loaded in ParsleyConfig.i18n
    setLocale: function setLocale(locale) {
      if ('undefined' === typeof this.catalog[locale]) throw new Error(locale + ' is not available in the catalog');

      this.locale = locale;

      return this;
    },

    // Add a new messages catalog for a given locale. Set locale for this catalog if set === `true`
    addCatalog: function addCatalog(locale, messages, set) {
      if ('object' === typeof messages) this.catalog[locale] = messages;

      if (true === set) return this.setLocale(locale);

      return this;
    },

    // Add a specific message for a given constraint in a given locale
    addMessage: function addMessage(locale, name, message) {
      if ('undefined' === typeof this.catalog[locale]) this.catalog[locale] = {};

      this.catalog[locale][name] = message;

      return this;
    },

    // Add messages for a given locale
    addMessages: function addMessages(locale, nameMessageObject) {
      for (var name in nameMessageObject) this.addMessage(locale, name, nameMessageObject[name]);

      return this;
    },

    // Add a new validator
    //
    //    addValidator('custom', {
    //        requirementType: ['integer', 'integer'],
    //        validateString: function(value, from, to) {},
    //        priority: 22,
    //        messages: {
    //          en: "Hey, that's no good",
    //          fr: "Aye aye, pas bon du tout",
    //        }
    //    })
    //
    // Old API was addValidator(name, function, priority)
    //
    addValidator: function addValidator(name, arg1, arg2) {
      if (this.validators[name]) ParsleyUtils__default.warn('Validator "' + name + '" is already defined.');else if (ParsleyDefaults.hasOwnProperty(name)) {
        ParsleyUtils__default.warn('"' + name + '" is a restricted keyword and is not a valid validator name.');
        return;
      }
      return this._setValidator.apply(this, arguments);
    },

    updateValidator: function updateValidator(name, arg1, arg2) {
      if (!this.validators[name]) {
        ParsleyUtils__default.warn('Validator "' + name + '" is not already defined.');
        return this.addValidator.apply(this, arguments);
      }
      return this._setValidator(this, arguments);
    },

    removeValidator: function removeValidator(name) {
      if (!this.validators[name]) ParsleyUtils__default.warn('Validator "' + name + '" is not defined.');

      delete this.validators[name];

      return this;
    },

    _setValidator: function _setValidator(name, validator, priority) {
      if ('object' !== typeof validator) {
        // Old style validator, with `fn` and `priority`
        validator = {
          fn: validator,
          priority: priority
        };
      }
      if (!validator.validate) {
        validator = new ParsleyValidator(validator);
      }
      this.validators[name] = validator;

      for (var locale in validator.messages || {}) this.addMessage(locale, name, validator.messages[locale]);

      return this;
    },

    getErrorMessage: function getErrorMessage(constraint) {
      var message;

      // Type constraints are a bit different, we have to match their requirements too to find right error message
      if ('type' === constraint.name) {
        var typeMessages = this.catalog[this.locale][constraint.name] || {};
        message = typeMessages[constraint.requirements];
      } else message = this.formatMessage(this.catalog[this.locale][constraint.name], constraint.requirements);

      return message || this.catalog[this.locale].defaultMessage || this.catalog.en.defaultMessage;
    },

    // Kind of light `sprintf()` implementation
    formatMessage: function formatMessage(string, parameters) {
      if ('object' === typeof parameters) {
        for (var i in parameters) string = this.formatMessage(string, parameters[i]);

        return string;
      }

      return 'string' === typeof string ? string.replace(new RegExp('%s', 'i'), parameters) : '';
    },

    // Here is the Parsley default validators list.
    // A validator is an object with the following key values:
    //  - priority: an integer
    //  - requirement: 'string' (default), 'integer', 'number', 'regexp' or an Array of these
    //  - validateString, validateMultiple, validateNumber: functions returning `true`, `false` or a promise
    // Alternatively, a validator can be a function that returns such an object
    //
    validators: {
      notblank: {
        validateString: function validateString(value) {
          return (/\S/.test(value)
          );
        },
        priority: 2
      },
      required: {
        validateMultiple: function validateMultiple(values) {
          return values.length > 0;
        },
        validateString: function validateString(value) {
          return (/\S/.test(value)
          );
        },
        priority: 512
      },
      type: {
        validateString: function validateString(value, type) {
          var regex = typeRegexes[type];
          if (!regex) throw new Error('validator type `' + type + '` is not supported');
          return regex.test(value);
        },
        priority: 256
      },
      pattern: {
        validateString: function validateString(value, regexp) {
          return regexp.test(value);
        },
        requirementType: 'regexp',
        priority: 64
      },
      minlength: {
        validateString: function validateString(value, requirement) {
          return value.length >= requirement;
        },
        requirementType: 'integer',
        priority: 30
      },
      maxlength: {
        validateString: function validateString(value, requirement) {
          return value.length <= requirement;
        },
        requirementType: 'integer',
        priority: 30
      },
      length: {
        validateString: function validateString(value, min, max) {
          return value.length >= min && value.length <= max;
        },
        requirementType: ['integer', 'integer'],
        priority: 30
      },
      mincheck: {
        validateMultiple: function validateMultiple(values, requirement) {
          return values.length >= requirement;
        },
        requirementType: 'integer',
        priority: 30
      },
      maxcheck: {
        validateMultiple: function validateMultiple(values, requirement) {
          return values.length <= requirement;
        },
        requirementType: 'integer',
        priority: 30
      },
      check: {
        validateMultiple: function validateMultiple(values, min, max) {
          return values.length >= min && values.length <= max;
        },
        requirementType: ['integer', 'integer'],
        priority: 30
      },
      min: {
        validateNumber: function validateNumber(value, requirement) {
          return value >= requirement;
        },
        requirementType: 'number',
        priority: 30
      },
      max: {
        validateNumber: function validateNumber(value, requirement) {
          return value <= requirement;
        },
        requirementType: 'number',
        priority: 30
      },
      range: {
        validateNumber: function validateNumber(value, min, max) {
          return value >= min && value <= max;
        },
        requirementType: ['number', 'number'],
        priority: 30
      },
      equalto: {
        validateString: function validateString(value, refOrValue) {
          var $reference = $(refOrValue);
          if ($reference.length) return value === $reference.val();else return value === refOrValue;
        },
        priority: 256
      }
    }
  };

  var ParsleyUI = function ParsleyUI(options) {
    this.__class__ = 'ParsleyUI';
  };

  ParsleyUI.prototype = {
    listen: function listen() {
      var that = this;
      window.Parsley.on('form:init', function () {
        that.setupForm(this);
      }).on('field:init', function () {
        that.setupField(this);
      }).on('field:validated', function () {
        that.reflow(this);
      }).on('form:validated', function () {
        that.focus(this);
      }).on('field:reset', function () {
        that.reset(this);
      }).on('form:destroy', function () {
        that.destroy(this);
      }).on('field:destroy', function () {
        that.destroy(this);
      });

      return this;
    },

    reflow: function reflow(fieldInstance) {
      // If this field has not an active UI (case for multiples) don't bother doing something
      if ('undefined' === typeof fieldInstance._ui || false === fieldInstance._ui.active) return;

      // Diff between two validation results
      var diff = this._diff(fieldInstance.validationResult, fieldInstance._ui.lastValidationResult);

      // Then store current validation result for next reflow
      fieldInstance._ui.lastValidationResult = fieldInstance.validationResult;

      // Field have been validated at least once if here. Useful for binded key events...
      fieldInstance._ui.validatedOnce = true;

      // Handle valid / invalid / none field class
      this.manageStatusClass(fieldInstance);

      // Add, remove, updated errors messages
      this.manageErrorsMessages(fieldInstance, diff);

      // Triggers impl
      this.actualizeTriggers(fieldInstance);

      // If field is not valid for the first time, bind keyup trigger to ease UX and quickly inform user
      if ((diff.kept.length || diff.added.length) && true !== fieldInstance._ui.failedOnce) this.manageFailingFieldTrigger(fieldInstance);
    },

    // Returns an array of field's error message(s)
    getErrorsMessages: function getErrorsMessages(fieldInstance) {
      // No error message, field is valid
      if (true === fieldInstance.validationResult) return [];

      var messages = [];

      for (var i = 0; i < fieldInstance.validationResult.length; i++) messages.push(fieldInstance.validationResult[i].errorMessage || this._getErrorMessage(fieldInstance, fieldInstance.validationResult[i].assert));

      return messages;
    },

    manageStatusClass: function manageStatusClass(fieldInstance) {
      if (fieldInstance.hasConstraints() && fieldInstance.needsValidation() && true === fieldInstance.validationResult) this._successClass(fieldInstance);else if (fieldInstance.validationResult.length > 0) this._errorClass(fieldInstance);else this._resetClass(fieldInstance);
    },

    manageErrorsMessages: function manageErrorsMessages(fieldInstance, diff) {
      if ('undefined' !== typeof fieldInstance.options.errorsMessagesDisabled) return;

      // Case where we have errorMessage option that configure an unique field error message, regardless failing validators
      if ('undefined' !== typeof fieldInstance.options.errorMessage) {
        if (diff.added.length || diff.kept.length) {
          this._insertErrorWrapper(fieldInstance);

          if (0 === fieldInstance._ui.$errorsWrapper.find('.parsley-custom-error-message').length) fieldInstance._ui.$errorsWrapper.append($(fieldInstance.options.errorTemplate).addClass('parsley-custom-error-message'));

          return fieldInstance._ui.$errorsWrapper.addClass('filled').find('.parsley-custom-error-message').html(fieldInstance.options.errorMessage);
        }

        return fieldInstance._ui.$errorsWrapper.removeClass('filled').find('.parsley-custom-error-message').remove();
      }

      // Show, hide, update failing constraints messages
      for (var i = 0; i < diff.removed.length; i++) this.removeError(fieldInstance, diff.removed[i].assert.name, true);

      for (i = 0; i < diff.added.length; i++) this.addError(fieldInstance, diff.added[i].assert.name, diff.added[i].errorMessage, diff.added[i].assert, true);

      for (i = 0; i < diff.kept.length; i++) this.updateError(fieldInstance, diff.kept[i].assert.name, diff.kept[i].errorMessage, diff.kept[i].assert, true);
    },

    // TODO: strange API here, intuitive for manual usage with addError(pslyInstance, 'foo', 'bar')
    // but a little bit complex for above internal usage, with forced undefined parameter...
    addError: function addError(fieldInstance, name, message, assert, doNotUpdateClass) {
      this._insertErrorWrapper(fieldInstance);
      fieldInstance._ui.$errorsWrapper.addClass('filled').append($(fieldInstance.options.errorTemplate).addClass('parsley-' + name).html(message || this._getErrorMessage(fieldInstance, assert)));

      if (true !== doNotUpdateClass) this._errorClass(fieldInstance);
    },

    // Same as above
    updateError: function updateError(fieldInstance, name, message, assert, doNotUpdateClass) {
      fieldInstance._ui.$errorsWrapper.addClass('filled').find('.parsley-' + name).html(message || this._getErrorMessage(fieldInstance, assert));

      if (true !== doNotUpdateClass) this._errorClass(fieldInstance);
    },

    // Same as above twice
    removeError: function removeError(fieldInstance, name, doNotUpdateClass) {
      fieldInstance._ui.$errorsWrapper.removeClass('filled').find('.parsley-' + name).remove();

      // edge case possible here: remove a standard Parsley error that is still failing in fieldInstance.validationResult
      // but highly improbable cuz' manually removing a well Parsley handled error makes no sense.
      if (true !== doNotUpdateClass) this.manageStatusClass(fieldInstance);
    },

    focus: function focus(formInstance) {
      formInstance._focusedField = null;

      if (true === formInstance.validationResult || 'none' === formInstance.options.focus) return null;

      for (var i = 0; i < formInstance.fields.length; i++) {
        var field = formInstance.fields[i];
        if (true !== field.validationResult && field.validationResult.length > 0 && 'undefined' === typeof field.options.noFocus) {
          formInstance._focusedField = field.$element;
          if ('first' === formInstance.options.focus) break;
        }
      }

      if (null === formInstance._focusedField) return null;

      return formInstance._focusedField.focus();
    },

    _getErrorMessage: function _getErrorMessage(fieldInstance, constraint) {
      var customConstraintErrorMessage = constraint.name + 'Message';

      if ('undefined' !== typeof fieldInstance.options[customConstraintErrorMessage]) return window.Parsley.formatMessage(fieldInstance.options[customConstraintErrorMessage], constraint.requirements);

      return window.Parsley.getErrorMessage(constraint);
    },

    _diff: function _diff(newResult, oldResult, deep) {
      var added = [];
      var kept = [];

      for (var i = 0; i < newResult.length; i++) {
        var found = false;

        for (var j = 0; j < oldResult.length; j++) if (newResult[i].assert.name === oldResult[j].assert.name) {
          found = true;
          break;
        }

        if (found) kept.push(newResult[i]);else added.push(newResult[i]);
      }

      return {
        kept: kept,
        added: added,
        removed: !deep ? this._diff(oldResult, newResult, true).added : []
      };
    },

    setupForm: function setupForm(formInstance) {
      formInstance.$element.on('submit.Parsley', false, $.proxy(formInstance.onSubmitValidate, formInstance));
      formInstance.$element.on('click.Parsley', 'input[type="submit"], button[type="submit"]', $.proxy(formInstance.onSubmitButton, formInstance));

      // UI could be disabled
      if (false === formInstance.options.uiEnabled) return;

      formInstance.$element.attr('novalidate', '');
    },

    setupField: function setupField(fieldInstance) {
      var _ui = { active: false };

      // UI could be disabled
      if (false === fieldInstance.options.uiEnabled) return;

      _ui.active = true;

      // Give field its Parsley id in DOM
      fieldInstance.$element.attr(fieldInstance.options.namespace + 'id', fieldInstance.__id__);

      /** Generate important UI elements and store them in fieldInstance **/
        // $errorClassHandler is the $element that woul have parsley-error and parsley-success classes
      _ui.$errorClassHandler = this._manageClassHandler(fieldInstance);

      // $errorsWrapper is a div that would contain the various field errors, it will be appended into $errorsContainer
      _ui.errorsWrapperId = 'parsley-id-' + (fieldInstance.options.multiple ? 'multiple-' + fieldInstance.options.multiple : fieldInstance.__id__);
      _ui.$errorsWrapper = $(fieldInstance.options.errorsWrapper).attr('id', _ui.errorsWrapperId);

      // ValidationResult UI storage to detect what have changed bwt two validations, and update DOM accordingly
      _ui.lastValidationResult = [];
      _ui.validatedOnce = false;
      _ui.validationInformationVisible = false;

      // Store it in fieldInstance for later
      fieldInstance._ui = _ui;

      // Bind triggers first time
      this.actualizeTriggers(fieldInstance);
    },

    // Determine which element will have `parsley-error` and `parsley-success` classes
    _manageClassHandler: function _manageClassHandler(fieldInstance) {
      // An element selector could be passed through DOM with `data-parsley-class-handler=#foo`
      if ('string' === typeof fieldInstance.options.classHandler && $(fieldInstance.options.classHandler).length) return $(fieldInstance.options.classHandler);

      // Class handled could also be determined by function given in Parsley options
      var $handler = fieldInstance.options.classHandler(fieldInstance);

      // If this function returned a valid existing DOM element, go for it
      if ('undefined' !== typeof $handler && $handler.length) return $handler;

      // Otherwise, if simple element (input, texatrea, select...) it will perfectly host the classes
      if (!fieldInstance.options.multiple || fieldInstance.$element.is('select')) return fieldInstance.$element;

      // But if multiple element (radio, checkbox), that would be their parent
      return fieldInstance.$element.parent();
    },

    _insertErrorWrapper: function _insertErrorWrapper(fieldInstance) {
      var $errorsContainer;

      // Nothing to do if already inserted
      if (0 !== fieldInstance._ui.$errorsWrapper.parent().length) return fieldInstance._ui.$errorsWrapper.parent();

      if ('string' === typeof fieldInstance.options.errorsContainer) {
        if ($(fieldInstance.options.errorsContainer).length) return $(fieldInstance.options.errorsContainer).append(fieldInstance._ui.$errorsWrapper);else ParsleyUtils__default.warn('The errors container `' + fieldInstance.options.errorsContainer + '` does not exist in DOM');
      } else if ('function' === typeof fieldInstance.options.errorsContainer) $errorsContainer = fieldInstance.options.errorsContainer(fieldInstance);

      if ('undefined' !== typeof $errorsContainer && $errorsContainer.length) return $errorsContainer.append(fieldInstance._ui.$errorsWrapper);

      var $from = fieldInstance.$element;
      if (fieldInstance.options.multiple) $from = $from.parent();
      return $from.after(fieldInstance._ui.$errorsWrapper);
    },

    actualizeTriggers: function actualizeTriggers(fieldInstance) {
      var $toBind = fieldInstance.$element;
      if (fieldInstance.options.multiple) $toBind = $('[' + fieldInstance.options.namespace + 'multiple="' + fieldInstance.options.multiple + '"]');

      // Remove Parsley events already binded on this field
      $toBind.off('.Parsley');

      // If no trigger is set, all good
      if (false === fieldInstance.options.trigger) return;

      var triggers = fieldInstance.options.trigger.replace(/^\s+/g, '').replace(/\s+$/g, '');

      if ('' === triggers) return;

      // Bind fieldInstance.eventValidate if exists (for parsley.ajax for example), ParsleyUI.eventValidate otherwise
      $toBind.on(triggers.split(' ').join('.Parsley ') + '.Parsley', $.proxy('function' === typeof fieldInstance.eventValidate ? fieldInstance.eventValidate : this.eventValidate, fieldInstance));
    },

    // Called through $.proxy with fieldInstance. `this` context is ParsleyField
    eventValidate: function eventValidate(event) {
      // For keyup, keypress, keydown... events that could be a little bit obstrusive
      // do not validate if val length < min threshold on first validation. Once field have been validated once and info
      // about success or failure have been displayed, always validate with this trigger to reflect every yalidation change.
      if (new RegExp('key').test(event.type)) if (!this._ui.validationInformationVisible && this.getValue().length <= this.options.validationThreshold) return;

      this._ui.validatedOnce = true;
      this.validate();
    },

    manageFailingFieldTrigger: function manageFailingFieldTrigger(fieldInstance) {
      fieldInstance._ui.failedOnce = true;

      // Radio and checkboxes fields must bind every field multiple
      if (fieldInstance.options.multiple) $('[' + fieldInstance.options.namespace + 'multiple="' + fieldInstance.options.multiple + '"]').each(function () {
        if (!new RegExp('change', 'i').test($(this).parsley().options.trigger || '')) return $(this).on('change.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));
      });

      // Select case
      if (fieldInstance.$element.is('select')) if (!new RegExp('change', 'i').test(fieldInstance.options.trigger || '')) return fieldInstance.$element.on('change.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));

      // All other inputs fields
      if (!new RegExp('keyup', 'i').test(fieldInstance.options.trigger || '')) return fieldInstance.$element.on('keyup.ParsleyFailedOnce', false, $.proxy(fieldInstance.validate, fieldInstance));
    },

    reset: function reset(parsleyInstance) {
      // Reset all event listeners
      this.actualizeTriggers(parsleyInstance);
      parsleyInstance.$element.off('.ParsleyFailedOnce');

      // Nothing to do if UI never initialized for this field
      if ('undefined' === typeof parsleyInstance._ui) return;

      if ('ParsleyForm' === parsleyInstance.__class__) return;

      // Reset all errors' li
      parsleyInstance._ui.$errorsWrapper.removeClass('filled').children().remove();

      // Reset validation class
      this._resetClass(parsleyInstance);

      // Reset validation flags and last validation result
      parsleyInstance._ui.validatedOnce = false;
      parsleyInstance._ui.lastValidationResult = [];
      parsleyInstance._ui.validationInformationVisible = false;
      parsleyInstance._ui.failedOnce = false;
    },

    destroy: function destroy(parsleyInstance) {
      this.reset(parsleyInstance);

      if ('ParsleyForm' === parsleyInstance.__class__) return;

      if ('undefined' !== typeof parsleyInstance._ui) parsleyInstance._ui.$errorsWrapper.remove();

      delete parsleyInstance._ui;
    },

    _successClass: function _successClass(fieldInstance) {
      fieldInstance._ui.validationInformationVisible = true;
      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.errorClass).addClass(fieldInstance.options.successClass);
    },
    _errorClass: function _errorClass(fieldInstance) {
      fieldInstance._ui.validationInformationVisible = true;
      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.successClass).addClass(fieldInstance.options.errorClass);
    },
    _resetClass: function _resetClass(fieldInstance) {
      fieldInstance._ui.$errorClassHandler.removeClass(fieldInstance.options.successClass).removeClass(fieldInstance.options.errorClass);
    }
  };

  var ParsleyForm = function ParsleyForm(element, domOptions, options) {
    this.__class__ = 'ParsleyForm';
    this.__id__ = ParsleyUtils__default.generateID();

    this.$element = $(element);
    this.domOptions = domOptions;
    this.options = options;
    this.parent = window.Parsley;

    this.fields = [];
    this.validationResult = null;
  };

  var ParsleyForm__statusMapping = { pending: null, resolved: true, rejected: false };

  ParsleyForm.prototype = {
    onSubmitValidate: function onSubmitValidate(event) {
      var that = this;

      // This is a Parsley generated submit event, do not validate, do not prevent, simply exit and keep normal behavior
      if (true === event.parsley) return;

      // If we didn't come here through a submit button, use the first one in the form
      this._$submitSource = this._$submitSource || this.$element.find('input[type="submit"], button[type="submit"]').first();

      if (this._$submitSource.is('[formnovalidate]')) {
        this._$submitSource = null;
        return;
      }

      // Because some validations might be asynchroneous,
      // we cancel this submit and will fake it after validation.
      event.stopImmediatePropagation();
      event.preventDefault();

      this.whenValidate(undefined, undefined, event).done(function () {
        that._submit();
      }).always(function () {
        that._$submitSource = null;
      });

      return this;
    },

    onSubmitButton: function onSubmitButton(event) {
      this._$submitSource = $(event.target);
    },
    // internal
    // _submit submits the form, this time without going through the validations.
    // Care must be taken to "fake" the actual submit button being clicked.
    _submit: function _submit() {
      if (false === this._trigger('submit')) return;
      this.$element.find('.parsley_synthetic_submit_button').remove();
      // Add submit button's data
      if (this._$submitSource) {
        $('<input class="parsley_synthetic_submit_button" type="hidden">').attr('name', this._$submitSource.attr('name')).attr('value', this._$submitSource.attr('value')).appendTo(this.$element);
      }
      //
      this.$element.trigger($.extend($.Event('submit'), { parsley: true }));
    },

    // Performs validation on fields while triggering events.
    // @returns `true` if al validations succeeds, `false`
    // if a failure is immediately detected, or `null`
    // if dependant on a promise.
    // Prefer `whenValidate`.
    validate: function validate(group, force, event) {
      return ParsleyForm__statusMapping[this.whenValidate(group, force, event).state()];
    },

    whenValidate: function whenValidate(group, force, event) {
      var that = this;
      this.submitEvent = event;
      this.validationResult = true;

      // fire validate event to eventually modify things before very validation
      this._trigger('validate');

      // Refresh form DOM options and form's fields that could have changed
      this._refreshFields();

      var promises = this._withoutReactualizingFormOptions(function () {
        return $.map(this.fields, function (field) {
          // do not validate a field if not the same as given validation group
          if (!group || that._isFieldInGroup(field, group)) return field.whenValidate(force);
        });
      });

      var promiseBasedOnValidationResult = function promiseBasedOnValidationResult() {
        var r = $.Deferred();
        if (false === that.validationResult) r.reject();
        return r.resolve().promise();
      };

      return $.when.apply($, promises).done(function () {
        that._trigger('success');
      }).fail(function () {
        that.validationResult = false;that._trigger('error');
      }).always(function () {
        that._trigger('validated');
      }).pipe(promiseBasedOnValidationResult, promiseBasedOnValidationResult);
    },

    // Iterate over refreshed fields, and stop on first failure.
    // Returns `true` if all fields are valid, `false` if a failure is detected
    // or `null` if the result depends on an unresolved promise.
    // Prefer using `whenValid` instead.
    isValid: function isValid(group, force) {
      return ParsleyForm__statusMapping[this.whenValid(group, force).state()];
    },

    // Iterate over refreshed fields and validate them.
    // Returns a promise.
    // A validation that immediately fails will interrupt the validations.
    whenValid: function whenValid(group, force) {
      var that = this;
      this._refreshFields();

      var promises = this._withoutReactualizingFormOptions(function () {
        return $.map(this.fields, function (field) {
          // do not validate a field if not the same as given validation group
          if (!group || that._isFieldInGroup(field, group)) return field.whenValid(force);
        });
      });
      return $.when.apply($, promises);
    },

    _isFieldInGroup: function _isFieldInGroup(field, group) {
      if ($.isArray(field.options.group)) return -1 !== $.inArray(group, field.options.group);
      return field.options.group === group;
    },

    _refreshFields: function _refreshFields() {
      return this.actualizeOptions()._bindFields();
    },

    _bindFields: function _bindFields() {
      var self = this;
      var oldFields = this.fields;

      this.fields = [];
      this.fieldsMappedById = {};

      this._withoutReactualizingFormOptions(function () {
        this.$element.find(this.options.inputs).not(this.options.excluded).each(function () {
          var fieldInstance = new window.Parsley.Factory(this, {}, self);

          // Only add valid and not excluded `ParsleyField` and `ParsleyFieldMultiple` children
          if (('ParsleyField' === fieldInstance.__class__ || 'ParsleyFieldMultiple' === fieldInstance.__class__) && true !== fieldInstance.options.excluded) if ('undefined' === typeof self.fieldsMappedById[fieldInstance.__class__ + '-' + fieldInstance.__id__]) {
            self.fieldsMappedById[fieldInstance.__class__ + '-' + fieldInstance.__id__] = fieldInstance;
            self.fields.push(fieldInstance);
          }
        });

        $(oldFields).not(self.fields).each(function () {
          this._trigger('reset');
        });
      });
      return this;
    },

    // Internal only.
    // Looping on a form's fields to do validation or similar
    // will trigger reactualizing options on all of them, which
    // in turn will reactualize the form's options.
    // To avoid calling actualizeOptions so many times on the form
    // for nothing, _withoutReactualizingFormOptions temporarily disables
    // the method actualizeOptions on this form while `fn` is called.
    _withoutReactualizingFormOptions: function _withoutReactualizingFormOptions(fn) {
      var oldActualizeOptions = this.actualizeOptions;
      this.actualizeOptions = function () {
        return this;
      };
      var result = fn.call(this); // Keep the current `this`.
      this.actualizeOptions = oldActualizeOptions;
      return result;
    },

    // Internal only.
    // Shortcut to trigger an event
    // Returns true iff event is not interrupted and default not prevented.
    _trigger: function _trigger(eventName) {
      return this.trigger('form:' + eventName);
    }

  };

  var ConstraintFactory = function ConstraintFactory(parsleyField, name, requirements, priority, isDomConstraint) {
    if (!new RegExp('ParsleyField').test(parsleyField.__class__)) throw new Error('ParsleyField or ParsleyFieldMultiple instance expected');

    var validatorSpec = window.Parsley._validatorRegistry.validators[name];
    var validator = new ParsleyValidator(validatorSpec);

    $.extend(this, {
      validator: validator,
      name: name,
      requirements: requirements,
      priority: priority || parsleyField.options[name + 'Priority'] || validator.priority,
      isDomConstraint: true === isDomConstraint
    });
    this._parseRequirements(parsleyField.options);
  };

  var capitalize = function capitalize(str) {
    var cap = str[0].toUpperCase();
    return cap + str.slice(1);
  };

  ConstraintFactory.prototype = {
    validate: function validate(value, instance) {
      var args = this.requirementList.slice(0); // Make copy
      args.unshift(value);
      args.push(instance);
      return this.validator.validate.apply(this.validator, args);
    },

    _parseRequirements: function _parseRequirements(options) {
      var that = this;
      this.requirementList = this.validator.parseRequirements(this.requirements, function (key) {
        return options[that.name + capitalize(key)];
      });
    }
  };

  var ParsleyField = function ParsleyField(field, domOptions, options, parsleyFormInstance) {
    this.__class__ = 'ParsleyField';
    this.__id__ = ParsleyUtils__default.generateID();

    this.$element = $(field);

    // Set parent if we have one
    if ('undefined' !== typeof parsleyFormInstance) {
      this.parent = parsleyFormInstance;
    }

    this.options = options;
    this.domOptions = domOptions;

    // Initialize some properties
    this.constraints = [];
    this.constraintsByName = {};
    this.validationResult = [];

    // Bind constraints
    this._bindConstraints();
  };

  var parsley_field__statusMapping = { pending: null, resolved: true, rejected: false };

  ParsleyField.prototype = {
    // # Public API
    // Validate field and trigger some events for mainly `ParsleyUI`
    // @returns `true`, an array of the validators that failed, or
    // `null` if validation is not finished. Prefer using whenValidate
    validate: function validate(force) {
      var promise = this.whenValidate(force);
      switch (promise.state()) {
        case 'pending':
          return null;
        case 'resolved':
          return true;
        case 'rejected':
          return this.validationResult;
      }
    },

    // Validate field and trigger some events for mainly `ParsleyUI`
    // @returns a promise that succeeds only when all validations do.
    whenValidate: function whenValidate(force) {
      var that = this;

      this.value = this.getValue();

      // Field Validate event. `this.value` could be altered for custom needs
      this._trigger('validate');

      return this.whenValid(force, this.value).done(function () {
        that._trigger('success');
      }).fail(function () {
        that._trigger('error');
      }).always(function () {
        that._trigger('validated');
      });
    },

    hasConstraints: function hasConstraints() {
      return 0 !== this.constraints.length;
    },

    // An empty optional field does not need validation
    needsValidation: function needsValidation(value) {
      if ('undefined' === typeof value) value = this.getValue();

      // If a field is empty and not required, it is valid
      // Except if `data-parsley-validate-if-empty` explicitely added, useful for some custom validators
      if (!value.length && !this._isRequired() && 'undefined' === typeof this.options.validateIfEmpty) return false;

      return true;
    },

    // Just validate field. Do not trigger any event.
    // Returns `true` iff all constraints pass, `false` if there are failures,
    // or `null` if the result can not be determined yet (depends on a promise)
    // See also `whenValid`.
    isValid: function isValid(force, value) {
      return parsley_field__statusMapping[this.whenValid(force, value).state()];
    },

    // Just validate field. Do not trigger any event.
    // @returns a promise that succeeds only when all validations do.
    // The argument `force` is optional, defaults to `false`.
    // The argument `value` is optional. If given, it will be validated instead of the value of the input.
    whenValid: function whenValid(force, value) {
      // Recompute options and rebind constraints to have latest changes
      this.refreshConstraints();
      this.validationResult = true;

      // A field without constraint is valid
      if (!this.hasConstraints()) return $.when();

      // Make `force` argument optional
      if ('boolean' !== typeof force && 'undefined' === typeof value) {
        value = force;
        force = false;
      }
      // Value could be passed as argument, needed to add more power to 'parsley:field:validate'
      if ('undefined' === typeof value || null === value) value = this.getValue();

      if (!this.needsValidation(value) && true !== force) return $.when();

      var groupedConstraints = this._getGroupedConstraints();
      var promises = [];
      var that = this;
      $.each(groupedConstraints, function (_, constraints) {
        // Process one group of constraints at a time, we validate the constraints
        // and combine the promises together.
        var promise = $.when.apply($, $.map(constraints, $.proxy(that, '_validateConstraint', value)));
        promises.push(promise);
        if (promise.state() === 'rejected') return false; // Interrupt processing if a group has already failed
      });
      return $.when.apply($, promises);
    },

    // @returns a promise
    _validateConstraint: function _validateConstraint(value, constraint) {
      var that = this;
      var result = constraint.validate(value, this);
      // Map false to a failed promise
      if (false === result) result = $.Deferred().reject();
      // Make sure we return a promise and that we record failures
      return $.when(result).fail(function (errorMessage) {
        if (true === that.validationResult) that.validationResult = [];
        that.validationResult.push({
          assert: constraint,
          errorMessage: 'string' === typeof errorMessage && errorMessage
        });
      });
    },

    // @returns Parsley field computed value that could be overrided or configured in DOM
    getValue: function getValue() {
      var value;

      // Value could be overriden in DOM or with explicit options
      if ('function' === typeof this.options.value) value = this.options.value(this);else if ('undefined' !== typeof this.options.value) value = this.options.value;else value = this.$element.val();

      // Handle wrong DOM or configurations
      if ('undefined' === typeof value || null === value) return '';

      return this._handleWhitespace(value);
    },

    // Actualize options that could have change since previous validation
    // Re-bind accordingly constraints (could be some new, removed or updated)
    refreshConstraints: function refreshConstraints() {
      return this.actualizeOptions()._bindConstraints();
    },

    /**
     * Add a new constraint to a field
     *
     * @param {String}   name
     * @param {Mixed}    requirements      optional
     * @param {Number}   priority          optional
     * @param {Boolean}  isDomConstraint   optional
     */
    addConstraint: function addConstraint(name, requirements, priority, isDomConstraint) {

      if (window.Parsley._validatorRegistry.validators[name]) {
        var constraint = new ConstraintFactory(this, name, requirements, priority, isDomConstraint);

        // if constraint already exist, delete it and push new version
        if ('undefined' !== this.constraintsByName[constraint.name]) this.removeConstraint(constraint.name);

        this.constraints.push(constraint);
        this.constraintsByName[constraint.name] = constraint;
      }

      return this;
    },

    // Remove a constraint
    removeConstraint: function removeConstraint(name) {
      for (var i = 0; i < this.constraints.length; i++) if (name === this.constraints[i].name) {
        this.constraints.splice(i, 1);
        break;
      }
      delete this.constraintsByName[name];
      return this;
    },

    // Update a constraint (Remove + re-add)
    updateConstraint: function updateConstraint(name, parameters, priority) {
      return this.removeConstraint(name).addConstraint(name, parameters, priority);
    },

    // # Internals

    // Internal only.
    // Bind constraints from config + options + DOM
    _bindConstraints: function _bindConstraints() {
      var constraints = [];
      var constraintsByName = {};

      // clean all existing DOM constraints to only keep javascript user constraints
      for (var i = 0; i < this.constraints.length; i++) if (false === this.constraints[i].isDomConstraint) {
        constraints.push(this.constraints[i]);
        constraintsByName[this.constraints[i].name] = this.constraints[i];
      }

      this.constraints = constraints;
      this.constraintsByName = constraintsByName;

      // then re-add Parsley DOM-API constraints
      for (var name in this.options) this.addConstraint(name, this.options[name], undefined, true);

      // finally, bind special HTML5 constraints
      return this._bindHtml5Constraints();
    },

    // Internal only.
    // Bind specific HTML5 constraints to be HTML5 compliant
    _bindHtml5Constraints: function _bindHtml5Constraints() {
      // html5 required
      if (this.$element.hasClass('required') || this.$element.attr('required')) this.addConstraint('required', true, undefined, true);

      // html5 pattern
      if ('string' === typeof this.$element.attr('pattern')) this.addConstraint('pattern', this.$element.attr('pattern'), undefined, true);

      // range
      if ('undefined' !== typeof this.$element.attr('min') && 'undefined' !== typeof this.$element.attr('max')) this.addConstraint('range', [this.$element.attr('min'), this.$element.attr('max')], undefined, true);

      // HTML5 min
      else if ('undefined' !== typeof this.$element.attr('min')) this.addConstraint('min', this.$element.attr('min'), undefined, true);

      // HTML5 max
      else if ('undefined' !== typeof this.$element.attr('max')) this.addConstraint('max', this.$element.attr('max'), undefined, true);

      // length
      if ('undefined' !== typeof this.$element.attr('minlength') && 'undefined' !== typeof this.$element.attr('maxlength')) this.addConstraint('length', [this.$element.attr('minlength'), this.$element.attr('maxlength')], undefined, true);

      // HTML5 minlength
      else if ('undefined' !== typeof this.$element.attr('minlength')) this.addConstraint('minlength', this.$element.attr('minlength'), undefined, true);

      // HTML5 maxlength
      else if ('undefined' !== typeof this.$element.attr('maxlength')) this.addConstraint('maxlength', this.$element.attr('maxlength'), undefined, true);

      // html5 types
      var type = this.$element.attr('type');

      if ('undefined' === typeof type) return this;

      // Small special case here for HTML5 number: integer validator if step attribute is undefined or an integer value, number otherwise
      if ('number' === type) {
        if ('undefined' === typeof this.$element.attr('step') || 0 === parseFloat(this.$element.attr('step')) % 1) {
          return this.addConstraint('type', 'integer', undefined, true);
        } else {
          return this.addConstraint('type', 'number', undefined, true);
        }
        // Regular other HTML5 supported types
      } else if (/^(email|url|range)$/i.test(type)) {
        return this.addConstraint('type', type, undefined, true);
      }
      return this;
    },

    // Internal only.
    // Field is required if have required constraint without `false` value
    _isRequired: function _isRequired() {
      if ('undefined' === typeof this.constraintsByName.required) return false;

      return false !== this.constraintsByName.required.requirements;
    },

    // Internal only.
    // Shortcut to trigger an event
    _trigger: function _trigger(eventName) {
      return this.trigger('field:' + eventName);
    },

    // Internal only
    // Handles whitespace in a value
    // Use `data-parsley-whitespace="squish"` to auto squish input value
    // Use `data-parsley-whitespace="trim"` to auto trim input value
    _handleWhitespace: function _handleWhitespace(value) {
      if (true === this.options.trimValue) ParsleyUtils__default.warnOnce('data-parsley-trim-value="true" is deprecated, please use data-parsley-whitespace="trim"');

      if ('squish' === this.options.whitespace) value = value.replace(/\s{2,}/g, ' ');

      if ('trim' === this.options.whitespace || 'squish' === this.options.whitespace || true === this.options.trimValue) value = ParsleyUtils__default.trimString(value);

      return value;
    },

    // Internal only.
    // Returns the constraints, grouped by descending priority.
    // The result is thus an array of arrays of constraints.
    _getGroupedConstraints: function _getGroupedConstraints() {
      if (false === this.options.priorityEnabled) return [this.constraints];

      var groupedConstraints = [];
      var index = {};

      // Create array unique of priorities
      for (var i = 0; i < this.constraints.length; i++) {
        var p = this.constraints[i].priority;
        if (!index[p]) groupedConstraints.push(index[p] = []);
        index[p].push(this.constraints[i]);
      }
      // Sort them by priority DESC
      groupedConstraints.sort(function (a, b) {
        return b[0].priority - a[0].priority;
      });

      return groupedConstraints;
    }

  };

  var parsley_field = ParsleyField;

  var ParsleyMultiple = function ParsleyMultiple() {
    this.__class__ = 'ParsleyFieldMultiple';
  };

  ParsleyMultiple.prototype = {
    // Add new `$element` sibling for multiple field
    addElement: function addElement($element) {
      this.$elements.push($element);

      return this;
    },

    // See `ParsleyField.refreshConstraints()`
    refreshConstraints: function refreshConstraints() {
      var fieldConstraints;

      this.constraints = [];

      // Select multiple special treatment
      if (this.$element.is('select')) {
        this.actualizeOptions()._bindConstraints();

        return this;
      }

      // Gather all constraints for each input in the multiple group
      for (var i = 0; i < this.$elements.length; i++) {

        // Check if element have not been dynamically removed since last binding
        if (!$('html').has(this.$elements[i]).length) {
          this.$elements.splice(i, 1);
          continue;
        }

        fieldConstraints = this.$elements[i].data('ParsleyFieldMultiple').refreshConstraints().constraints;

        for (var j = 0; j < fieldConstraints.length; j++) this.addConstraint(fieldConstraints[j].name, fieldConstraints[j].requirements, fieldConstraints[j].priority, fieldConstraints[j].isDomConstraint);
      }

      return this;
    },

    // See `ParsleyField.getValue()`
    getValue: function getValue() {
      // Value could be overriden in DOM
      if ('undefined' !== typeof this.options.value) return this.options.value;

      // Radio input case
      if (this.$element.is('input[type=radio]')) return this._findRelatedMultiple().filter(':checked').val() || '';

      // checkbox input case
      if (this.$element.is('input[type=checkbox]')) {
        var values = [];

        this._findRelatedMultiple().filter(':checked').each(function () {
          values.push($(this).val());
        });

        return values;
      }

      // Select multiple case
      if (this.$element.is('select') && null === this.$element.val()) return [];

      // Default case that should never happen
      return this.$element.val();
    },

    _init: function _init() {
      this.$elements = [this.$element];

      return this;
    }
  };

  var ParsleyFactory = function ParsleyFactory(element, options, parsleyFormInstance) {
    this.$element = $(element);

    // If the element has already been bound, returns its saved Parsley instance
    var savedparsleyFormInstance = this.$element.data('Parsley');
    if (savedparsleyFormInstance) {

      // If the saved instance has been bound without a ParsleyForm parent and there is one given in this call, add it
      if ('undefined' !== typeof parsleyFormInstance && savedparsleyFormInstance.parent === window.Parsley) {
        savedparsleyFormInstance.parent = parsleyFormInstance;
        savedparsleyFormInstance._resetOptions(savedparsleyFormInstance.options);
      }

      return savedparsleyFormInstance;
    }

    // Parsley must be instantiated with a DOM element or jQuery $element
    if (!this.$element.length) throw new Error('You must bind Parsley on an existing element.');

    if ('undefined' !== typeof parsleyFormInstance && 'ParsleyForm' !== parsleyFormInstance.__class__) throw new Error('Parent instance must be a ParsleyForm instance');

    this.parent = parsleyFormInstance || window.Parsley;
    return this.init(options);
  };

  ParsleyFactory.prototype = {
    init: function init(options) {
      this.__class__ = 'Parsley';
      this.__version__ = '@@version';
      this.__id__ = ParsleyUtils__default.generateID();

      // Pre-compute options
      this._resetOptions(options);

      // A ParsleyForm instance is obviously a `<form>` element but also every node that is not an input and has the `data-parsley-validate` attribute
      if (this.$element.is('form') || ParsleyUtils__default.checkAttr(this.$element, this.options.namespace, 'validate') && !this.$element.is(this.options.inputs)) return this.bind('parsleyForm');

      // Every other element is bound as a `ParsleyField` or `ParsleyFieldMultiple`
      return this.isMultiple() ? this.handleMultiple() : this.bind('parsleyField');
    },

    isMultiple: function isMultiple() {
      return this.$element.is('input[type=radio], input[type=checkbox]') || this.$element.is('select') && 'undefined' !== typeof this.$element.attr('multiple');
    },

    // Multiples fields are a real nightmare :(
    // Maybe some refactoring would be appreciated here...
    handleMultiple: function handleMultiple() {
      var that = this;
      var name;
      var multiple;
      var parsleyMultipleInstance;

      // Handle multiple name
      if (this.options.multiple) ; // We already have our 'multiple' identifier
      else if ('undefined' !== typeof this.$element.attr('name') && this.$element.attr('name').length) this.options.multiple = name = this.$element.attr('name');else if ('undefined' !== typeof this.$element.attr('id') && this.$element.attr('id').length) this.options.multiple = this.$element.attr('id');

      // Special select multiple input
      if (this.$element.is('select') && 'undefined' !== typeof this.$element.attr('multiple')) {
        this.options.multiple = this.options.multiple || this.__id__;
        return this.bind('parsleyFieldMultiple');

        // Else for radio / checkboxes, we need a `name` or `data-parsley-multiple` to properly bind it
      } else if (!this.options.multiple) {
        ParsleyUtils__default.warn('To be bound by Parsley, a radio, a checkbox and a multiple select input must have either a name or a multiple option.', this.$element);
        return this;
      }

      // Remove special chars
      this.options.multiple = this.options.multiple.replace(/(:|\.|\[|\]|\{|\}|\$)/g, '');

      // Add proper `data-parsley-multiple` to siblings if we have a valid multiple name
      if ('undefined' !== typeof name) {
        $('input[name="' + name + '"]').each(function () {
          if ($(this).is('input[type=radio], input[type=checkbox]')) $(this).attr(that.options.namespace + 'multiple', that.options.multiple);
        });
      }

      // Check here if we don't already have a related multiple instance saved
      var $previouslyRelated = this._findRelatedMultiple();
      for (var i = 0; i < $previouslyRelated.length; i++) {
        parsleyMultipleInstance = $($previouslyRelated.get(i)).data('Parsley');
        if ('undefined' !== typeof parsleyMultipleInstance) {

          if (!this.$element.data('ParsleyFieldMultiple')) {
            parsleyMultipleInstance.addElement(this.$element);
          }

          break;
        }
      }

      // Create a secret ParsleyField instance for every multiple field. It will be stored in `data('ParsleyFieldMultiple')`
      // And will be useful later to access classic `ParsleyField` stuff while being in a `ParsleyFieldMultiple` instance
      this.bind('parsleyField', true);

      return parsleyMultipleInstance || this.bind('parsleyFieldMultiple');
    },

    // Return proper `ParsleyForm`, `ParsleyField` or `ParsleyFieldMultiple`
    bind: function bind(type, doNotStore) {
      var parsleyInstance;

      switch (type) {
        case 'parsleyForm':
          parsleyInstance = $.extend(new ParsleyForm(this.$element, this.domOptions, this.options), window.ParsleyExtend)._bindFields();
          break;
        case 'parsleyField':
          parsleyInstance = $.extend(new parsley_field(this.$element, this.domOptions, this.options, this.parent), window.ParsleyExtend);
          break;
        case 'parsleyFieldMultiple':
          parsleyInstance = $.extend(new parsley_field(this.$element, this.domOptions, this.options, this.parent), new ParsleyMultiple(), window.ParsleyExtend)._init();
          break;
        default:
          throw new Error(type + 'is not a supported Parsley type');
      }

      if (this.options.multiple) ParsleyUtils__default.setAttr(this.$element, this.options.namespace, 'multiple', this.options.multiple);

      if ('undefined' !== typeof doNotStore) {
        this.$element.data('ParsleyFieldMultiple', parsleyInstance);

        return parsleyInstance;
      }

      // Store the freshly bound instance in a DOM element for later access using jQuery `data()`
      this.$element.data('Parsley', parsleyInstance);

      // Tell the world we have a new ParsleyForm or ParsleyField instance!
      parsleyInstance._trigger('init');

      return parsleyInstance;
    }
  };

  var vernums = $.fn.jquery.split('.');
  if (parseInt(vernums[0]) <= 1 && parseInt(vernums[1]) < 8) {
    throw "The loaded version of jQuery is too old. Please upgrade to 1.8.x or better.";
  }
  if (!vernums.forEach) {
    ParsleyUtils__default.warn('Parsley requires ES5 to run properly. Please include https://github.com/es-shims/es5-shim');
  }
  // Inherit `on`, `off` & `trigger` to Parsley:
  var Parsley = $.extend(new ParsleyAbstract(), {
    $element: $(document),
    actualizeOptions: null,
    _resetOptions: null,
    Factory: ParsleyFactory,
    version: '@@version'
  });

  // Supplement ParsleyField and Form with ParsleyAbstract
  // This way, the constructors will have access to those methods
  $.extend(parsley_field.prototype, ParsleyAbstract.prototype);
  $.extend(ParsleyForm.prototype, ParsleyAbstract.prototype);
  // Inherit actualizeOptions and _resetOptions:
  $.extend(ParsleyFactory.prototype, ParsleyAbstract.prototype);

  // ### jQuery API
  // `$('.elem').parsley(options)` or `$('.elem').psly(options)`
  $.fn.parsley = $.fn.psly = function (options) {
    if (this.length > 1) {
      var instances = [];

      this.each(function () {
        instances.push($(this).parsley(options));
      });

      return instances;
    }

    // Return undefined if applied to non existing DOM element
    if (!$(this).length) {
      ParsleyUtils__default.warn('You must bind Parsley on an existing element.');

      return;
    }

    return new ParsleyFactory(this, options);
  };

  // ### ParsleyField and ParsleyForm extension
  // Ensure the extension is now defined if it wasn't previously
  if ('undefined' === typeof window.ParsleyExtend) window.ParsleyExtend = {};

  // ### Parsley config
  // Inherit from ParsleyDefault, and copy over any existing values
  Parsley.options = $.extend(ParsleyUtils__default.objectCreate(ParsleyDefaults), window.ParsleyConfig);
  window.ParsleyConfig = Parsley.options; // Old way of accessing global options

  // ### Globals
  window.Parsley = window.psly = Parsley;
  window.ParsleyUtils = ParsleyUtils__default;

  // ### Define methods that forward to the registry, and deprecate all access except through window.Parsley
  var registry = window.Parsley._validatorRegistry = new ParsleyValidatorRegistry(window.ParsleyConfig.validators, window.ParsleyConfig.i18n);
  window.ParsleyValidator = {};
  $.each('setLocale addCatalog addMessage addMessages getErrorMessage formatMessage addValidator updateValidator removeValidator'.split(' '), function (i, method) {
    window.Parsley[method] = $.proxy(registry, method);
    window.ParsleyValidator[method] = function () {
      ParsleyUtils__default.warnOnce('Accessing the method \'' + method + '\' through ParsleyValidator is deprecated. Simply call \'window.Parsley.' + method + '(...)\'');
      return window.Parsley[method].apply(window.Parsley, arguments);
    };
  });

  // ### ParsleyUI
  // UI is a separate class that only listens to some events and then modifies the DOM accordingly
  // Could be overriden by defining a `window.ParsleyConfig.ParsleyUI` appropriate class (with `listen()` method basically)
  window.ParsleyUI = 'function' === typeof window.ParsleyConfig.ParsleyUI ? new window.ParsleyConfig.ParsleyUI().listen() : new ParsleyUI().listen();

  // ### PARSLEY auto-binding
  // Prevent it by setting `ParsleyConfig.autoBind` to `false`
  if (false !== window.ParsleyConfig.autoBind) {
    $(function () {
      // Works only on `data-parsley-validate`.
      if ($('[data-parsley-validate]').length) $('[data-parsley-validate]').parsley();
    });
  }

  var o = $({});
  var deprecated = function deprecated() {
    ParsleyUtils__default.warnOnce("Parsley's pubsub module is deprecated; use the 'on' and 'off' methods on parsley instances or window.Parsley");
  };

  // Returns an event handler that calls `fn` with the arguments it expects
  function adapt(fn, context) {
    // Store to allow unbinding
    if (!fn.parsleyAdaptedCallback) {
      fn.parsleyAdaptedCallback = function () {
        var args = Array.prototype.slice.call(arguments, 0);
        args.unshift(this);
        fn.apply(context || o, args);
      };
    }
    return fn.parsleyAdaptedCallback;
  }

  var eventPrefix = 'parsley:';
  // Converts 'parsley:form:validate' into 'form:validate'
  function eventName(name) {
    if (name.lastIndexOf(eventPrefix, 0) === 0) return name.substr(eventPrefix.length);
    return name;
  }

  // $.listen is deprecated. Use Parsley.on instead.
  $.listen = function (name, callback) {
    var context;
    deprecated();
    if ('object' === typeof arguments[1] && 'function' === typeof arguments[2]) {
      context = arguments[1];
      callback = arguments[2];
    }

    if ('function' !== typeof callback) throw new Error('Wrong parameters');

    window.Parsley.on(eventName(name), adapt(callback, context));
  };

  $.listenTo = function (instance, name, fn) {
    deprecated();
    if (!(instance instanceof parsley_field) && !(instance instanceof ParsleyForm)) throw new Error('Must give Parsley instance');

    if ('string' !== typeof name || 'function' !== typeof fn) throw new Error('Wrong parameters');

    instance.on(eventName(name), adapt(fn));
  };

  $.unsubscribe = function (name, fn) {
    deprecated();
    if ('string' !== typeof name || 'function' !== typeof fn) throw new Error('Wrong arguments');
    window.Parsley.off(eventName(name), fn.parsleyAdaptedCallback);
  };

  $.unsubscribeTo = function (instance, name) {
    deprecated();
    if (!(instance instanceof parsley_field) && !(instance instanceof ParsleyForm)) throw new Error('Must give Parsley instance');
    instance.off(eventName(name));
  };

  $.unsubscribeAll = function (name) {
    deprecated();
    window.Parsley.off(eventName(name));
    $('form,input,textarea,select').each(function () {
      var instance = $(this).data('Parsley');
      if (instance) {
        instance.off(eventName(name));
      }
    });
  };

  // $.emit is deprecated. Use jQuery events instead.
  $.emit = function (name, instance) {
    deprecated();
    var instanceGiven = instance instanceof parsley_field || instance instanceof ParsleyForm;
    var args = Array.prototype.slice.call(arguments, instanceGiven ? 2 : 1);
    args.unshift(eventName(name));
    if (!instanceGiven) {
      instance = window.Parsley;
    }
    instance.trigger.apply(instance, args);
  };

  var pubsub = {};

  $.extend(true, Parsley, {
    asyncValidators: {
      'default': {
        fn: function fn(xhr) {
          // By default, only status 2xx are deemed successful.
          // Note: we use status instead of state() because responses with status 200
          // but invalid messages (e.g. an empty body for content type set to JSON) will
          // result in state() === 'rejected'.
          return xhr.status >= 200 && xhr.status < 300;
        },
        url: false
      },
      reverse: {
        fn: function fn(xhr) {
          // If reverse option is set, a failing ajax request is considered successful
          return xhr.status < 200 || xhr.status >= 300;
        },
        url: false
      }
    },

    addAsyncValidator: function addAsyncValidator(name, fn, url, options) {
      Parsley.asyncValidators[name] = {
        fn: fn,
        url: url || false,
        options: options || {}
      };

      return this;
    },

    eventValidate: function eventValidate(event) {
      // For keyup, keypress, keydown.. events that could be a little bit obstrusive
      // do not validate if val length < min threshold on first validation. Once field have been validated once and info
      // about success or failure have been displayed, always validate with this trigger to reflect every yalidation change.
      if (new RegExp('key').test(event.type)) if (!this._ui.validationInformationVisible && this.getValue().length <= this.options.validationThreshold) return;

      this._ui.validatedOnce = true;
      this.whenValidate();
    }
  });

  Parsley.addValidator('remote', {
    requirementType: {
      '': 'string',
      'validator': 'string',
      'reverse': 'boolean',
      'options': 'object'
    },

    validateString: function validateString(value, url, options, instance) {
      var data = {};
      var ajaxOptions;
      var csr;
      var validator = options.validator || (true === options.reverse ? 'reverse' : 'default');

      if ('undefined' === typeof Parsley.asyncValidators[validator]) throw new Error('Calling an undefined async validator: `' + validator + '`');

      url = Parsley.asyncValidators[validator].url || url;

      // Fill current value
      if (url.indexOf('{value}') > -1) {
        url = url.replace('{value}', encodeURIComponent(value));
      } else {
        data[instance.$element.attr('name') || instance.$element.attr('id')] = value;
      }

      // Merge options passed in from the function with the ones in the attribute
      var remoteOptions = $.extend(true, options.options || {}, Parsley.asyncValidators[validator].options);

      // All `$.ajax(options)` could be overridden or extended directly from DOM in `data-parsley-remote-options`
      ajaxOptions = $.extend(true, {}, {
        url: url,
        data: data,
        type: 'GET'
      }, remoteOptions);

      // Generate store key based on ajax options
      instance.trigger('field:ajaxoptions', instance, ajaxOptions);

      csr = $.param(ajaxOptions);

      // Initialise querry cache
      if ('undefined' === typeof Parsley._remoteCache) Parsley._remoteCache = {};

      // Try to retrieve stored xhr
      var xhr = Parsley._remoteCache[csr] = Parsley._remoteCache[csr] || $.ajax(ajaxOptions);

      var handleXhr = function handleXhr() {
        var result = Parsley.asyncValidators[validator].fn.call(instance, xhr, url, options);
        if (!result) // Map falsy results to rejected promise
          result = $.Deferred().reject();
        return $.when(result);
      };

      return xhr.then(handleXhr, handleXhr);
    },

    priority: -1
  });

  Parsley.on('form:submit', function () {
    Parsley._remoteCache = {};
  });

  window.ParsleyExtend.addAsyncValidator = function () {
    ParsleyUtils.warnOnce('Accessing the method `addAsyncValidator` through an instance is deprecated. Simply call `Parsley.addAsyncValidator(...)`');
    return Parsley.apply(Parsley.addAsyncValidator, arguments);
  };

  // This is bundled with the Parsley library
  Parsley.addMessages('en', {
    defaultMessage: "This value seems to be invalid.",
    type: {
      email: "This value should be a valid email.",
      url: "This value should be a valid url.",
      number: "This value should be a valid number.",
      integer: "This value should be a valid integer.",
      digits: "This value should be digits.",
      alphanum: "This value should be alphanumeric."
    },
    notblank: "This value should not be blank.",
    required: "This value is required.",
    pattern: "This value seems to be invalid.",
    min: "This value should be greater than or equal to %s.",
    max: "This value should be lower than or equal to %s.",
    range: "This value should be between %s and %s.",
    minlength: "This value is too short. It should have %s characters or more.",
    maxlength: "This value is too long. It should have %s characters or fewer.",
    length: "This value length is invalid. It should be between %s and %s characters long.",
    mincheck: "You must select at least %s choices.",
    maxcheck: "You must select %s choices or fewer.",
    check: "You must select between %s and %s choices.",
    equalto: "This value should be the same."
  });

  Parsley.setLocale('en');

  var parsley = Parsley;

  return parsley;
});
//# sourceMappingURL=parsley.js.map

// ParsleyConfig definition if not already set
window.ParsleyConfig = window.ParsleyConfig || {};
window.ParsleyConfig.i18n = window.ParsleyConfig.i18n || {};

// Define then the messages
window.ParsleyConfig.i18n.en = $.extend(window.ParsleyConfig.i18n.en || {}, {
  defaultMessage: "This value seems to be invalid.",
  type: {
    email:        "This value should be a valid email.",
    url:          "This value should be a valid url.",
    number:       "This value should be a valid number.",
    integer:      "This value should be a valid integer.",
    digits:       "This value should be digits.",
    alphanum:     "This value should be alphanumeric."
  },
  notblank:       "This value should not be blank.",
  required:       "This value is required.",
  pattern:        "This value seems to be invalid.",
  min:            "This value should be greater than or equal to %s.",
  max:            "This value should be lower than or equal to %s.",
  range:          "This value should be between %s and %s.",
  minlength:      "This value is too short. It should have %s characters or more.",
  maxlength:      "This value is too long. It should have %s characters or fewer.",
  length:         "This value length is invalid. It should be between %s and %s characters long.",
  mincheck:       "You must select at least %s choices.",
  maxcheck:       "You must select %s choices or fewer.",
  check:          "You must select between %s and %s choices.",
  equalto:        "This value should be the same."
});

// If file is loaded after Parsley main file, auto-load locale
if ('undefined' !== typeof window.Parsley) {
  window.Parsley.addCatalog('en', window.ParsleyConfig.i18n.en, true);
}

/**
 * @fileOverview jQuery.autosave
 *
 * @author Kyle Florence
 * @website https://github.com/kflorence/jquery-autosave
 * @version 1.2.1
 *
 * Inspired by the jQuery.autosave plugin written by Raymond Julin,
 * Mads Erik Forberg and Simen Graaten.
 *
 * Dual licensed under the MIT and BSD Licenses.
 */
(function(e,d,a,g){var f=(function(){var h=a.createElement("input");if("oninput" in h){return true}h.setAttribute("oninput","return;");return typeof h.oninput==="function"}());var b=function(k,i){var h={options:{}},j=typeof k;if(j==="function"){h.method=k}else{if(j==="string"&&i[k]){h.method=i[k].method}else{if(j==="object"){j=typeof k.method;if(j==="function"){h.method=k.method}else{if(j==="string"&&i[k.method]){h.method=i[k.method].method;h.options=e.extend(true,h.options,i[k.method].options,k.options)}}}}}return h};e.autosave={timer:0,$queues:e({}),states:{changed:"changed",modified:"modified"},options:{namespace:"autosave",callbacks:{trigger:"change",scope:null,data:"serialize",condition:null,save:"ajax"},events:{save:"save",saved:"saved",changed:"changed",modified:"modified"}},initialize:function(l,i){var h=this;this.$elements=l;this.options=e.extend(true,{},this.options,i);if(this.elements().length){var k,n=this.forms(),j=this.inputs();n.data(this.options.namespace,this);e.each(this.options.events,function(p,o){h.options.events[p]=[o,h.options.namespace].join(".")});e.each(this.options.callbacks,function(o,p){k=[];if(p){e.each(e.isArray(p)?p:[p],function(q,r){r=b(r,h.callbacks[o]);if(e.isFunction(r.method)){k.push(r)}})}h.options.callbacks[o]=k});n.bind([this.options.events.save,this.options.namespace].join("."),function(p,o){h.save(o,p.type)});j.bind(["change",this.options.namespace].join("."),function(o){e(this).data([h.options.namespace,h.states.changed].join("."),true);e(this.form).triggerHandler(h.options.events.changed,[this])});var m=f?"input":"keyup";j.bind([m,this.options.namespace].join("."),function(o){e(this).data([h.options.namespace,h.states.modified].join("."),true);e(this.form).triggerHandler(h.options.events.modified,[this])});e.each(this.options.callbacks.trigger,function(p,o){o.method.call(h,o.options)})}return l},elements:function(h){if(!h){h=this.$elements}return e(h).filter(function(){return(this.elements||this.form)})},forms:function(h){return e(e.unique(this.elements(h).map(function(){return this.elements?this:this.form}).get()))},inputs:function(h){return this.elements(h).map(function(){return this.elements?e.makeArray(e(this).find(":input")):this})},validInputs:function(h){return this.inputs(h)},changedInputs:function(h){var i=this;return this.inputs(h).filter(function(){return e(this).data([i.options.namespace,i.states.changed].join("."))})},modifiedInputs:function(h){var i=this;return this.inputs(h).filter(function(){return e(this).data([i.options.namespace,i.states.modified].join("."))})},startInterval:function(i){var h=this;i=i||this.interval;if(this.timer){this.stopInterval()}if(!isNaN(parseInt(i))){this.timer=setTimeout(function(){h.save(false,h.timer)},i)}},stopInterval:function(){clearTimeout(this.timer);this.timer=null},save:function(h,j){var i=this,m=false,k=this.validInputs(h);if(this.options.callbacks.save.length){e.each(this.options.callbacks.scope,function(o,p){k=p.method.call(i,p.options,k)});if(k.length){var n,l=true;e.each(this.options.callbacks.data,function(o,p){n=p.method.call(i,p.options,k,n)});e.each(this.options.callbacks.condition,function(o,p){return(l=p.method.call(i,p.options,k,n,j))!==false});if(l){e.each(this.options.callbacks.save,function(o,p){i.$queues.queue("save",function(){if(p.method.call(i,p.options,n)===false){i.resetFields()}else{i.next("save",true)}})});m=true}}}this.next("save",m)},next:function(j,i){var h=this.$queues.queue(j);if(h&&h.length){this.$queues.dequeue(j)}else{this.finished(h,j,i)}},resetFields:function(){this.inputs().data([this.options.namespace,this.states.changed].join("."),false);this.inputs().data([this.options.namespace,this.states.modified].join("."),false)},finished:function(h,j,i){if(j==="save"){if(h){this.forms().triggerHandler(this.options.events.saved)}if(i){this.resetFields()}if(this.timer){this.startInterval()}}}};var c=e.autosave.callbacks={};e.each(e.autosave.options.callbacks,function(h){c[h]={}});e.extend(c.trigger,{change:{method:function(){var h=this;this.forms().bind([this.options.events.changed,this.options.namespace].join("."),function(j,i){h.save(i,j.type)})}},modify:{method:function(){var h=this;this.forms().bind([this.options.events.modified,this.options.namespace].join("."),function(j,i){h.save(i,j.type)})}},interval:{method:function(h){if(!isNaN(parseInt(h.interval))){this.startInterval(this.interval=h.interval)}},options:{interval:30000}}});e.extend(c.scope,{all:{method:function(){return this.validInputs()}},changed:{method:function(){return this.changedInputs()}},modified:{method:function(){return this.modifiedInputs()}}});e.extend(c.data,{serialize:{method:function(h,i){return i.serialize()}},serializeArray:{method:function(h,i){return i.serializeArray()}},serializeObject:{method:function(h,i){var j={};e.each(i.serializeArray(),function(l,m){var p=m.name,k=m.value;j[p]=j[p]===g?k:e.isArray(j[p])?j[p].concat(k):[j[p],k]});return j}}});e.extend(c.condition,{interval:{method:function(i,j,k,h){return(!this.timer||this.timer===h)}},changed:{method:function(){return this.changedInputs().length>0}},modified:{method:function(){return this.modifiedInputs().length>0}}});e.extend(c.save,{ajax:{method:function(j,l){var i=this,m=e.extend({},j);m.complete=function(o,n){if(e.isFunction(j.complete)){j.complete.apply(i,arguments)}i.next("save")};if(e.isFunction(m.data)){m.data=m.data.call(i,l)}var k=e.type(l),h=e.type(m.data);if(h=="undefined"){m.data=l}else{if(k==h){switch(k){case"array":m.data=e.merge(l,m.data);break;case"object":m.data=e.extend(l,m.data);break;case"string":m.data=l+(l.length?"&":"")+m.data;break}}else{throw"Cannot merge form data with options data, must be of same type."}}if(self.xhr&&'pending' === self.xhr.state()){self.xhr.abort()};self.xhr=e.ajax(m);return false},options:{url:d.location.href}}});e.fn.autosave=function(h){return e.extend({},e.autosave).initialize(this,h)}})(jQuery,window,document);

(function ($, Parsley, ParsleyUI, document) {
    'use strict';

    function nlToBr(str, isXhtml) {
        var breakTag = '<br>',
            input = String(str);

        if (isXhtml || isXhtml === undefined) {
            breakTag = '<br />';
        }

        return input.replace(
            /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
            '$1' + breakTag + '$2'
        );
    }

    function clearErrors(field) {
        var errorsWrapper = field._ui.$errorsWrapper,
            errorsWrapperChildren = errorsWrapper.children();

        errorsWrapper.removeClass('filled');
        errorsWrapperChildren.remove();

        field._ui.$errorClassHandler.removeClass(field.options.errorClass);
        field._ui.lastValidationResult = [];
        field._ui.validationInformationVisible = false;
    }

    function updateData(dataField, field, val) {
        clearErrors(dataField);

        if (field.$element.attr('id') !== dataField.$element.attr('id')) {
            return;
        }

        if (dataField.$element.attr('type') === 'checkbox') {
            dataField.$element.prop('checked', val);
            dataField.$element.trigger('change');
            return;
        }

        dataField.$element.val(val);
        dataField.$element.trigger('change');
    }

    function updateErrors(field, errors) {
        clearErrors(field);

        //noinspection JSLint
        $.each(errors, function (key, error) {
            var cleanedError = nlToBr(error);
            ParsleyUI.addError(field, 'remote', cleanedError);
        });

        ParsleyUI.manageFailingFieldTrigger(field);
    }

    function setupNextAndPrev(form) {
        form.find('.btn-next').on('click', function () {
            $('.nav-tabs .active').next().find('a').tab('show');
            return false;
        });

        form.find('.btn-prev').on('click', function () {
            $('.nav-tabs .active').prev().find('a').tab('show');
            return false;
        });
    }
    function setupHelpPopovers(links, inputs) {
        links.popover({
            container: 'body',
            trigger: 'click',
            html: true
        });

        links.on('click', function () {
            return false;
        });

        inputs.on('focusin', function () {
            $(this).closest('.row').find('.popover-link').popover('show');
        });

        links.on('show.bs.popover', function () {
            links.not(this).popover('hide');
        });

        $('.nav-tabs a').on('hide.bs.tab', function () {
            links.popover('hide');
        });
    }

    /**
     * @param {Object} field
     *
     * @todo: clean, use recursive method
     */
    function updateDataAndErrors(field, xhr) {
        var json;

        clearErrors(field);

        if (xhr === undefined || xhr.responseText === undefined) {
            return;
        }

        json = $.parseJSON(xhr.responseText);

        $.each(json.data, function (key, val) {
            if (val === Object(val)) {
                $.each(val, function (key2, val2) {
                    var dataField = $('#subscription_' + key + '_' + key2).parsley();
                    updateData(dataField, field, val2);
                });
            } else {
                var dataField = $('#subscription_' + key).parsley();
                updateData(dataField, field, val);
            }
        });

        $.each(json.errors, function (key, val) {
            if ($.isArray(val)) {
                var errorField = $('#subscription_' + key).parsley();
                updateErrors(errorField, val);
            } else {
                $.each(val, function (key2, val2) {
                    var errorFieldNested = $('#subscription_' + key + '_' + key2).parsley();
                    updateErrors(errorFieldNested, val2);
                });
            }
        });
    }

    function setupActiveTabHistory() {
        if (location.hash.substr(0, 2) === '#!') {
            $('a[href="#' + location.hash.substr(2) + '"]').tab('show');
        }

        // Remember the hash in the URL without jumping
        $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            var hash = $(e.target).attr('href');
            if (hash.substr(0, 1) === '#') {
                location.replace('#!' + hash.substr(1));
            }
        });
    }

    function setupLocking(form, inputs) {
        //noinspection MagicNumberJS
        setInterval(
            function () {
                var lockReq = $.get(form.data('lock'));

                lockReq.done(function () {
                    inputs.not('.disabled').prop('disabled', false);
                    form.find('button').prop('disabled', false);
                    $('.lock-warning').hide();
                });

                lockReq.fail(function () {
                    inputs.prop('disabled', true);
                    form.find('button').prop('disabled', true);
                    $('.lock-warning').show();
                });
            },
            10000
        );
    }

    function setupAttributeCheckboxes() {
        $('#attributes').find(':checkbox').on('change', function () {
            var checkbox = $(this),
                textarea = checkbox.closest('.form-group').find('textarea');

            if (checkbox.is(':checked')) {
                textarea.prop('disabled', false);
                textarea.prop('required', true);
            } else {
                textarea.prop('disabled', true);
                textarea.prop('required', false);
            }
        });
    }

    function showDoneSaving() {
        $('#status-progress').addClass('hidden');
        $('#status-done').removeClass('hidden');
    }

    function showBusySaving() {
        $('#status-done').addClass('hidden');
        $('#status-progress').removeClass('hidden');
    }

    //noinspection JSLint
    function save(form, formData) {
        /*jshint validthis:true */
        var self = this;

        $.ajax({
            url: form.data('save'),
            data: formData,
            type: 'POST',
            beforeSend: showBusySaving,
            complete: function () {
                showDoneSaving();

                self.next('save');
            }
        });

        return false;
    }

    function setupAutoSaving(form) {
        if (!form.hasClass('autosave')) {
            return;
        }

        form.autosave({
            callbacks: {
                trigger: ['modify', 'change'],
                scope: 'all',
                save: $.debounce(500, function() {
                    save.bind(this)(form, arguments[1]);
                })
            }
        });
    }

    // A custom validator to check whether the adm. and tech. contact are not the same
    function setupUniqueContacts() {
        var validatorPriority = 32,
            validator = Parsley.addValidator(
                'contactunique',
                function () {
                    var adminEl = $('#subscription_administrativeContact_email'),
                        techEl = $('#subscription_technicalContact_email');

                    adminEl.nextAll('ul.help-block').remove();
                    techEl.nextAll('ul.help-block').remove();

                    return adminEl.val().trim() !== techEl.val().trim();
                },
                validatorPriority
            );
        validator.addMessage('en', 'contactunique', 'The technical contact should be different from the administrative contact.')
        validator.addMessage('nl', 'contactunique', 'Het technisch contactpersoon moet verschillen van het administratief contactpersoon.');
    }

    function preventFormOnEnterSubmit(form) {
        form.find('input, select').on('keypress', function (event) {
            //noinspection MagicNumberJS
            if (event.which !== 13) {
                return;
            }

            event.preventDefault();
        });
    }

    /**
     *
     * @param form
     * @todo double, help text
     */
    function setupValidation(form) {
        Parsley.on('field:init', function (field) {
            field.$element.closest('.form-group').addClass('has-feedback');
        });
        Parsley.on('form:validate', function () {
            $('#status-validating').removeClass('hidden');
        });
        Parsley.on('form:validated', function (form) {
            if (form.validationResult !== true) {
                var tabId = form.$element.find('.has-error').first().closest('.tab-pane').attr('id');
                $('.nav-tabs a[href="#' + tabId + '"]').tab('show');
            }
        });
        Parsley.on('field:validate', function (field) {
            field.reset();
            field.$element.next('i').remove();
            field.$element.after('<i class="form-control-feedback fa fa-cog fa-spin"></i>');
        });
        Parsley.on('field:success', function (field) {
            field.$element.next('i').remove();
            if (field.validationResult === true) {
                field.$element.after('<i class="form-control-feedback fa fa-check"></i>');
            }
        });
        Parsley.on('field:error', function (field) {
            field.$element.next('i').remove();
            field.$element.after('<i class="form-control-feedback fa fa-remove"></i>');
        });

        form.parsley({
            trigger: 'input',
            errorClass: 'has-error',
            successClass: 'has-success',
            classHandler: function (field) {
                return field.$element.closest('.form-group');
            },
            errorsWrapper: '<ul class="help-block"></ul>'
        });
    }

    function preventMetadataUrlCaching() {
        var metadataUrlParsley = $('#subscription_metadataUrl').parsley();
        metadataUrlParsley.on('parsley:field:validate', function (field) {
            field.$element.attr('data-parsley-remote-options', '{ "type": "POST", "ts": ' + Date.now() + ' }');
            field.actualizeOptions();
        });
        metadataUrlParsley.on('field:ajaxoptions', function (field, options) {
            var name = 'subscription[requestedState]';
            options.data[name] = $('input[name="' + name + '"]').val();
        });
    }

    function showExternalErrorMessages(form) {
        form.find(':input[data-parsley-remote]').each(function () {
            var field = $(this).parsley();

            $(this).attr('data-parsley-remote-options', '{ "type": "POST" }');
            $(this).attr('data-parsley-errors-messages-disabled', 1);
            field.actualizeOptions();

            Parsley.addAsyncValidator('default', function (xhr) {
                updateDataAndErrors(field, xhr);

                return !this._ui.$errorsWrapper.hasClass('filled');
            }, $(this).data('parsley-remote'));
        });
    }

    function hideSpinnerOnAjaxComplete() {
        $(document).ajaxComplete(function () {
            $('#status-validating,.fa-spin').addClass('hidden');
        });
    }

    function setupFillRequestedState() {
        $('button[type=submit]').on('click', function () {
            $('#subscription_requestedState').val(
                $(this).attr('data-requestedState')
            );
        });
    }

    function autoUpdateLogo() {
        setInterval(function() {
            var logoUrlEl = $('#subscription_logoUrl'),
                previewEl = $('#subscription_logoUrl_preview');

            if (logoUrlEl.val().trim() === '') {
                previewEl.hide();
            }
            else {
                previewEl.attr("src", logoUrlEl.val());
                previewEl.show();
            }
        }, 500);
    }

    function setupUrlValidation() {
        $('input.url-validated').on('change', function() {
            var inputEl = this;

            $.ajax({
                type: "POST",
                url: window.location.pathname + '/validate-url',
                data: {
                    "url": $(this).val(),
                    "subscription": {
                        "token": $('#subscription__token').val()
                    }
                },
                success: function (data) {
                    if (!data.validation) {
                        return;
                    }

                    updateErrors(
                        $(inputEl).parsley(),
                        data
                    );
                },
                dataType: 'json'
            });
        });
    }

    $(function () {
        var form = $('#form'),
            inputs = form.find('input, select, textarea'),
            links = form.find('.popover-link');

        setupValidation(form);
        setupFillRequestedState(form);
        showExternalErrorMessages(form);
        setupUniqueContacts();
        setupUrlValidation();

        preventFormOnEnterSubmit(form);
        preventMetadataUrlCaching();
        hideSpinnerOnAjaxComplete();

        setupNextAndPrev(form);
        setupActiveTabHistory();
        setupHelpPopovers(links, inputs);
        setupAttributeCheckboxes();

        setupAutoSaving(form);
        setupLocking(form, inputs);

        autoUpdateLogo();
    });
}(window.jQuery, window.Parsley, window.ParsleyUI, window.document));
