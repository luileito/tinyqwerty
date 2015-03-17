# Text Entry on Tiny QWERTY Soft Keyboards

Here you'll find the source code of the web-based prototypes we used in our work presented at CHI'15:

- L. A. Leiva, A. Sahami, A. Catalá, N. Henze, A. Schmidt. **Text Entry on Tiny QWERTY Soft Keyboards.** *Proc. CHI, 2015.*
- L. A. Leiva, A. Sahami, A. Catalá, N. Henze, A. Schmidt. **Error Auto-Correction Mechanisms on Tiny QWERTY Soft Keyboards.** *Proc. CHI Workshop on Text entry on the edge, 2015.*

Discover more about this work at: http://personales.upv.es/luileito/tinyqwerty/

## Install Instructions

Clone this repository and point your web browser to either `zoomboard`, `callout` or `zshift` directories. You can serve the root directory of the cloned repo in your localhost, via Node's `http-serve` or Python's `SimpleHTTPServer` commands.

### Advanced Install Instructions

If you perform some changes to the code and want to re-run the prototypes, first do `npm install` in the root directory of the cloned repo. (Suffice to say that you'll need Nodejs to run that command.) Then, execute the pertaining grunt tasks:

- To recompile the ZoomBoard prototype: `grunt zoomboard`
- To recompile the Callout prototype: `grunt callout`
- To recompile the ZShift prototype: `grunt zshift`
- To recompile the common files: `grunt common`
- To recompile everything in a row: `grunt`

In case you want to debug your newly compiled code, add the parameter `--debug` to each grunt task, e.g. `grunt zshift --debug`. In debug mode, the source maps for JS and CSS files will be created in addition to the minified ones.

## Running your own text entry experiments

All prototypes accept the following URL parameters for conducting text entry experiments:

- `uid`: The user ID. Each participant should have a unique ID.
- `txt`: The phrase used as input stimuli. It must be url-encoded, see http://en.wikipedia.org/wiki/Percent-encoding
- `siz`: The overall keyboard size, in pixels. Depending on the screen resolution, different values apply here. For instance, on a 233 dpi screen 18 mm correspond to 110 px.

## Error Auto-Correction

The keyboard prototypes are equipped with a webservice based on spell checking. If the `spell` URL param is set (i.e., `http://localhost/tinyqwerty/callout/?spell=en`) the last entered word will be spell-checked, after entering a space. The webservice was written by Richard Willis and is available under the MIT license at https://github.com/badsyntax/jquery-spellchecker

Note that only the PSpell driver of the webservice was tested, for which you'll need both Aspell and PHP Pspell installed on your web server. To install additional spell checkers, just do `sudo apt-get install aspell-LANG` where LANG is a two letter code that identifies each language; e.g. `en` for English, `fr` for French, etc. Currently, there are spell checkers available for near 100 languages. The official list can be found here: ftp://ftp.gnu.org/gnu/aspell/dict/0index.html
