# JSON Data

Data is sent from the server to the client in packets containing [JSON data](http://json.org/).  Some data will be sent all of the time while some will be sent only when a particular page is active.  The latter is associated with graph data showing ringdown and photoacoustic signals.  

Currently, the data looks like the code snippet below.  In the following code snippet, the data consists only of 1 cell for both the PAS and the CRDS.  Also, we likely want to remove the time entry in both devices and shift to a single time stamp.

```json
{
  "PAS": {
    "Time": 0,
    "Drive": false,
    "CellData": [
      {
        "derived": {
          "f0": 0,
          "IA": 0,
          "Q": 0,
          "max": [
            
          ],
          "noiseLim": 0,
          "ext": 0
        },
        "fitData": {
          "parameters": [
            0,
            0,
            0
          ],
          "covariance": [
            [
              0
            ]
          ]
        },
        "IABack": 0
      }
    ],
    "FittedData": [
      {
        "Y": [
          0
        ],
        "dt": 1
      }
    ],
    "MicFreq": [
      {
        "Y": [
          0
        ],
        "dt": 1
      }
    ],
    "MicTime": [
      {
        "Y": [
          0
        ],
        "dt": 1
      }
    ],
    "Photodiode": [
      {
        "Y": [
          0
        ],
        "dt": 1
      }
    ]
  },
  "CRD": {
    "Time": 0,
    "CellData": [
      {
        "AllanVar": {
          "iTime": [
            0
          ],
          "stdDev": [
            0
          ]
        },
        "extParam": {
          "Tau": 0,
          "Tau0cor": 0,
          "ext": 0,
          "extCorr": 0,
          "stdevTau": 0,
          "eTau": 0,
          "taucorr": 0,
          "Tau0": 0,
          "max": 0
        },
        "hkData": {
          "rhDilFac": 1,
          "Q": 0,
          "Tmean": 0,
          "extDilFac": 1,
          "rhCell": 0,
          "P": 0,
          "T": 0
        },
        "Ringdowns": [
          [
            0
          ]
        ]
      }
    ]
  }
}
```

Data is sent via the web service ```Data``` which is accessed via an address such as http://192.168.24.73:8080/xService/General/Data?data={value} where *value* is an unsigned byte that indicates what data to send.  Currently, the integers are defined as follows:

0. All data
1. All data, no graphs
2. PAS data only
3. PAS data, no graphs
4. CRD Data only
5. CRD data, no graphs
6. Housekeeping only

(Subtract 1 from the list above for the correct integer as markdown allows only 1 based lists currently).

## Roadmap

Still need to add auxilary data such as 

* Filter position
* O2 valve position
* O3 valve position
* Calibration state
* MFC Data - Q, Q0, P, T, Qsp
* PPT Data - P, T
* RH Data - RH, T, Td
* Meerstetter TEC data - Tsp, T, Power
* TE Technologies TEC data - Tsp, T, Power
