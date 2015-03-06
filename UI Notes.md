# The User Interface

The following document defines some expectations for the user interface.

## Framework

The user interface will utilize [Twitter Bootstrap](http://getbootstrap.com/) to develop a web-based user interface (UI) that is
responsive.  The layout of the UI should scale smoothly from larger monitors (such as desktops and full size laptops) to larger 
tablets.  

Bootstrap is built on [jQuery](http://jquery.com/) and as such, we will use the most current compatible versions of both 
libraries.  jQuery will be used to handle events associated with individual UI controls as well as 
[AJAX](https://developer.mozilla.org/en-US/docs/AJAX) requests for data.

## General Layout

The general layout will be defined such that transitioning from page to page will be a smooth experience.  The UI will use the grid system to contain the base elements.  The UI will be roughly divided into four main parts: a navigation bar, a side bar, a main container and a message bar.  *At no point should any of the elements in the UI collide or overlap!*

### Navigation

The top will be covered by a **navigation bar**.  The navigation bar will contain links to the different pages on the UI and may contain drop down menus as well as buttons.  A **banner** will likely be used to display the name of the instrument(EXSCALABAR) as well as the name of the organization [UK Met Office](http://www.metoffice.gov.uk/).  

### Sidebar

To the right and below the navigation bar will be a **sidebar**.  The sidebar will contain items that are relevant to every aspect of instrument control.  These include

* A button to save data
* A button to change the filter state
* Instrument time with someway of syncing to another clock.
* Instrument connection status with a method of attempting a reconnect.
* A button to shutdown the instrument.
* A text input for the IP address.
* A text input for the port.
* A display indicating the number of errors and warnings thrown by the server with the option to clear the ticker.
 
The sidebar should be sized such that the elements are tightly fit into the containing element.  The width of the container should be defined by the largest element with some small padding so that the sidebar does not abut the edge of the screen.  This container should not scroll unless the screen size requires it for visibility (for an example of this, see the [Bootstrap pages sidebar](http://getbootstrap.com/css/) (although this contains an element related to the navigation that is not necessary for this project).

### Main Container

The main container will host the **controls** and **indicators** for the instrument.  Controls allow the user to define certain aspects of the instrument behavior while indicators provide the user feedback concerning the performance of the instrument.  Controls and indicators may take the form of numeric or text fields as well as graphs.

#### Basic Controls and Indicators

Controls and indicators should be grouped according to the system element represented.  The items should be grouped visually using a container such as Bootstrap's [panel with a heading](http://getbootstrap.com/components/#panels).  Each item within the panel should have 
* a label which *should not* change position as the panel resizes.
* a css id such that it can be registered for events.
* a tooltip providing a brief description of the control/indicator function.


#### Plotting

Plots provide a visual representation of the performance of the instrument.  There are different plotting packages available:

* [D3](http://d3js.org/) - incredibly powerful but a little daunting.
* [Rickshaw](http://code.shutterstock.com/rickshaw/) - this is a library that is built on D3 and developed by the folks at Shutterstock.  This one looks very promising and straightforward to use.  Allows straightforward configurability of plots.
* [Cubism](https://square.github.io/cubism/) - powered by D3. 
* [flot](http://www.flotcharts.org/) - Basic.  Built on jQuery.

Plots are generally updated at regular intervals (1 second) and may contain time series data as well as simple graphs.  We absolutely must be able to configure the plots.  The configurable items may be but (are not limited to) the following: 
* history (i.e. the amount of data, visible and not visible, contained in the plot).
* the visible ranges, both x and y.
* the visibility of different series.

An awesome example of this that contains most of these items is found in the [Rickshaw examples](http://code.shutterstock.com/rickshaw/examples/extensions.html).  This plot shows multiple series (150 points in each series), allows the user to turn off and on different series, focus on different series and change the visible range of data .  And for bonus, the plots contain a hover element that allows the user to see exact values!

One thing to keep in mind is that these graphing elements will be the most resource intensive aspect of any of these pages.  It is worthwhile to keep benchmarks of their performance using tools such as Chrome's [Developer Tools](https://developer.chrome.com/devtools).

### Message Container

Running across the bottom of the screen will be a container which will display system messages broadcast to the client.  The container color will be dependent upon the type of message received: informational, warning or error.  

This container should be always visible.
