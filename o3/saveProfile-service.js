(function(){
	angular.module('main')
	.factory('ExSaveCalData', function(){
		/**
		 * @ngdoc service
		 * @name main.service:ExSaveCalData
		 *
		 * @description
		 * This service stores information regarding data in the calibration table.
		 */
		var savedData = {
			data: [],
			setData: function(d){
				this.data = d;
			},
			getData:function(){
				return this.data;
			}
		};
		return savedData;
	});
})();
