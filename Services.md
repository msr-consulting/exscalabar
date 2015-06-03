The server hosts a set of services by which the client can communicate with the server.  These services are broken out into three different headings:

* General
* CRDS_CMD
* PAS_CMD
* Calibration

# Service Structure

Calls to services are structured using the system IP, port, service subset, service, and any value that is to be pumped into the system.  Services look like 

``http://[IP]:[port]/[subset]/[service](?value=val)``

# General

This subset of services is used by the whole application.  The services defined therein are :

* **Data** - streams data in JSON format to the client.
* **Stop** - calls a hard stop on the server; this will result in the shutting down of the server software.
* **Save** - determines whether data will be saved or not.  This service takes an unsigned integer value.  If the value is not equal to 0, then the system will save data.  This service is called using ``../General/Save?save=value``.
* **Updatefilter** - Changes the current state of the filter.  Accepts an unsigned integer as teh input (``State``).  If ``State`` is not equal to 0, then the system will be set to filter.
* **NewFile** - starts a new file when writing.
* **FilterCycle** - changes the filter cycle parameters.  This service looks like ``/General/FilterCycle?auto=val0&Period=val1&Length=val2``.  Accepts three values:
 * ``auto`` - unsigned integer being true if the value is not equal to 0
 * ``Period`` - unsigned word that sets the time from beginning filter periods.
 * ``Length`` - unsigned word that determines the period of filter in an auto cycling routine.
* **SetTime** - double precision input value ``time`` used to set the time on the server based on the client time.
* ** Cabin** - unsigned integer ``Cabin`` that sets the cabin valve position.  0 sets the position to sample from the cabin.

# CRDS_CMD

* **fblue** - sets ``Rate`` to be the new blue laser frequency.
* **fred** - sets ``Rate`` to be the new red laser frequency.
* **Vpmt** - string of comma separated voltages ``V`` for setting the PMT gains. 
* **LaserGain** - three float values to set the laser gains (``R``, ``B0``, ``B1``).

# PAS_CMD

* **Spk** - two signed word integers that set the speaker cycling parameters:
 * ``df`` - sets the band of the speaker chirp
 * ``f0`` - sets the center frequency of the speakerr chirp.
* **SpkSw** - unsigned integer that changes the position of the speaker.  ``SpkSw`` not equal to 0 indicates speaker is on.
* **UpdateFr** - string of comma separated integers for updating the resonant frequency ``f0``.
* **UpdateLaserEnable** - single unsigned byte  ``LasEnByte`` to denote the laser enabled state for the five lasers.
* **Vrange** - string of comma separated voltages ``Vrange`` for setting the PAS laser voltage range. 
* **Voffset** - string of comma separated voltages ``Voffset`` for setting the PAS laser voltage offset. 
* **UpdateiSpkEn** - single unsigned byte  ``iSpkEnByte`` to denote the speaker enabled state for the five cells.
* **UpdateSpkVparams** - used to change the speaker voltage range ``Vrange`` and offset ``Voffset``
* **UpdateSpkCycle** - changes the speaker cycle parameters.  Accepts three values:
 * ``Cycle`` - unsigned integer being true if the value is not equal to 0
 * ``Period`` - unsigned word that sets the time from beginning filter periods.
 * ``Length`` - unsigned word that determines the period of filter in an auto cycling routine.



