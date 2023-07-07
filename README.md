# LifeCSS

A small library to add, remove or modify css rules in situ.

The module is also used in my [JQL (*JQu*ery*L*ike)](https://github.com/KooiInc/JQL) module.

## Usage

### Install

You can install LifeCSS as a module from [NPM](https://www.npmjs.com/package/lifecss)
```cmd
npm -i lifecss
```

### Import in EcmaScript module
Your script is of type `module`;

```html
<script type="module">
  import cssEditFactory from "https://kooiinc.github.io/LifeCSS/";
  // or
  const cssEditFactory = (await import("https://kooiinc.github.io/LifeCSS/")).default;
  // this will create an editor and a stylesheet with id #myCustomStylesheet in the document header. 
  const myCssEdit = cssEditFactory({createWithId: `#myCustomStylesheet`});

  // this will create an editor for an existing stylesheet in the document
  const myCssEdit = cssEditFactory({styleSheet: document.styles[0]}));

  // or
  const myCustomSheet = document.querySelector(`#myCustomStylesheet`).sheet;
  const myCssEdit = cssEditFactory({styleSheet: myCustomSheet));
  // ... your code
</script>
``` 
### Retrieve a browser script

Your script is a regular (non module) script

```html
<script src="https://kooiinc.github.io/LifeCSS/index.browser.js"></script>
<script>
  const cssEditFactory = window.LifeStyleFactory;
  // optionally remove from global namespace
  delete window.LifeStyleFactory;
  // ... your code
</script>
```

### Syntax

```
[created cssEditor](rule: string)
  ∟ add/modify a complete css [rule]

[created cssEditor](selector: string, rules: Object)
  ∟ add/modify properties of the rule with [selector] 

[created cssEditor](selector: string, {removeRule: true})
  ∟ remove a complete rule identified with [selector]

[created cssEditor](selector: string, {removeProperties: { Object }})
  ∟ remove properties [removeProperties] from the rule with [selector]
```

**Notes**:
- `!important will be honored`
- Most pseudo selectors (e.g. `::after`, `::not(...)`) will work as expected.
  - For special characters, use a double escape, e.g. `content: '\\1F44D'`
- When an edit did not work, the error is shown in the console.  
  That should not break further script execution.

**Examples**:

```javascript
// You created or retrieved a stylesheet editor named myCssEdit
// now there are two ways to add a css rule to that sheet

// 1. A complete rule string
myCssEdit(`.warn {
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

