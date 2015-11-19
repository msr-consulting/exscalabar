## Using AngularJS ##

### Architecture ###

### Controllers ###

- ``Main``: 
- ``Sidebar``:
- ``InputTable``: The table input controller handles interactions with the cal table.  When the user double clicks on a calibration step definition, a message is broadcast using the ``tableService``.  A step ID is broadcast and based on the ID, the controller fills in a default value for use with the input table.  The IDs are as follows
	- Boolean Inputs - these are inputs that take a TRUE/FALSE value.  The default for each is FALSE. The following inputs are boolean:
		- **O3 Valve** - Changes the state of the O3 valve.  TRUE opens the valve.
		- **O2 Valve** - Changes the state of the O2 valve.  TRUE opens the valve.
		- **O3 Generator** - Turns on or off the ozone generator.  TRUE turns the generator on.
		- **Filter** - Changes the direction of the sample flow.  TRUE moves the sample flow through the filter.
	- Numeric Inputs - these are inputs that require a numeric control.  The following are the steps that require a numeric input:
		- **Wait** - Sets the period during which a measurement may be taken or a period over which the system will adjust to the new setting.  Default is 20 seconds.
		- **Speaker** - Sets the period over which the speaker is on.  Default is 20 seconds.
		- **QO2** - Sets the flow rate for the oxygen during ozone generation.  The default is 100.
- ``O3Table``: This controller contains the logic for building the table that has the calibration step definitions.  When a row is double clicked, the function ``clickRow`` will be called which in turn calls the ``tableService`` method ``setTab`` with the ID of the current row as the input. 
- ``Save``: Handles the call to save the calibration data.  The call posts an XML script to the server. The XML script will be written with the header ``<?xml version="1.0" encoding="utf-8"?><OZONE>`` and then each step will be tagged with the ID (as outlined above in the table input section) and the value of the command will be written between the opening and closing tags (for example, when a 20 second wait time is written, it will look like ``<Wait>20</Wait>``).  The file is closed with ``</OZONE>``.

### Services ###

- ``tableService``:
- ``SaveData``:

### Directives ###

- ``sidebar``:
- ``navi``:
- ``msg``:
- 
