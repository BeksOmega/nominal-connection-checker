# NOTICE!

This project is sadly **no longer being developed** (as of 2022/02). While I
(BeksOmega) love this project, I am only an amateur type theorist, and solving
the problem of just-in-time type checking based on local information is
currently beyond me.

I may pick this project up again in the future.

That being said, this is an open source, and anyone is free to use whatever
parts of this project they like. If anyone else would like to pick the project
up, that would delight me as well.

# blockly-nominal-connection-checker [![Built on Blockly](https://tinyurl.com/built-on-blockly)](https://github.com/google/blockly)

A [Blockly](https://www.npmjs.com/package/blockly) plugin that allows you to
create more advanced connection checks.

This project is targeted at helping Blockly model languages with complex nominal
typing systems, like C++, Java, or Rust. It can also be used for modeling
subsets of structurally typed languages like TypeScript, Golang, or Haskell. Or
it can be used to create a type-safe blocks languages that generates a
dynamically typed language like JavaScript.

This project was original created and is maintained by [Beka Westberg][linked-in] (BeksOmega).

It lives at https://github.com/BeksOmega/nominal-connection-checker.

## :star2: Setup

Installation via yarn:
```
yarn add blockly-nominal-connection-checker
```

Installation via npm:
```
npm install blockly-nominal-connection-checker --save
```

Usage in JavaScript:
```js
import * as Blockly from 'blockly';
import {pluginInfo as NominalConnectionCheckerPluginInfo} from 'blockly-nominal-connection-checker';

// Inject Blockly.
const workspace = Blockly.inject('blocklyDiv', {
  toolbox: toolboxCategories,
  plugins: {
    ...NominalConnectionCheckerPluginInfo,
  },
});

// Initialize plugin.
workspace.connectionChecker.init(hierarchyDef);
```

## :page_with_curl: License
The Nominal Connection Checker is licensed under the [MIT License][mit].

This means it can be used for commercial, public, or private use. You are also
free to modify and/or distribute the software. You simply need to maintain the
copyright included in each file, and include the license when distributing the
library. 

## :green_heart: Contributing

Contributions are always welcome! Contributing code, writing bug reports,
and commenting on feature requests are all super important to this project.

For more info about types of contributions and ways to contribute, please
see the [contribution guide][contributing].

## :question: Support

If you think you have found a bug definitely report it using the
[issue template][issue-template]! Just be sure to search for duplicate issues
before reporting, as someone else may have already come across your problem.

If you have any questions about the project please feel free to message
bekawestberg@gmail.com with the subject line "Nominal Connection Checker". All
questions are welcome, don't be shy! Just try to include as much helpful
information as possible =)

[mit]: https://opensource.org/licenses/MIT
[contributing]: https://github.com/BeksOmega/nominal-connection-checker/blob/main/.github/CONTRIBUTING.md
[issue-template]: https://github.com/BeksOmega/nominal-connection-checker/issues/new/choose
[linked-in]: https://www.linkedin.com/in/beka-westberg/
