/*jshint esversion: 6 */

(function() {
    angular.module('main').factory('ExDevStatusSvc', dev_status_svc);
    dev_status_svc.$inject = ['$http', 'net', '$rootScope', 'cvt'];

    function dev_status_svc($http, net, $rootScope, cvt) {

        function Device(name, cname, status, label) {
            this.name = name;
            this.cname = cname;
            this.status = status;
            this.label = label;
        }

        var devMap = new Map();

        ExDevStatusSvc = {
            ini_complete: false,
            statusMap: new Map()

        };

        ExDevStatusSvc.listenForComm = function() {

            for (var key of ExDevStatusSvc.statusMap.keys()) {
              var value = ExDevStatusSvc.statusMap.get(key);
                for (var dev in cvt[key]) {
                    value.find(function(v, index, array) {
                        if (v.name === cvt[key][dev].id) {
                          var device_ = new Device(v.name, v.cname, true, cvt[key][dev].label);

                          array[index] = device_;
                          ExDevStatusSvc.statusMap.set(key, array);
                            return true;
                        } else {
                            return false;
                        }

                    });

                }
            }
            $rootScope.$broadcast('deviceStatusRefresh');
        };

        // Used to poll web service to retrieve INI file
        // On successful retrieval, this should no longer be called.
        ExDevStatusSvc.get_ini = function() {
            var req = {
                method: 'GET',
                url: net.address() + 'General/getINI',
                headers: {
                    'Content-Type': 'application/text'
                }
            };

            promise = $http(req).then(
                function(response) {
                    data = response.data;

                    // Let the poller know that the retrieval was good...
                    ExDevStatusSvc.ini_complete = true;

                    // Decode the ini file to get what we need...
                    ExDevStatusSvc.statusMap = decode_str(data);
                },
                function() {
                    console.log('get failed');
                });

        };

        function decode_str(ini) {
            var lines = ini.split(/[\r\n]+/g);
            flag = false;
            current_device = "";
            index = -1;
            pindex = -1;
            var deviceMap = new Map();
            // Assume that TEC is always in file...
            var devices = ["[PPT]", "[Vaisala]", "[Meerstetter]", "[Alicat]"];

            lines.forEach(parseLine);

            function parseLine(line) {
                if (!flag) {
                    index = devices.indexOf(line);
                    if (devices.indexOf(line) >= 0) {
                        current_device = devices[index];
                        flag = true;
                    }
                } else {
                    if (line.indexOf("IDs") >= 0) {
                        var splitLine = line.split("=");
                        var names = splitLine[1].split(",");
                        current_device = current_device.replace('[', '');
                        current_device = current_device.replace(']', '');
                        var cname = current_device;
                        current_device = current_device.toLowerCase();
                        if (current_device == 'meerstetter') {
                            current_device = 'mTEC';
                        }

                        var devObjArray = [];
                        for (var name in names) {
                            if (isEmpty(devObjArray)) {
                                devObjArray = [new Device(names[name].trim(), cname, false, 'no-op')];
                            } else {
                                devObjArray.push(new Device(names[name].trim(), cname, false, 'no-op'));
                            }

                        }
                        deviceMap.set(current_device, devObjArray);
                        flag = false;
                    }

                }
            }
            return deviceMap;
        }

        function isEmpty(obj) {
            for (var prop in obj) {
                if (obj.hasOwnProperty(prop))
                    return false;
            }

            return true;
        }

        return ExDevStatusSvc;
    }
})();
