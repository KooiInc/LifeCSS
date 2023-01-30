export default LifeStyleFactory;

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

function LifeStyleFactory({styleSheet, createWithId}) {
  styleSheet = createWithId ?
    document.head.insertAdjacentElement(`beforeend`,
      Object.assign( document.createElement(`style`), { id: createWithId, type: `text/css` } )
    ).sheet :
    styleSheet;

  const IS = (obj, isObject) => {
    // utilities
    const self = obj?.constructor;
    return isObject ?
      isObject === self :
      ( self?.name
        || (String(self).match(/^function\s*([^\s(]+)/im)
          || [0,'ANONYMOUS_CONSTRUCTOR'])[1] ); };
  const ISOneOf = (obj, ...types) => types.filter(t => IS(obj, t)).length;
  // these at rules will just be inserted at the end of the sheet
  const otherAtRulesRE = createRE`
          @keyframes
        | @font-feature-values
        | @font-palette-values
        | @layer
        | @namespace
        | @page
        | @counter-style
        ${[`i`]}`;
  const toDashedNotation = str2Convert =>
    str2Convert.replace(/[A-Z]/g, a => `-${a.toLowerCase()}`).replace(/^-|-$/, ``);
  const compareSelectors = (s1, s2) => s1?.replace(`::`, `:`) === s2?.replace(`::`, `:`);
  const checkParams = (cssBlockOrSelector, rulesObj) =>
    cssBlockOrSelector
    && IS(cssBlockOrSelector, String)
    && cssBlockOrSelector.trim().length
    && IS(rulesObj, Object) ||  (console.error(`StylingFactory instance called with invalid parameters`), false);

  // css manipulation
  const setRule4Selector = (rule, properties) => Object.entries(properties)
    .forEach( ([prop, value]) => rule.style.setProperty(toDashedNotation(prop), value));

  const setRules = (selector, styleRules, sheetOrMediaRules = styleSheet) => {
    const exists = [...sheetOrMediaRules.cssRules].find( r =>
      compareSelectors((r.selectorText || ``), selector) );
    const rule4Selector = exists
      || sheetOrMediaRules.cssRules[sheetOrMediaRules.insertRule(`${selector} {}`,
        sheetOrMediaRules.cssRules.length || 0)];
    setRule4Selector(rule4Selector, styleRules);
    return exists ? true : false; };

  const setMediaRule = (selector, styleValues) => {
    const mediaCssRule = [...styleSheet.cssRules].find( r => r.cssText.startsWith(selector)) ||
      styleSheet.cssRules[styleSheet.insertRule(`${selector} {}`, styleSheet.cssRules.length || 0)];
    const mediaStyleRules = styleValues;

    if (ISOneOf(mediaCssRule, CSSMediaRule, CSSContainerRule)) {
      return Object.entries(mediaStyleRules).forEach( ([selector, cssRule]) =>
        setRules(selector, cssRule, mediaCssRule) );
    }

    return console.error(`StylingFactory instance error: can't parse ${selector}`);
  };

  const tryParse = (cssDeclarationString) => {
    try {
      return (styleSheet.insertRule(`${cssDeclarationString.trim()}`, styleSheet.cssRules.length), true);
    } catch(err) {
      return (console.error(`StylingFactory instance ${err.name} Error:\n${err.message}\nRule (truncated): ${
        cssDeclarationString.trim().slice(0, 50).replace(/\n/g, `\\n`).replace(/\s{2,}/g, ` `)} ...`), false);
    }
  };

  const cssRuleFromText = rule => {
    let rules = rule[0].trim().replace(/}|{/, ``).split(`\n`).map(r => r.trim())
      .filter(v => v);
    return rules.reduce( (acc, v) => {
      const [key, value] = [
        v.slice(0, v.indexOf(`:`)).trim(),
        v.slice(v.indexOf(`:`) + 1).trim().replace(/;$|;.+(?=\/*).+\/$/, ``)];
      return key && value ? {...acc, [key]: value} : acc; }, {} );
  };

  const mediaRuleFromText = selector => {
    const rules = selector.slice( selector.indexOf(`{`) + 1, selector.lastIndexOf(`}`) );
    return rules.split(/}/).filter( r => r.trim().length ).map(r => r.trim())
      .reduce( (acc, v) => {
        const [key, rule] = v.split(`{`).map(v => v?.trim()?.replace(/}/, ``));
        return key && rule ? {...acc, [key]: cssRuleFromText([rule])} : acc; }, {} ); };

  const styleFromObject = (selector, rulesObj) =>
    selector.trim().startsWith(`@media`)
      ? setMediaRule(selector, rulesObj)
      : setRules(selector, rulesObj);

  const checkAtRules = (cssDeclarationString) =>
    /@import|@charset|@font-face/i.test(cssDeclarationString)
      ? {ok: tryParse(cssDeclarationString, 0), done: true}
      : otherAtRulesRE.test(cssDeclarationString)
        ? {ok: tryParse(cssDeclarationString, styleSheet.cssRules.length), done: true}
        :  {ok: false, done: false};

  const styleFromString = cssDeclarationString => {
    const checkAts = checkAtRules(cssDeclarationString);
    if (checkAts.done) { return checkAts.ok; };
    const isParsableAtRule = /@.+{/i.test(cssDeclarationString);
    const parsableAtRule = isParsableAtRule && mediaRuleFromText(cssDeclarationString) || undefined;
    const rule = cssDeclarationString.trim().split(/{/, 2);
    const selector = rule.shift().trim();
    const cssRules =  parsableAtRule ?? cssRuleFromText(rule);

    return isParsableAtRule
      ? setMediaRule(selector, cssRules)
      : setRules(selector, cssRules);
  }

  // the factory 'produces':
  return (cssBlockOrSelector, rulesObj = {}) =>
    checkParams(cssBlockOrSelector, rulesObj) && (
      Object.keys(rulesObj).length ?
        styleFromObject(cssBlockOrSelector, rulesObj) :
        styleFromString(cssBlockOrSelector) );
}