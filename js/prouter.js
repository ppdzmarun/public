// Generated by CoffeeScript 1.7.1
(function() {
  var PRouter, queryRules, root, rules, _hasPushState;
  root = this;
  PRouter = root.PRouter = {};
  rules = PRouter.rules = {};
  queryRules = PRouter.queryRules = {};
  _hasPushState = !!(this.history && this.history.pushState);
  PRouter.lastPath = {
    key: '',
    value: ''
  };
  PRouter.lastQuery = {};
  PRouter.start = function() {
    setTimeout(function() {
      return root.addEventListener('popstate', function(event) {
        return PRouter._checkURL();
      }, false);
    }, 0);
    return PRouter._checkURL();
  };
  PRouter.route = function(route, callback, event) {
    var pattern;
    pattern = this._getPattern(route);
    if (!rules[pattern]) {
      rules[pattern] = [];
    }
    return rules[pattern].push({
      fn: callback,
      event: event || 'change'
    });
  };
  PRouter.queryRoute = function(key, callback, event) {
    if (!queryRules[key]) {
      queryRules[key] = [];
    }
    return queryRules[key].push({
      fn: callback,
      event: event || 'change'
    });
  };
  PRouter.bindForTag = function(tagName) {
    var hrefOpt, i, items, tag, _i, _ref, _results;
    tag = tagName || 'a';
    items = document.getElementsByTagName(tag);
    _results = [];
    for (i = _i = 0, _ref = items.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      hrefOpt = items[i].getAttribute('href-opt');
      if (hrefOpt) {
        _results.push(items[i].onclick = function(event) {
          PRouter[this.getAttribute('href-opt')](this.href);
          return event.preventDefault();
        });
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };
  PRouter.push = function(url, checkURL) {
    var config;
    config = {
      back: location.href
    };
    checkURL = checkURL || true;
    if (_hasPushState) {
      root.history.pushState(config, document.title, url);
      if (checkURL) {
        return PRouter._checkURL();
      }
    } else {
      return location.href = url;
    }
  };
  PRouter.replace = function(url, checkURL) {
    var config;
    config = {
      back: location.href
    };
    checkURL = checkURL || true;
    if (_hasPushState) {
      root.history.replaceState(config, document.title, url);
      if (checkURL) {
        return PRouter._checkURL();
      }
    } else {
      return location.href = url;
    }
  };
  PRouter._checkURL = function(url) {
    var args, i, key, pattern, query, regexp, _i, _j, _ref, _ref1;
    url = url || location.pathname || '';
    regexp = new RegExp;
    for (pattern in rules) {
      regexp.compile(pattern);
      args = url.match(regexp);
      if (args) {
        for (i = _i = 0, _ref = rules[pattern].length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          if (PRouter._checkPathEvent(rules[pattern][i].event, {
            key: pattern,
            value: args.toString()
          })) {
            rules[pattern][i].fn.apply(this, args.slice(1));
          }
        }
        PRouter.lastPath = {
          key: pattern,
          value: args.toString()
        };
        break;
      }
    }
    query = PRouter._splitQuery();
    for (key in query) {
      if (typeof PRouter.queryRules[key] !== 'undefined') {
        for (i = _j = 0, _ref1 = PRouter.queryRules[key].length - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
          if (PRouter._checkQueryEvent(PRouter.queryRules[key][i].event, query)) {
            PRouter.queryRules[key][i].fn.apply(this, [query[key]]);
          }
        }
      }
    }
    return PRouter.lastQuery = query;
  };
  PRouter._getPattern = function(route) {
    var escapeRegExp, namedParam, optionalParam, pattern, splatParam;
    optionalParam = /\((.*?)\)/g;
    namedParam = /(\(\?)?:\w+/g;
    splatParam = /\*\w+/g;
    escapeRegExp = /[\-{}\[\]+?.,\\\^$|#\s]/g;
    pattern = route.replace(escapeRegExp, '\\$&').replace(optionalParam, '(?:$1)?').replace(namedParam, function(match, optional) {
      if (optional) {
        return match;
      } else {
        return '([^/?]+)';
      }
    }).replace(splatParam, '([^?]*?)');
    return '^' + pattern + '(?:\\?([\\s\\S]*))?$';
  };
  PRouter._checkPathEvent = function(event, currentPath) {
    switch (event) {
      case 'show':
        return true;
      default:
        if (PRouter.lastPath.value !== currentPath.value) {
          return true;
        }
        return false;
    }
  };
  PRouter._checkQueryEvent = function(event, currentQuery) {
    var key;
    for (key in currentQuery) {
      switch (event) {
        case 'show':
          return true;
        default:
          if (PRouter.lastQuery[key] !== currentQuery[key]) {
            return true;
          }
          return false;
      }
    }
  };
  return PRouter._splitQuery = function(query) {
    var i, queryObj, queryStr, queryStrArray, _i, _ref;
    queryStr = query || location.search.substr(1);
    queryStrArray = queryStr.split('&');
    queryObj = {};
    for (i = _i = 0, _ref = queryStrArray.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      queryObj[queryStrArray[i].split('=')[0]] = queryStrArray[i].split('=')[1];
    }
    return queryObj;
  };
})();
