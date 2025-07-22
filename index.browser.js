var LifeCSS = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ../index.js
  var index_exports = {};
  __export(index_exports, {
    default: () => index_default
  });

  // ../typeofanything.js
  var { IS, maybe, $Wrap, xProxy, isNothing } = TOAFactory();
  function TOAFactory() {
    Symbol.proxy = Symbol.for(`toa.proxy`);
    Symbol.is = Symbol.for(`toa.is`);
    Symbol.type = Symbol.for(`toa.type`);
    Symbol.isSymbol = Symbol.for(`toa.isASymbol`);
    addSymbols2Anything();
    const maybe2 = maybeFactory();
    const [$Wrap2, xProxy2] = [WrapAnyFactory(), setProxyFactory()];
    xProxy2.custom();
    return { IS: IS2, maybe: maybe2, $Wrap: $Wrap2, isNothing: isNothing2, xProxy: xProxy2 };
    function IS2(anything, ...shouldBe) {
      if (maybe2({ trial: (_) => `isTypes` in (shouldBe?.[0] ?? {}) })) {
        const isTypeObj = shouldBe[0];
        return `defaultValue` in isTypeObj ? isOrDefault(anything, isTypeObj) : `notTypes` in isTypeObj ? isExcept(anything, isTypeObj) : IS2(anything, ...[isTypeObj.isTypes].flat());
      }
      const input = typeof anything === `symbol` ? Symbol.isSymbol : anything;
      return shouldBe.length > 1 ? ISOneOf(input, ...shouldBe) : determineType(anything, ...shouldBe);
    }
    function typeOf(anything) {
      return anything?.[Symbol.proxy] ?? IS2(anything);
    }
    function determineType(input, ...shouldBe) {
      let {
        noInput,
        noShouldbe,
        compareTo,
        inputCTOR,
        isNaN,
        isInfinity,
        shouldBeFirstElementIsNothing
      } = processInput(input, ...shouldBe);
      shouldBe = shouldBe.length && shouldBe[0];
      switch (true) {
        case shouldBeFirstElementIsNothing:
          return String(input) === String(compareTo);
        case (input?.[Symbol.proxy] && noShouldbe):
          return input[Symbol.proxy];
        case isNaN:
          return noShouldbe ? `NaN` : maybe2({ trial: (_) => String(compareTo) }) === String(input);
        case isInfinity:
          return noShouldbe ? `Infinity` : maybe2({ trial: (_) => String(compareTo) }) === String(input);
        case noInput:
          return noShouldbe ? String(input) : String(compareTo) === String(input);
        case inputCTOR === Boolean:
          return !shouldBe ? `Boolean` : inputCTOR === shouldBe;
        default:
          return getResult(input, shouldBe, noShouldbe, getMe(input, inputCTOR));
      }
    }
    function getMe(input, inputCTOR) {
      return input === 0 ? Number : input === `` ? String : !input ? { name: String(input) } : inputCTOR;
    }
    function processInput(input, ...shouldBe) {
      const noShouldbe = shouldBe.length < 1;
      const compareTo = !noShouldbe && shouldBe[0];
      const shouldBeFirstElementIsNothing = !noShouldbe && isNothing2(shouldBe[0]);
      const noInput = input === void 0 || input === null;
      const inputCTOR = !noInput && Object.getPrototypeOf(input)?.constructor;
      const isNaN = Number.isNaN(input);
      const isInfinity = maybe2({ trial: (_) => String(input) }) === `Infinity`;
      return { noInput, noShouldbe, compareTo, inputCTOR, isNaN, isInfinity, shouldBeFirstElementIsNothing };
    }
    function getResult(input, compareWith, noShouldbe, me) {
      switch (true) {
        case (!noShouldbe && compareWith === input || input?.[Symbol.proxy] && compareWith === Proxy):
          return true;
        case maybe2({ trial: (_) => String(compareWith) }) === `NaN`:
          return String(input) === `NaN`;
        case (input?.[Symbol.toStringTag] && IS2(compareWith, String)):
          return String(compareWith) === input[Symbol.toStringTag];
        default:
          return compareWith ? maybe2({ trial: (_) => input instanceof compareWith }) || compareWith === me || compareWith === Object.getPrototypeOf(me) || `${compareWith?.name}` === me?.name : input?.[Symbol.toStringTag] && `[object ${input?.[Symbol.toStringTag]}]` || me?.name || String(me);
      }
    }
    function ISOneOf(obj, ...params) {
      return params.some((param) => IS2(obj, param));
    }
    function isNothing2(maybeNothing, all = false) {
      let nada = maybeNothing === null || maybeNothing === void 0;
      nada = all ? nada || IS2(maybeNothing, Infinity) || IS2(maybeNothing, NaN) : nada;
      return nada;
    }
    function maybeFactory() {
      const tryFn = (maybeFn, maybeError) => maybeFn?.constructor === Function ? maybeFn(maybeError) : void 0;
      return function({ trial, whenError = () => void 0 } = {}) {
        try {
          return tryFn(trial);
        } catch (err) {
          return tryFn(whenError, err);
        }
      };
    }
    function WrapAnyFactory() {
      return function(someObj) {
        return Object.freeze({
          get value() {
            return someObj;
          },
          get [Symbol.type]() {
            return typeOf(someObj);
          },
          get type() {
            return typeOf(someObj);
          },
          [Symbol.is](...args) {
            return IS2(someObj, ...args);
          },
          is(...args) {
            return IS2(someObj, ...args);
          }
        });
      };
    }
    function isOrDefault(input, { defaultValue, isTypes = [void 0], notTypes } = {}) {
      isTypes = isTypes?.constructor !== Array ? [isTypes] : isTypes;
      notTypes = notTypes && notTypes?.constructor !== Array ? [notTypes] : [];
      return notTypes.length < 1 ? IS2(input, ...isTypes) ? input : defaultValue : isExcept(input, { isTypes, notTypes }) ? input : defaultValue;
    }
    function isExcept(input, { isTypes = [void 0], notTypes = [void 0] } = {}) {
      isTypes = isTypes?.constructor !== Array ? [isTypes] : isTypes;
      notTypes = notTypes?.constructor !== Array ? [notTypes] : notTypes;
      return IS2(input, ...isTypes) && !IS2(input, ...notTypes);
    }
    function addSymbols2Anything() {
      if (!Object.getOwnPropertyDescriptors(Object.prototype)[Symbol.is]) {
        Object.defineProperties(Object.prototype, {
          [Symbol.type]: { get() {
            return typeOf(this);
          }, enumerable: false, configurable: false },
          [Symbol.is]: { value: function(...args) {
            return IS2(this, ...args);
          }, enumerable: false, configurable: false }
        });
        Object.defineProperties(Object, {
          [Symbol.type]: { value(obj) {
            return typeOf(obj);
          }, enumerable: false, configurable: false },
          [Symbol.is]: { value: function(obj, ...args) {
            return IS2(obj, ...args);
          }, enumerable: false, configurable: false }
        });
      }
    }
    function ctor2String(obj) {
      const str = String(Object.getPrototypeOf(obj)?.constructor);
      return str.slice(str.indexOf(`ion`) + 3, str.indexOf(`(`)).trim();
    }
    function modifySetter(setterMethod2Modify) {
      const oldSetter = setterMethod2Modify.set;
      setterMethod2Modify.set = (target, key, value) => {
        if (key === Symbol.proxy) {
          return target[key] = value;
        }
        return oldSetter(target, key, value);
      };
      return setterMethod2Modify;
    }
    function setProxyFactory() {
      const nativeProxy = Proxy;
      return {
        native() {
          Proxy = nativeProxy;
        },
        custom() {
          Proxy = new nativeProxy(nativeProxy, {
            construct(target, args) {
              for (let item of args) {
                if (item.set) {
                  item = modifySetter(item);
                }
              }
              const wrappedProxy = new target(...args);
              wrappedProxy[Symbol.proxy] = `Proxy (${ctor2String(args[0])})`;
              return wrappedProxy;
            }
          });
        }
      };
    }
  }

  // ../index.js
  var index_default = LifeStyleFactory;
  function LifeStyleFactory({ styleSheet, createWithId } = {}) {
    const {
      tryParseAtOrNestedRules,
      ruleExists,
      checkParams,
      sheet,
      removeRules,
      consider,
      currentSheetID
    } = sheetHelpers({ styleSheet, createWithId });
    function setRules4Selector(rule, properties) {
      if (rule && properties.removeProperties) {
        Object.keys(properties.removeProperties).forEach((prop) => rule.style.removeProperty(toDashedNotation(prop)));
        return;
      }
      Object.entries(properties).forEach(([prop, value]) => {
        prop = toDashedNotation(prop.trim());
        value = value.trim();
        let priority;
        if (/!important/.test(value)) {
          value = value.slice(0, value.indexOf(`!important`)).trim();
          priority = `important`;
        }
        if (!CSS.supports(prop, value)) {
          return console.error(`StylingFactory ${currentSheetID} error: '${prop}' with value '${value}' not supported (yet)`);
        }
        tryAndCatch(
          () => rule.style.setProperty(prop, value, priority),
          `StylingFactory ${currentSheetID} (setRule4Selector) failed`
        );
      });
    }
    function setRules(selector, styleRules, sheetOrMediaRules = sheet) {
      selector = selector?.trim?.();
      if (!IS(selector, String) || !selector.length || /[;,]$/g.test(selector)) {
        return console.error(`StylingFactory ${currentSheetID} (setRules): [${selector || `[no selector given]`}] is not a valid selector`);
      }
      if (styleRules.removeRule) {
        return removeRules(selector);
      }
      const exists = ruleExists(selector, true);
      const rule4Selector = exists || sheetOrMediaRules.cssRules[sheetOrMediaRules.insertRule(`${selector} {}`, sheetOrMediaRules.cssRules.length || 0)];
      return consider(() => setRules4Selector(rule4Selector, styleRules), selector, exists);
    }
    function doParse(cssDeclarationString) {
      const rule = cssDeclarationString.trim().split(/{/, 2);
      const selector = rule.shift().trim();
      if (!IS(selector, String) || !selector?.trim()?.length) {
        return console.error(`StylingFactory ${currentSheetID} (doParse): no (valid) selector could be extracted from rule ${shortenRule(cssDeclarationString)}`);
      }
      const cssRules = cssRuleFromText(rule.shift());
      return tryAndCatch(() => setRules(selector, cssRules), `StylingFactory ${currentSheetID} (setRules) failed`);
    }
    function styleFromString(cssDeclarationString) {
      const checkAts = tryParseAtOrNestedRules(cssDeclarationString);
      return checkAts.done ? checkAts.existing : doParse(cssDeclarationString);
    }
    function styleFromObject(selector, rulesObj) {
      if (selector.trim().startsWith(`@media`)) {
        return styleFromString(atMedia2String(selector, rulesObj));
      }
      return setRules(selector, rulesObj);
    }
    return function(cssBlockOrSelector, rulesObj = {}) {
      const checksOk = checkParams(cssBlockOrSelector, rulesObj);
      return checksOk && (Object.keys(rulesObj).length ? styleFromObject(cssBlockOrSelector, rulesObj) : styleFromString(cssBlockOrSelector));
    };
  }
  function sheetHelpers({ styleSheet, createWithId }) {
    const notification = `Note: The rule or some of its properties may not be supported by your browser (yet)`;
    const currentSheetID = `for style#${createWithId}`;
    styleSheet = createWithId ? retrieveOrCreateSheet(createWithId) : styleSheet;
    function retrieveOrCreateSheet(id) {
      const existingSheet = document.querySelector(`#${id}`)?.sheet;
      if (existingSheet) {
        return existingSheet;
      }
      const newSheet = Object.assign(document.createElement(`style`), { id });
      document.head.insertAdjacentElement(`beforeend`, newSheet);
      return newSheet.sheet;
    }
    function notSupported(rule) {
      console.error(`StylingFactory ${currentSheetID} [rule: ${rule}]
    => @charset, @namespace and @import are not supported here`);
      return { done: true };
    }
    function ruleExists(ruleFragOrSelector, isSelector) {
      return [...styleSheet.rules].find((r) => isSelector ? compareSelectors(r.selectorText || ``, ruleFragOrSelector) : createRE`${escape4RegExp(ruleFragOrSelector)}${[...`gim`]}`.test(r.cssText));
    }
    function tryParseAtOrNestedRules(cssDeclarationString) {
      if (/^@charset|@import|namespace/i.test(cssDeclarationString.trim())) {
        return notSupported(cssDeclarationString);
      }
      if (cssDeclarationString.match(/}/g)?.length > 1) {
        return { existing: tryParse(cssDeclarationString, 1), done: true };
      }
      return { done: false };
    }
    function removeRules(selector) {
      const rulesAt = [...styleSheet.cssRules].reduce((acc, v, i) => compareSelectors(v.selectorText || ``, selector) && acc.concat(i) || acc, []);
      const len = rulesAt.length;
      rulesAt.forEach((idx) => styleSheet.deleteRule(idx));
      return len > 0 ? console.info(`\u2714 Removed ${len} instance${len > 1 ? `s` : ``} of selector ${selector} from ${currentSheetID.slice(4)}`) : console.info(`\u2714 Remove rule: selector ${selector} does not exist in ${currentSheetID.slice(4)}`);
    }
    function checkParams(cssBlockOrSelector, rulesObj) {
      return cssBlockOrSelector && IS(cssBlockOrSelector, String) && cssBlockOrSelector.trim().length > 0 && IS(rulesObj, Object) || (console.error(`StylingFactory ${currentSheetID} called with invalid parameters`), false);
    }
    function tryParse(cssDeclarationString) {
      cssDeclarationString = cssDeclarationString.trim();
      const rule = cssDeclarationString.slice(0, cssDeclarationString.indexOf(`{`)).trim();
      const exists = !!ruleExists(rule);
      try {
        return styleSheet.insertRule(`${cssDeclarationString}`, styleSheet.cssRules.length), exists;
      } catch (err) {
        return console.error(`StylingFactory ${currentSheetID} (tryParse) ${err.name} Error:
${err.message}
Rule: ${shortenRule(cssDeclarationString)}
${notification}`), exists;
      }
    }
    function consider(fn, rule, existing) {
      try {
        return fn(), existing;
      } catch (err) {
        return console.error(`StylingFactory ${currentSheetID} (tryAddOrModify) ${err.name} Error:
${err.message}
Rule: ${shortenRule(rule)}
${notification}`), existing;
      }
    }
    return {
      sheet: styleSheet,
      removeRules,
      tryParseAtOrNestedRules,
      ruleExists,
      checkParams,
      tryParse,
      consider,
      currentSheetID
    };
  }
  function atMedia2String(selector, rulesObj) {
    return `${selector.trim()} ${Object.entries(rulesObj).map(([selectr, rule]) => `${selectr}: { ${stringifyMediaRule(rule)}`)}`;
  }
  function shortenRule(rule) {
    const shortRule = (rule || `NO RULE`).trim().slice(0, 50).replace(/\n/g, `\\n`).replace(/\s{2,}/g, ` `);
    return rule.length > shortRule.length ? `${shortRule.trim()}...truncated` : shortRule;
  }
  function stringifyMediaRule(mediaObj) {
    return Object.entries(mediaObj).map(([key, value]) => `${key}: ${value.trim()}`).join(`;
`);
  }
  function escape4RegExp(str) {
    return str.replace(/([*\[\]()-+{}.$?\\])/g, (a) => `\\${a}`);
  }
  function createRE(regexStr, ...args) {
    const flags = args.length && Array.isArray(args.slice(-1)) ? args.pop().join(``) : ``;
    return new RegExp(
      (args.length && regexStr.raw.reduce((a, v, i) => a.concat(args[i - 1] || ``).concat(v), ``) || regexStr.raw.join(``)).split(`
`).map((line) => line.replace(/\s|\/\/.*$/g, ``).trim().replace(/(@s!)/g, ` `)).join(``),
      flags
    );
  }
  function toDashedNotation(str2Convert) {
    return str2Convert.replace(/[A-Z]/g, (a) => `-${a.toLowerCase()}`).replace(/[^--]^-|-$/, ``);
  }
  function tryAndCatch(fn, msg) {
    try {
      return fn();
    } catch (err) {
      console.error(`${msg || `an error occured`}: ${err.message}`);
    }
  }
  function prepareCssRuleFromText(rule) {
    return rule.replace(/\/\*.+?\*\//gm, ``).replace(/[}{\r\n]/g, ``).replace(/(data:.+?);/g, (_, b) => `${b}\\3b`).split(`;`).map((l) => l.trim()).join(`;
`).replaceAll(`\\3b`, `;`).split(`
`);
  }
  function toRuleObject(preparedRule) {
    return preparedRule.reduce((acc, v) => {
      const [key, value] = [
        v.slice(0, v.indexOf(`:`)).trim(),
        v.slice(v.indexOf(`:`) + 1).trim().replace(/;$|;.+(?=\/*).+\/$/, ``)
      ];
      return key && value ? { ...acc, [key]: value } : acc;
    }, {});
  }
  function cssRuleFromText(rule) {
    return toRuleObject(prepareCssRuleFromText(rule));
  }
  function compareSelectors(s1, s2) {
    return s1?.replace(`::`, `:`) === s2?.replace(`::`, `:`);
  }
  return __toCommonJS(index_exports);
})();
