<a target="_blank" href="https://bundlephobia.com/package/lifecss@latest"><img src="https://badgen.net/bundlephobia/min/lifecss"></a>
<a target="_blank" href="https://www.npmjs.com/package/lifecss"><img src="https://img.shields.io/npm/v/lifecss.svg?labelColor=cb3837&logo=npm&color=dcfdd9"></a>

# LifeCSS

A small library to add, remove or modify css rules in situ.

The module is also used in my [JQL (*JQu*ery*L*ike)](https://github.com/KooiInc/JQL) module.

The module is mirrored from [Github](https://github.com/KooiInc/LifeCSS) to [CodeBerg.org](https://codeberg.org/KooiInc/LifeCSS).

## Usage

### Import in EcmaScript module
Your script is of type `module`;

```html
<script type="module">
  import cssEditFactory from "https://kooiinc.github.io/LifeCSS/index.js";
  // or
  const cssEditFactory = (await import("https://kooiinc.github.io/LifeCSS/index.js")).default;
  
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
<script src="https://kooiinc.github.io/LifeCSS/index.browser.js"></script>
<script>
  const cssEditFactory = window.LifeStyleFactory;
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
- `!important will be honored`
- Most pseudo selectors (e.g. `:after`, `:not(...)`) will work as expected.
  - For special characters without a unicode character escape prefix (`\u...`)
    within the `content`, escape the backslash e.g. `content: '\\1F44D'`.
    Or indeed use a unicode escape, e.g. `\u{1F4C3}` or '\u1F44D'.
- Nested css (e.g. `&:hover {...}`) can be used.
- When an edit did not work, an error is printed in the console.  
  Errors do not break further script execution.

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
