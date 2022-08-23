#!/usr/bin/env node

import * as csstree from "css-tree";
import * as fs from "node:fs";
import axios from "axios";
import chalk from "chalk";
import ora from "ora";

const inputIndex = process.argv.indexOf("-i");
const outputIndex = process.argv.indexOf("-o");

if (inputIndex === -1) {
  console.log(chalk.white.bgRed("\nNo Input provided."));
  process.exit(1);
}

if (outputIndex === -1) {
  console.log(chalk.white.bgRed("\nNo Output provided."));
  process.exit(1);
}

const spinner = ora({
  text: "Purging plugin file",
  color: "yellow",
}).start();

const inputFile = process.argv[inputIndex + 1];
const outputFile = process.argv[outputIndex + 1];

axios
  .get("https://raw.githubusercontent.com/filamentphp/filament/2.x/packages/admin/dist/app.css")
  .then(({ data }) => {
    const filamentStylesRaw = data;
    const pluginStylesRaw = fs.readFileSync(inputFile, "utf8");

    const filamentAst = csstree.parse(filamentStylesRaw, {
      parseRulePrelude: false,
      parseValue: false,
      parseAtrulePrelude: false,
    });

    const pluginAst = csstree.parse(pluginStylesRaw, {
      parseRulePrelude: false,
      parseValue: false,
      parseAtrulePrelude: false,
    });

    const filamentStyles = [];
    const pluginStyles = [];
    const filamentKeyframes = [];
    const pluginKeyframes = [];

    csstree.walk(filamentAst, (node) => {
      if (node.type === "Rule") {
        filamentStyles.push(node.prelude.value);
      }

      if (node.type === "Atrule" && node.name.includes("keyframes")) {
        filamentKeyframes.push(node.prelude.value);
      }
    });

    csstree.walk(pluginAst, (node) => {
      if (node.type === "Rule") {
        pluginStyles.push(node.prelude.value);
      }

      if (node.type === "Atrule" && node.name.includes("keyframes")) {
        pluginKeyframes.push(node.prelude.value);
      }
    });

    const diffedStyles = pluginStyles.filter((val) => !filamentStyles.includes(val));
    const diffedKeyframes = pluginKeyframes.filter((val) => !filamentKeyframes.includes(val));

    csstree.walk(pluginAst, {
      enter: function (node, item, list) {
        if (node.type == "Rule" && !diffedStyles.includes(node.prelude.value) && node.prelude.value.startsWith(".")) {
          list.remove(item);
        }
        if (node.type == "Atrule" && !diffedKeyframes.includes(node.prelude.value) && node.name.includes("keyframes")) {
          list.remove(item);
        }
      },
    });

    fs.writeFileSync(outputFile, csstree.generate(pluginAst));

    spinner.stopAndPersist({
      symbol: "✅",
      text: chalk.green(`Plugin styles purged and saved to ${outputFile}.`),
    });
  })
  .catch((e) => console.log(e));
