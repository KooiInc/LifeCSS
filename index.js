export default LifeStyleFactory;

function LifeStyleFactory({styleSheet, createWithId} = {}) {
  const { cssRuleFromText, tryParseAtOrNestedRules, toDashedNotation, IS, shortenRule, consider, tryAndCatch,
    ruleExists, checkParams, atMedia2String, sheet, removeRules, currentSheet } = allHelpers({styleSheet, createWithId});
  
  const setRules4Selector = (rule, properties) => {
    if (rule && properties.removeProperties) {
      Object.keys(properties.removeProperties)
        .forEach( prop => rule.style.removeProperty(toDashedNotation(prop)) );
      return;
    }
    
    Object.entries(properties)
      .forEach( ([prop, value]) => {
        prop = toDashedNotation(prop.trim());
        value = value.trim();
        
        let priority;
        
        if (/!important/.test(value)) {
          value = value.slice(0, value.indexOf(`!important`)).trim();
          priority = `important`;
        }
        
        if (!CSS.supports(prop, value)) {
          return console.error(`StylingFactory ${currentSheet} error: '${
            prop}' with value '${value}' not supported (yet)`);
        }
        
        tryAndCatch( () => rule.style.setProperty(prop, value, priority),
          `StylingFactory ${currentSheet} (setRule4Selector) failed`);
      });
  }
  
  const setRules = (selector, styleRules, sheetOrMediaRules = sheet) => {
    if (!IS(selector, String) || !selector.trim().length || /[;,]$/g.test(selector.trim())) {
      return console.error(`StylingFactory ${currentSheet} (setRules): [${
        selector || `[no selector given]` }] is not a valid selector`);
    }
    
    if (styleRules.removeRule) {
      return removeRules(selector);
    }
    
    const exists = ruleExists(selector, true);
    const rule4Selector = exists
      || sheetOrMediaRules.cssRules[sheetOrMediaRules.insertRule(`${selector} {}`, sheetOrMediaRules.cssRules.length || 0)];
    
    return consider( () => setRules4Selector(rule4Selector, styleRules), selector, exists );
  };
  
  const doParse = cssDeclarationString => {
    const rule = cssDeclarationString.trim().split(/{/, 2);
    const selector = rule.shift().trim();
    
    if (!IS(selector, String) || !selector.trim()) {
      return console.error(`StylingFactory ${currentSheet} (doParse): no (valid) selector could be extracted from rule ${
        shortenRule(cssDeclarationString)}`);
    }
    
    const cssRules =  cssRuleFromText(rule.shift());
    
    return tryAndCatch( () => setRules(selector, cssRules), `StylingFactory ${currentSheet} (setRules) failed`  );
  };
  
  const styleFromString = cssDeclarationString => {
    const checkAts = tryParseAtOrNestedRules(cssDeclarationString);
    return checkAts.done ? checkAts.existing : doParse(cssDeclarationString);
  }
  
  const styleFromObject = (selector, rulesObj) => {
    if (selector.trim().startsWith(`@media`)) {
      return styleFromString(atMedia2String(selector, rulesObj));
    }
    return setRules(selector, rulesObj);
  };
  
  return (cssBlockOrSelector, rulesObj = {}) => {
    const checksOk = checkParams(cssBlockOrSelector, rulesObj);
    
    return checksOk && (
      Object.keys(rulesObj).length ?
        styleFromObject(cssBlockOrSelector, rulesObj) :
        styleFromString(cssBlockOrSelector) );
  };
}

function allHelpers({styleSheet, createWithId}) {
  const notification = `Note: The rule or some of its properties may not be supported by your browser (yet)`;
  
  const escape4RegExp = str => str.replace(/([*\[\]()-+{}.$?\\])/g, a => `\\${a}`);
  const currentSheet = `for style#${createWithId}`;
  
  const retrieveOrCreateSheet = id => {
    const existingSheet = document.querySelector(`#${id}`)?.sheet;
    if (existingSheet) { return existingSheet; }
    const newSheet = Object.assign(document.createElement(`style`), { id });
    document.head.insertAdjacentElement(`beforeend`, newSheet);
    return newSheet.sheet;
  }
  
  styleSheet = createWithId ? retrieveOrCreateSheet(createWithId) : styleSheet;
  
  const notSupported = rule => {
    console.error(`StylingFactory ${currentSheet} [rule: ${rule}]
    => @charset, @namespace and @import are not supported here`);
    return {done: true};
  };
  
  const createRE = (regexStr, ...args) => {
    const flags = args.length && Array.isArray(args.slice(-1)) ? args.pop().join(``) : ``;
    
    return new RegExp(
      (args.length &&
        regexStr.raw.reduce( (a, v, i ) => a.concat(args[i-1] || ``).concat(v), ``) ||
        regexStr.raw.join(``))
        .split(`\n`)
        .map( line => line.replace(/\s|\/\/.*$/g, ``).trim().replace(/(@s!)/g, ` `) )
        .join(``), flags);
  };
  
  const ruleExists = (ruleFragOrSelector, isSelector) => [...styleSheet.rules].find( r =>
    isSelector ?
      compareSelectors((r.selectorText || ``), ruleFragOrSelector) :
      createRE`${escape4RegExp(ruleFragOrSelector)}${[...`gim`]}`.test(r.cssText));
  
  const tryParseAtOrNestedRules = cssDeclarationString =>
    /^@charset|@import|namespace/i.test(cssDeclarationString.trim()) ?
      notSupported(cssDeclarationString) :
      cssDeclarationString.trim().startsWith(`@`) ?
        { ok: tryParse(cssDeclarationString, styleSheet.cssRules.length), done: true } :
        /([&.#:].+{.+?}|@media|@supports|@layer|@scope|@container)/mi.test(cssDeclarationString) ?
          { existing: tryParse(cssDeclarationString, 1), done: true }
          : { ok: false, done: false };
  
  const removeRules = selector => {
    const rulesAt = [...styleSheet.cssRules].reduce( (acc, v, i) =>
      compareSelectors(v.selectorText || ``, selector) && acc.concat(i) || acc, [] );
    const len = rulesAt.length;
    rulesAt.forEach(idx => styleSheet.deleteRule(idx));
    
    return len > 0
      ? console.info(`✔ Removed ${len} instance${len > 1 ? `s` : ``} of selector ${selector} from ${currentSheet.slice(4)}`)
      : console.info(`✔ Remove rule: selector ${selector} does not exist in ${currentSheet.slice(4)}`);
  }
  
  const ISOneOf = (obj, ...params) => !!params.find( param => IS(obj, param) );
  const IS = (obj, ...shouldBe) => {
    if (shouldBe.length > 1) {
      return ISOneOf(obj, ...shouldBe);
    }
    shouldBe = shouldBe.shift();
    const invalid = `Invalid parameter(s)`;
    const self = obj === 0 ? Number : obj === `` ? String :
      !obj ? {name: invalid} :
        Object.getPrototypeOf(obj)?.constructor;
    return shouldBe ? shouldBe === self?.__proto__ || shouldBe === self :
      self?.name ?? invalid;
  };
  
  const toRuleObject = preparedRule => preparedRule
    .reduce( (acc, v) => {
      const [key, value] = [
        v.slice(0, v.indexOf(`:`)).trim(),
        v.slice(v.indexOf(`:`) + 1).trim().replace(/;$|;.+(?=\/*).+\/$/, ``)];
      return key && value ? {...acc, [key]: value} : acc; }, {} );
  
  const prepareCssRuleFromText = rule => {
    return rule
      .replace(/\/\*.+?\*\//gm, ``)
      .replace(/[}{\r\n]/g, ``)
      .replace(/(data:.+?);/g, (_,b) => `${b}\\3b`)
      .split(`;`)
      .map(l => l.trim())
      .join(`;\n`)
      .replaceAll(`\\3b`, `;`)
      .split(`\n`);
  }
  
  const cssRuleFromText = rule => toRuleObject(prepareCssRuleFromText(rule));
  
  const toDashedNotation = str2Convert =>
    str2Convert.replace(/[A-Z]/g, a => `-${a.toLowerCase()}`).replace(/[^--]^-|-$/, ``);
  
  const compareSelectors = (s1, s2) => s1?.replace(`::`, `:`) === s2?.replace(`::`, `:`);
  
  const checkParams = (cssBlockOrSelector, rulesObj) =>
    cssBlockOrSelector
    && IS(cssBlockOrSelector, String)
    && cssBlockOrSelector.trim().length
    && IS(rulesObj, Object) ||  (console.error(`StylingFactory ${currentSheet} called with invalid parameters`), false);
  
  const shortenRule = rule => {
    const shortRule = (rule || `NO RULE`).trim().slice(0, 50).replace(/\n/g, `\\n`).replace(/\s{2,}/g, ` `);
    return rule.length > shortRule.length ? `${shortRule.trim()}...truncated`  : shortRule;
  }
  
  const tryAndCatch = (fn, msg) => {
    try { return fn(); }
    catch(err) { console.error( `${msg || `an error occured`}: ${err.message}` ); }
  }
  
  const tryParse = (cssDeclarationString) => {
    cssDeclarationString = cssDeclarationString.trim();
    const rule = cssDeclarationString.slice(0, cssDeclarationString.indexOf(`{`));
    const exists = !!ruleExists(rule);
    
    try {
      return (styleSheet.insertRule(`${cssDeclarationString}`, styleSheet.cssRules.length), exists);
    } catch(err) {
      return (console.error(`StylingFactory ${currentSheet} (tryParse) ${err.name} Error:\n${
        err.message}\nRule: ${
        shortenRule(cssDeclarationString)}\n${
        notification}`),
        exists);
    }
  };
  
  const consider = (fn, rule, existing) => {
    try {
      return (fn(), existing);
    } catch(err) {
      return (console.error(`StylingFactory ${currentSheet} (tryAddOrModify) ${err.name} Error:\n${
        err.message}\nRule: ${shortenRule(rule)}\n${
        notification}`),
        existing);
    }
  }
  
  const stringifyMediaRule = mediaObj => Object.entries(mediaObj)
    .map( ([key, value]) => `${key}: ${value.trim()}`).join(`;\n`);
  
  const atMedia2String = (selector, rulesObj) => `${selector.trim()} ${
    Object.entries(rulesObj).map( ( [ selectr, rule] ) =>
      `${selectr}: { ${stringifyMediaRule(rule) }` ) }` ;
  
  return {
    sheet: styleSheet, tryAndCatch, removeRules, cssRuleFromText, tryParseAtOrNestedRules,
    ruleExists, atMedia2String, compareSelectors, toDashedNotation, checkParams, tryParse,
    consider, IS, shortenRule, currentSheet };
}