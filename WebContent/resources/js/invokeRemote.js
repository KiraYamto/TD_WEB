var gWebAbsPath="/BUSI2IOM",gLangCode="zh_cn",gWebDebug=true,gTimeout=-1;//window.onerror=ViewError;

function InvokeRemoteFunction(classPathName, methodName) {
	var paramArray = new Array();
	var j=0;
	for ( var i = 2; i < arguments.length; i++) {
		paramArray[j++] = JSON.stringify(arguments[i]);
		//var  cToObj  = eval("("+arguments[i]+")");
		//alert(typeof(cToObj)); 
		//paramArray[j++] = JSON.stringify(arguments[i]);
		
	}
	//alert(paramArray);
	return _InvokeRemoteFunction(classPathName, methodName,paramArray);
};


function InvokeRemoteFunctionNoTrans(classPathName, methodName) {
	var paramArray = new Array();
	var j=0;
	for ( var i = 2; i < arguments.length; i++) {
		paramArray[j++] = JSON.stringify(arguments[i]);
	}
	return _InvokeRemoteFunction(classPathName, methodName,paramArray);
};


function _InvokeRemoteFunction(classPathName, methodName,paramJsonStrArr) {

	var url = gWebAbsPath+"/BusiInvokeServlet/invokeRemote";
	var param = {
		classPathName : classPathName,
		methodName : methodName,
		paramJsonStrArr:paramJsonStrArr
	};
	var sendContent;
	if (window.ActiveXObject) {
		ajax = new ActiveXObject("MSXML2.XmlHttp");
	} else {
		ajax = new XMLHttpRequest();
	}
	try {
		
		sendContent = JSON.stringify(param);
		ajax.open("POST", url, false);
		ajax.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		ajax.send(sendContent);
		if (ajax.readyState == 4) {
			if (ajax.status == 200) {
				if(ajax.responseText!=null && ajax.responseText!=''){
					try {
						var responseObj = eval('('+ajax.responseText+ ')');
						if(responseObj.successFlag == true){
							return responseObj.resultObj;
						}else{
							throw new _InvokeError(responseObj);
						}
					} catch (e) {
						 throw new Error(0,"Network issue or remote server issue");
					}
				}
				return returnObj;
			}
		}
	} catch (e) {
		throw new Error(0,"Network issue or remote server issue");
	}
};
var sendUrl = gWebAbsPath+"/BusiInvokeServlet/invokeRemote";
function callRemoteFunctionAsyn(callbackInfo,classPathName, methodName) {
	
	var paramJsonStrArr = new Array();
	var j=0;
	for ( var i = 3; i < arguments.length; i++) {
		paramJsonStrArr[j++] = JSON.stringify(arguments[i]);
	}
	var param = {
			classPathName : classPathName,
			methodName : methodName,
			paramJsonStrArr:paramJsonStrArr
	};

	if (window.ActiveXObject) {
		var ajaxAsyn = new ActiveXObject("MSXML2.XmlHttp");
	} else {
		ajaxAsyn = new XMLHttpRequest();
	}
	var sendContent;
	try{
		sendContent = JSON.stringify(param);
		// true和false决定是同步还是异步
		ajaxAsyn.open("POST", sendUrl , true);
		ajaxAsyn.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		ajaxAsyn.send(sendContent);
		
		if('undefined'!=typeof(callbackInfo) && 'undefined'!=typeof(callbackInfo.callbackFunc)){
			var callbackFunc = callbackInfo.callbackFunc;
			var cbParams = callbackInfo.params;
			ajaxAsyn.onreadystatechange = function(){
				if (ajaxAsyn.readyState == 4) {
					if (ajaxAsyn.status == 200) {
						var resultObj;
						if(ajaxAsyn.responseText!=null && ajaxAsyn.responseText!=''){
							try {
								var responseObj = eval('('+ajaxAsyn.responseText+ ')');
								if(responseObj.successFlag == true){
									resultObj = responseObj.resultObj;
								}else{
									throw new _InvokeError(responseObj);
								}
							} catch (e) {
								 throw new Error(0,"Network issue or remote server issue");
							}
						}
						callbackFunc(cbParams,resultObj);
					}
				}
		   }
		}
	} catch (e) {
		throw new Error(0,"Network issue or remote server issue");
	}
};


function _InvokeError(obj) {
	var e1 = new Error(0, obj.errorMsg);
	e1.code = obj.errorCode;
	e1.resolve = obj.errorName;
	e1.detail = obj.errorMsg;
	e1.toString = function() {
		return (e1.description + ((e1.resolve && "" != e1.resolve) ? "\n"
				+ e1.resolve : ""));
	};
	return e1;
}
