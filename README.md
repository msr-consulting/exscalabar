# The EXSCALABAR User Interface

The directory structure is intended to provide some insight into the architecture of the UI.  The architecture roughly follows some of the guidelines laid out by [John Pappa](https://github.com/johnpapa/angular-styleguide).  Each piece is wrapped in an [immediately invoked function expression (IIFE)](https://en.wikipedia.org/wiki/Immediately-invoked_function_expression) in an attempt not to pollute the global namespace with objects that don't need to be out there.  Each piece of code is intended to be small and focused.

## The Build System

All files are processed during editing using the [Gulp build tool](http://gulpjs.com/).  Gulp can be used to perform a variety of tasks, but it is here used to 

* lint
* concatenate
* minify
* uglify 
* 

So you need to

    sudo npm install -g jshint
    npm install gulp-jshint
    npm install gulp-concat
    npm install gulp-uglify
    npm install gulp-rename
    npm install gulp-connect
    npm install gulp-open
    npm install gulp-htmlmin

In addition, Gulp provides a web server that allows live reload on change and watches and adjusts the generated files as changes occur.

During the build process, two files are produced and both are stored in the folder found in the main directory ``assets``.  The first file, ``exscalabar.js`` is the concatenated file.  This file can be used for development purposes and contains all of the files required by the system concatenated in the correct order (this list of files is defined in ``gulpfile.js`` under the variable ``watch_list``.

The developer may bypass the use of this tool entirely simply by placing the references to the individual scripts in the file ``index.html``.

## Overview

The application entry point (``index.html``) resides within the top-level directory along with some documentation and helper files.  The main application uses AngularJS to inject views into this portion of the application via [directives](https://docs.angularjs.org/guide/directive) and store and share data between views via [services](https://docs.angularjs.org/guide/services).  

There are two types of views within the application - a view that is shared across all portions of the UI (such as the sidebar and navigation bar) and views that provide functionality particular to an aspect of instrument operation (such as the PAS or CRDS control).  The former views and their respective controllers and services are stored within the folder ``app`` in the main directory.  The latter are stored in the folder ``views``.

## User Interface Configuration

The user interface in configured with the file ``ui.json``.  The file is in javascript object notation (when modifying, the rules will have to be observed; see [json.org](http://json.org).  This file contains information on how the user interface should be displayed at startup.  

### General Configuration

The configuration file contains two key entries at the start: ``name`` and ``version``.  The name and version identify the build and are displayed in the tab of the user interface.  The ``name`` is also displayed at the top of the user interface.  The name can be changed to represent the intended use of the client UI, but it is advisable to not change the ``version`` field as this is an identifier that associates the current UI build with it's ``package.json``.  These two values should be bumped in unison.

### Plot Configuration

The configuration file also contains details on how to style plots.  These entries are identified by the key word *plot* in the property name.  Each of these objects contain similar properties.  These are:
 
 * ``color`` - an array of colors.  These may be identified by canonical names such as ``red`` or they may use mor detailed descriptors such as ``rgb(255,0,0)``.  In either case, these are strings  and as such each entry must be enclosed by double quotation marks as determined by the json standard.
 * ``strokeWidth`` - an array of integers.  These integers will determine the thickness of the stroke for each entry.
 * ``pattern`` - an array of strings.  These strings determine the type of line that is drawn by the plotter. The possible values are:
  * "DASHED_LINE"
  * "DOTTED_LINE"
  * "DOT_DASH_LINE"
  
  These values are defined by the ``Dygraphs`` API and are constants for an array of two values which define the spacing and the size of the lines.  For a solid line, the user may use ``null``.
    
* ``xGrid`` - boolean defining whether the x grid is displayed.
* ``yGrid`` - boolean defining whether the y grid is displayed.

Values that apply to how series are displayed usually require an array entry.  The user can supply as many entries as they wish or as few as 1.  If there are fewer entries than series, then the client should recycle values by continuously cycling through the existing values. 

For example:

> If the current values are "color": ["red","blue",],"strokeWidth": [ 2 ], "pattern": [ null,"DASHED_LINE","DOTTED_LINE"] for a plot containing three series, the first series will be a solid red line with a stroke width of 2, the second will be a blue dashed line with a stroke width of 2 and the third wil be a red dotted line with a stroke width of 2.
 
## Reading in the Configuration
 

  
 
## Resources

* D3 Tree Layout - http://www.d3noob.org/2014/01/tree-diagrams-in-d3js_11.html
* D3 eBook - https://leanpub.com/D3-Tips-and-Tricks
* AngularUI for Bootstrap - https://angular-ui.github.io/bootstrap/
* Bootstrap - http://getbootstrap.com/
* GulpJS - http://gulpjs.com/
* Node Package Manager (NPM) - https://www.npmjs.com/package/npm
