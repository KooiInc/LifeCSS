 <a href="https://bundlephobia.com/package/lifecss" rel="nofollow">
  <img src="https://badgen.net/bundlephobia/min/lifecss"></a> <!-- bundlephobia sometimes breaks -->
<a href="https://www.npmjs.com/package/lifecss"><img src="https://img.shields.io/npm/v/lifecss.svg?labelColor=cb3837&logo=npm&color=dcfdd9"></a>

# LifeCSS

A small library to add, remove or modify css rules in situ.

> [!IMPORTANT]
> As of july 2025 this module is mirrored from [CodeBerg.org](https://codeberg.org/KooiInc/LifeCSS) to [Github](https://github.com/KooiInc/LifeCSS). The Codeberg code is *authorative*.

The module is also used in the [JQx](https://codeberg.org/KooiInc/JQx) module.

## Usage

### Import in EcmaScript module
Your script is of type `module`;

```html
<script type="module">
  // use the bundle from https://unpkg.com/
  import cssEditFactory from "https://unpkg.com/lifecss@latest/Bundle/index.min.js";
  // or
  const cssEditFactory = (await import("https://unpkg.com/lifecss@latest/Bundle/index.min.js")).default;
  
  // this will create an editor and a stylesheet with id #myCustomStylesheet in the document header. 
  const myCssEdit = cssEditFactory({createWithId: `#myCustomStylesheet`});

  // this will create an editor for an existing stylesheet in the document
  const myCssEdit = cssEditFactory({styleSheet: document.styleSheets[0]}));
  // ... your code
</script>
``` 
### Retrieve a browser script

Your script is a regular (_non module_) script

```html
<!-- use the bundle from unpkg.com 
     note: ./index.browser.js can be used too. It is kept for legacy.
           but consider it deprecated. It may disappear later. -->
<script src="https://unpkg.com/lifecss@latest/Bundle/index.browser.min.js"></script>
<script>
  const cssEditFactory = LifeStyleFactory.default;
  // ... your code
</script>
```

### Syntax
```
[cssEditor instance](rule: string)
  ∟ add/modify a complete css [rule]

[cssEditor instance](selector: string, rules: Object)
  ∟ add/modify properties of the rule with [selector] 

[cssEditor instance](selector: string, {removeRule: true})
  ∟ remove a complete rule identified with [selector]

[cssEditor instance](selector: string, {removeProperties: { Object }})
  ∟ remove properties [removeProperties] from the rule with [selector]
```

**Notes**:
- [x] `!important will be honored`
- [x] Most pseudo selectors (e.g. `:after`, `:not(...)`) will work as expected.
- [x] Nested css (e.g. `&:hover {...}`) will work as expected.
- [x] For special characters without a unicode character escape prefix (`\u...`) within the `content`, escape the backslash e.g. `content: '\\1F44D'`. Or indeed use a unicode escape, e.g. `\u{1F4C3}` or '\u1F44D'.
- [x] When an edit did not work, an error is printed in the console. Errors do not break further script execution.

**Examples**:

```javascript
// You created or retrieved a stylesheet editor named myCssEdit
// now there are two ways to add a css rule to that sheet

// 1. A complete rule string
myCssEdit(`
  .warn {
    color: red; 
    font-weight: bold;
    background-color: #ffffc0; 
  }`
);

// 2. A selector with a rule properties object (note the camelcasing for keys) 
myCssEdit(`.warn`, { color: `red`, fontWeight: `bold`, backgroundColor: `#ffffc0` } );

// When the rule already exists, it is modified, otherwise it is created

// You can remove a complete rule using
myCssEdit(`.warn`, { removeRule: 1 });

// You can remove properties from a rule using
myCssEdit(`.warn`, { removeProperties: { fontWeight: 1, "background-color": 1 } });

// That's all folks.
```

### Example
A comprehensive example can be found [@Stackblitz](https://stackblitz.com/edit/js-fnxaro?file=index.js).
