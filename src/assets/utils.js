var ajaxfn = function(url, type, datatype, data, fn) {
	/*异步调用函数*/
	$.ajax({
		"url": url,
		"type": type,
		"async": true,
		"xhrFields": {
			"withCredentials": true
		},
		"dataType": datatype,
		"data": data,
		"success": function(res) {
			fn(res);
		},
		"error": function(XMLHttpRequest, textStatus, errorThrown) {
			var result = XMLHttpRequest.status + "," + XMLHttpRequest.readyState + "," + textStatus;
			fn(result);
		}
	});
};
var queryToObj = function() {
	var res = {};
	var search = location.search.substr(1);
	console.log(search);
	search.split('&').forEach(paramStr => {
		var arr = paramStr.split('=');
		var key = arr[0];
		var val = arr[1];
		res[key] = val;
	});
	return res;
};
var IsPC = function() {
	var userAgentInfo = navigator.userAgent;
	var Agents = ["Android", "iPhone",
		"SymbianOS", "Windows Phone",
		"iPad", "iPod"
	];
	var flag = true; /* pc端是true,手机端是false */
	for (var v = 0; v < Agents.length; v++) {
		if (userAgentInfo.indexOf(Agents[v]) > 0) {
			flag = false;
			break;
		}
	}
	return flag;
}();
var dataNow = (function() {
	function checktime(i) {
		if (i < 10) {
			i = '0' + i;
		};
		return i;
	};
	var mydata = new Date();
	var y = mydata.getFullYear();
	var month = mydata.getMonth() + 1;
	var d = checktime(mydata.getDate());
	return y + '-' + month + '-' + d;
})();
export {
	ajaxfn,
	queryToObj,
	IsPC,
	dataNow
}
