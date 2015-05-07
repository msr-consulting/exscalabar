## Using AngularJS ##

### Architecture ###

### Controllers ###

- ``Main``: 
- ``Sidebar``:
- ``InputTable``:
- ``O3Table``: This controller contains the logic for building the table that has the calibration step definitions.  When a row is double clicked, the function ``clickRow`` will be called which in turn calls the ``tableService`` method ``setTab`` with the ID of the current row as the input. 
- ``Save``: Handles the call to save the calibration data.  The call posts an XML script to the server. 

### Services ###

- ``tableService``:
- ``SaveData``:

### Directives ###

- ``sidebar``:
- ``navi``:
- ``msg``:
- 
