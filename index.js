export default LifeStyleFactory;

function LifeStyleFactory({styleSheet, createWithId}) {
  const {cssRuleFromText, mediaRuleFromText, checkAtRules, toDashedNotation,
    ruleExists, checkParams, tryAddOrModify, createSheet} = getHelpers(styleSheet);

  styleSheet = createWithId ? createSheet(createWithId) : styleSheet;

  const setRule4Selector = (rule, properties) => Object.entries(properties)
    .forEach( ([prop, value]) => rule.style.setProperty(toDashedNotation(prop), value));

  const setRules = (selector, styleRules, sheetOrMediaRules = styleSheet) => {
    const exists = ruleExists(selector, true);
    const rule4Selector = exists
      || sheetOrMediaRules.cssRules[sheetOrMediaRules.insertRule(`${selector} {}`,
        sheetOrMediaRules.cssRules.length || 0)];
    return tryAddOrModify( () => setRule4Selector(rule4Selector, styleRules), selector, exists );
  };

  const setMediaRule = (selector, styleValues) => {
    const exists = ruleExists(selector, true);
    const mediaCssRule =  exists ||
      styleSheet.cssRules[styleSheet.insertRule(`${selector} {}`, styleSheet.cssRules.length || 0)];

    return tryAddOrModify( () =>
      Object.entries(styleValues).forEach( ([selector, cssRule]) =>
        setRules(selector, cssRule, mediaCssRule)), selector, exists);
  };

  const styleFromObject = (selector, rulesObj) =>
    selector.trim().startsWith(`@media`)
      ? setMediaRule(selector, rulesObj)
      : setRules(selector, rulesObj);

  const doParse = cssDeclarationString => {
    const isParsableAtRule = /@.+{/i.test(cssDeclarationString);
    const parsableAtRule = isParsableAtRule && mediaRuleFromText(cssDeclarationString) || undefined;
    const rule = cssDeclarationString.trim().split(/{/, 2);
    const selector = rule.shift().trim();
    const cssRules =  parsableAtRule ?? cssRuleFromText(rule);

    return isParsableAtRule
      ? setMediaRule(selector, cssRules)
      : setRules(selector, cssRules);
  };

  const styleFromString = cssDeclarationString => {
    const checkAts = checkAtRules(cssDeclarationString);
    return checkAts.done ? checkAts.existing : doParse(cssDeclarationString);
  }

  return (cssBlockOrSelector, rulesObj = {}) =>
    checkParams(cssBlockOrSelector, rulesObj) && (
      Object.keys(rulesObj).length ?
        styleFromObject(cssBlockOrSelector, rulesObj) :
        styleFromString(cssBlockOrSelector) );
}

function getHelpers(styleSheet) {
  const createSheet = id => document.head.insertAdjacentElement(`beforeend`,
    Object.assign( document.createElement(`style`), { id, type: `text/css` } )).sheet;
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
  const ruleExists = (ruleFragOrSelector, isSelector) => [...styleSheet.rules].find(r =>
    isSelector ?
      compareSelectors((r.selectorText || ``), ruleFragOrSelector) :
      createRE`${ruleFragOrSelector}${[...`gim`]}`.test(r.cssText))

  const checkAtRules = (cssDeclarationString) =>
    /@import|@charset|@font-face/i.test(cssDeclarationString) ?
      { existing: tryParse(cssDeclarationString, 0), done: true } :
      atRulesRE.test(cssDeclarationString) ?
        { ok: tryParse(cssDeclarationString, styleSheet.cssRules.length), done: true } :
        { ok: false, done: false };

  const IS = (obj, isObject) => {
    const self = obj?.constructor;
    return isObject ?
      isObject === self :
      ( self?.name
        || (String(self).match(/^function\s*([^\s(]+)/im)
          || [0,'ANONYMOUS_CONSTRUCTOR'])[1] ); };

  const atRulesRE = createRE`
          @keyframes
        | @font-feature-values
        | @font-palette-values
        | @layer
        | @namespace
        | @page
        | @counter-style
        ${[`i`]}`;

  const cssRuleFromText = rule =>
    rule[0]
      .trim()
      .replace(/[}{]/, ``)
      .split(`\n`).map(r => r.trim())
      .filter(v => v).reduce( (acc, v) => {
        const [key, value] = [
          v.slice(0, v.indexOf(`:`)).trim(),
          v.slice(v.indexOf(`:`) + 1).trim().replace(/;$|;.+(?=\/*).+\/$/, ``)];
        return key && value ? {...acc, [key]: value} : acc; }, {} );

  const mediaRuleFromText = selector =>
    selector
      .slice( selector.indexOf(`{`) + 1, selector.lastIndexOf(`}`) )
      .split(/}/)
      .filter( r => r.trim().length ).map(r => r.trim())
      .reduce( (acc, v) => {
        const [key, rule] = v.split(`{`).map(v => v?.trim()?.replace(/}/, ``));
        return key && rule ? {...acc, [key]: cssRuleFromText([rule])} : acc; }, {} );

  const toDashedNotation = str2Convert =>
    str2Convert.replace(/[A-Z]/g, a => `-${a.toLowerCase()}`).replace(/[^--]^-|-$/, ``);

  const compareSelectors = (s1, s2) => s1?.replace(`::`, `:`) === s2?.replace(`::`, `:`);

  const checkParams = (cssBlockOrSelector, rulesObj) =>
    cssBlockOrSelector
    && IS(cssBlockOrSelector, String)
    && cssBlockOrSelector.trim().length
    && IS(rulesObj, Object) ||  (console.error(`StylingFactory instance called with invalid parameters`), false);

  const tryParse = cssDeclarationString => {
    cssDeclarationString = cssDeclarationString.trim();
    const exists = !!ruleExists(cssDeclarationString.slice(0, cssDeclarationString.indexOf(` `)));
    try {
      return (styleSheet.insertRule(`${cssDeclarationString}`, styleSheet.cssRules.length), exists);
    } catch(err) {
      return (console.error(`StylingFactory instance (tryParse) ${err.name} Error:\n${
        err.message}\nRule (truncated): ${
        cssDeclarationString.slice(0, 50).replace(/\n/g, `\\n`).replace(/\s{2,}/g, ` `)} ...`),
        exists);
    }
  };

  const tryAddOrModify = (fn, rule, existing) => {
    try {
      return (fn(), existing);
    } catch(err) {
      return (console.error(`StylingFactory instance (tryAddOrModify) ${err.name} Error:\n${
        err.message}\nRule (truncated): ${
        rule.trim().slice(0, 50).replace(/\n/g, `\\n`).replace(/\s{2,}/g, ` `)} ...`),
        existing);
    }
  }
  return {cssRuleFromText, mediaRuleFromText, checkAtRules, ruleExists,
    toDashedNotation, checkParams, tryParse, tryAddOrModify, createSheet};
}
