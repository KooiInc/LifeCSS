export default LifeStyleFactory;

function LifeStyleFactory({styleSheet, createWithId}) {
  const { cssRuleFromText, checkAtOrAmpersandRules, toDashedNotation, IS, shortenRule, consider, tryAndCatch,
    ruleExists, checkParams, atMedia2String, sheet, removeRules } = allHelpers({styleSheet, createWithId});
  
  const setRule4Selector = (rule, properties) => {
    if (rule && properties.removeProperties) {
      tryAndCatch( () => Object.keys(properties.removeProperties).forEach(prop => {
        rule.style.removeProperty(toDashedNotation(prop));
      }), `StylingFactory instance (remove property/properties) failed` );
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
          return console.error(`StylingFactory instance error: '${
            prop}' with value '${value}' not supported (yet)`);
        }
        
        tryAndCatch( () => rule.style.setProperty(prop, value, priority),
          `StylingFactory instance (setRule4Selector) failed`);
      });
  }
  
  const setRules = (selector, styleRules, sheetOrMediaRules = sheet) => {
    if (!IS(selector, String) || !selector.trim().length || /[;,]$/g.test(selector.trim())) {
      return console.error(`StylingFactory instance (setRules): [${
        selector || `[no selector given]` }] is not a valid selector`);
    }
    
    if (styleRules.removeRule) {
      return removeRules(selector, sheet);
    }
    
    const exists = ruleExists(selector, true);
    const rule4Selector = exists
      || sheetOrMediaRules.cssRules[sheetOrMediaRules.insertRule(`${selector} {}`, sheetOrMediaRules.cssRules.length || 0)];
    
    return consider( () => setRule4Selector(rule4Selector, styleRules), selector, exists );
  };
  
  const doParse = cssDeclarationString => {
    const rule = cssDeclarationString.trim().split(/{/, 2);
    const selector = rule.shift().trim();
    
    if (!IS(selector, String) || !selector.trim()) {
      return console.error(`StylingFactory instance (doParse): no (valid) selector could be extracted from rule ${
        shortenRule(cssDeclarationString)}`);
    }
    
    const cssRules =  cssRuleFromText(rule.shift());
    
    return tryAndCatch( () => setRules(selector, cssRules), `StylingFactory instance (setRules) failed`  );
  };
  
  const styleFromString = cssDeclarationString => {
    const checkAts = checkAtOrAmpersandRules(cssDeclarationString);
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
  
  const escape4RegExp = str => str.replace(/([*\[\]()-+{}.$?\\])/g, '\\$1');
  
  const retrieveOrCreateSheet = id => document.querySelector(`#${id}`)?.sheet ??
    document.head.insertAdjacentElement(`beforeend`,
      Object.assign(document.createElement(`style`), {id, type: `text/css`})).sheet;
  
  styleSheet = createWithId ? retrieveOrCreateSheet(createWithId) : styleSheet;
  
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
      createRE`${escape4RegExp(ruleFragOrSelector)}${[...`gim`]}`.test(r.cssText))
  
  const checkAtOrAmpersandRules = (cssDeclarationString) =>
    /^(@import|@charset|@font-face)|&.+{.+?}/i.test(cssDeclarationString.replace(/\n/g, ``)) ?
      { existing: tryParse(cssDeclarationString, 0), done: true } : atRulesRE.test(cssDeclarationString) ?
        { ok: tryParse(cssDeclarationString, styleSheet.cssRules.length), done: true } : { ok: false, done: false };
  
  const removeRules = (selector, sheet) => {
    let i = 0;
    const finder = r => compareSelectors((r.selectorText || ``), selector);
    let index = [...sheet.cssRules].findIndex(finder);
    
    while (index > -1) {
      i += 1;
      sheet.deleteRule(index);
      index = [...sheet.cssRules].findIndex(finder);
    }
    
    return i > 0
      ? console.info(`✔ Removed ${i} instance${i > 1 ? `s` : ``} of selector ${selector}`)
      : console.info(`✔ Remove rule: selector ${selector} does not exist`);
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
  
  const atRulesRE = createRE`@keyframes | @font-feature-values | @font-palette-values
    | @layer | @namespace | @page | @counter-style | @container | @media ${[`i`]}`;
  
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
    && IS(rulesObj, Object) ||  (console.error(`StylingFactory instance called with invalid parameters`), false);
  
  const shortenRule = rule => {
    const shortRule = (rule || `NO RULE`).trim().slice(0, 50).replace(/\n/g, `\\n`).replace(/\s{2,}/g, ` `);
    return rule.length > shortRule.length ? `${shortRule.trim()}...truncated`  : shortRule;
  }
  
  const tryAndCatch = (fn, msg) => {
    try { return fn(); }
    catch(err) { console.error( `${msg || `an error occured`}: ${err.message}` ); }
  }
  
  const tryParse = cssDeclarationString => {
    cssDeclarationString = cssDeclarationString.trim();
    const exists = !!ruleExists(cssDeclarationString.slice(0, cssDeclarationString.indexOf(`{`)));
    try {
      return (styleSheet.insertRule(`${cssDeclarationString}`, styleSheet.cssRules.length), exists);
    } catch(err) {
      return (console.error(`StylingFactory instance (tryParse) ${err.name} Error:\n${
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
      return (console.error(`StylingFactory instance (tryAddOrModify) ${err.name} Error:\n${
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
    sheet: styleSheet, tryAndCatch, removeRules,
    cssRuleFromText, checkAtOrAmpersandRules, ruleExists, atMedia2String, compareSelectors,
    toDashedNotation, checkParams, tryParse, consider, IS, shortenRule };
}