# Filament Plugin Purge

Installation

```bash
npm install @awcodes/filament-plugin-purge
```

:bangbang: Run this command after building your Tailwind CSS based stylesheet. :bangbang:

You can either run the command manually inside your plugin directory or it can be added to the scripts section of your package.json file.

```bash
filament-purge -i path/to/input.css -o path/to/output.css
```

```js
"scripts": {
    "dev": "npx tailwindcss -i resources/css/plugin.css -o resources/dist/plugin.css --postcss --watch", // Example only
    "build": "npx tailwindcss -i resources/css/plugin.css -o resources/dist/plugin.css --postcss --minify && npm run purge", // Example only
    "purge": "filament-purge -i resources/dist/plugin.css -o resources/dist/plugin.css"
},
```

## Options / Flags

* -i (Path to the plugin css file to be purged)
* -o (Path to save the purged plugin file to)
* -v (Flag to support v3 plugin development)
    * defaults to '2.x'
    * options are '2.x' or '3.x'

## License

Filament Plugin Purge is open-sourced software licensed under the [MIT license](LICENSE.md).
