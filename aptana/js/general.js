/**
 * @author Matt
 */

/** Store the maximum number of points to be recorded in a 
 * a data plot.  The maximum number of points is placed in the 
 * localStorage object under the key maxSize.
 * @param {Integer} num - number of points to save for plot display
 */
function setMaxStore(num){
	localStorage.maxSize = String(num);
}

/**
 * 
 * @param {String} key
 * @param {Numeric} newVal
 */
function storeData(key, newVal){
	var storedData = JSON.parse(localStorage[key]);
	
	if (storedData.length < localStorage.maxSize){
		storedData.unshift(newVal);
	}
	else{
		storedData.pop();
		storedData.unshift(newVal);
	}
	
	localStorage[key] = JSON.stringify(storedData);
	
}
