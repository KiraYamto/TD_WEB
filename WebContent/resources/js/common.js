var basePath =basePath?basePath:"/BUSI2IOM";
var base = window.location.protocol + "//" + window.location.host + basePath;
var loginWindowLayerIndex = -1;
var session;
// Array.prototype.contains = function(e) {
// for (i = 0; i < this.length && this[i] != e; i++)
// ;
// return !(i == this.length);
// }
Date.prototype.Format = function(fmt) {
	fmt = fmt || "yyyy-MM-dd hh:mm:ss";
	var o = {
		"M+" : this.getMonth() + 1, // 月份
		"d+" : this.getDate(), // 日
		"h+" : this.getHours(), // 小时
		"m+" : this.getMinutes(), // 分
		"s+" : this.getSeconds(), // 秒
		"q+" : Math.floor((this.getMonth() + 3) / 3), // 季度
		"S" : this.getMilliseconds()
	// 毫秒
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "")
				.substr(4 - RegExp.$1.length));
	for ( var k in o)
		if (new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k])
					: (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

function trim(value) {
	return this.replace(/(^\s*)|(\s*$)/g, "");
}

$(function() {
	initAlert();
	initUUID();
	// 判断权限
	authFilter();
	// initDateTime();
	String.prototype.trim = function() {
		return $.trim(this);
	}

	// 初始化日期空间
	initLaydate();
	// 初始化ztitle
	initZtitle();
	// 初始化Math.uuid

	// 初始化 input浮动的label
	initFloatLabel();
});

function initDateTime() {
	$('.mydatetime')
			.datetimebox(
					{
						formatter : function(date) {
							return date.getFullYear() + '-'
									+ (date.getMonth() + 1) + '-'
									+ date.getDate() + ' ' + date.getHours()
									+ ':' + date.getMinutes() + ":"
									+ date.getSeconds();
						},
						showSeconds : true
					});
}

function initRadioByClass(className) {
	$("." + className).css("cursor", "pointer");
	$("." + className)
			.bind(
					"click",
					function() {
						var clickRadio = this;
						$("." + className)
								.each(
										function() {
											var radio = $(this).attr("type") == "radio" ? $(this)
													: $(this)
															.find(
																	"input[type='radio']");
											if (this != clickRadio) {
												radio.attr("checked", false);
											} else {
												radio[0].click();
											}
										});
					});
}

/**
 * 同步调用
 */
function callRemoteFunction(param) {
	var ret;
	param.params = JSON.stringify(param.params);
	$.ajax({
		async : false,
		url : base + "/servlets/ActionRemote",
		type : 'post',
		data : param,
		success : function(data) {
			// ret = data;
			var result = eval('(' + data + ')');
			try {
				if (result.result == 'true') {
					ret = result.detail;
				} else {
					var errorWin = $(errorDetailWin(result));
					errorWin.window({
						title : "出现异常",
						width : 700,
						height : 400,
						modal : true
					});
				}
			} catch (e) {
				// $.messager.alert("提示", "同步调用失败!");
				// alert("同步调用失败！");
				fish.showError(result.message);
			}

		},
		error : function(data) {
			// $.messager.alert("提示", "同步调用失败!");
			// alert("同步调用失败");
			fish.showError('同步调用失败!');
		}
	});
	return ret;
}

/**
 * 异步 param格式： { className : "com.ztesoft.oss.mobile.monitor.action.ActionTest",
 * methodName : "sayHello", params : "{}" }
 */
function callRemoteFunctionAsyn(param, callBack) {
	var ret;
	param.params = JSON.stringify(param.params);
	$.ajax({
		url : base + "/servlets/ActionRemote",
		type : 'post',
		data : param,
		success : function(data) {
			// ret = data;
			try {
				var result = eval('(' + data + ')');
				if (result.result == 'true') {
					ret = result.detail;
					callBack(ret);
				} else {
					var errorWin = $(errorDetailWin(result));
					errorWin.window({
						title : "出现异常",
						width : 700,
						height : 400,
						modal : true
					});
				}
			} catch (e) {
				fish.showError('异步调用失败!');
			}

		},
		error : function(data) {
			fish.showError('异步调用失败!');
		}
	});
	return ret;
}

/**
 * 通过divid清除input和还原select
 * 
 * @param divId
 */
function clearDivInput(divId) {
	$("#" + divId).find("input[type='text']").each(function() {
		$(this).val("");
	});
	$("#" + divId).find("select").each(function() {
		$(this).get(0).selectedIndex = 0;
	});
}

function showExecptionWindow(message) {
	var execptionWindow = document.createElement("div");
	var content = document.createElement("div");
	$(content).css("padding", "10px");
	var span = document.createElement("span");
	span.innerHTML = message;
	content.appendChild(span);
	execptionWindow.appendChild(content);

	$(execptionWindow).window({
		title : '出现异常',
		width : 700,
		height : 400,
		modal : true,
		closable : true
	});
}

function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null)
		return decodeURI(r[2]);
	return null;
}

function newLinkWindow(option) {
	var flowWindow = document.createElement("div");
	var iframe = document.createElement("iframe");
	$(iframe).attr("src", option.href);
	$(iframe).attr("frameborder", "no");
	$(iframe).css("height", "100%");
	$(iframe).css("width", "100%");
	flowWindow.appendChild(iframe);
	$(flowWindow).window({
		title : option.title ? option.title : "new window",
		minimizable : false,
		width : option.width ? option.width : 800,
		height : option.height ? option.height : 500,
		modal : true,
		closable : true
	});
}

/*
 * function exportExcel(url) { window.location.href=base + "/ExportExcel?"+url
 * $.ajax({ async : false, url : base + "/ExportExcel", type : 'post', data :
 * option, success : function(data) { ret = data; }, error : function(data) {
 * alert("同步调用失败!") } }); }
 */

function exportExcel(url) {
	url = base + "/ExportExcel?" + url;
	var exportWindow = document.createElement("div");
	var iframe = document.createElement("iframe");
	$(iframe).attr("src", url);
	$(iframe).attr("frameborder", "no");
	$(iframe).css("height", "0px");
	$(iframe).css("width", "0px");
	var span = document.createElement("span");

	$(span).text("下载中...");
	exportWindow.appendChild(iframe);
	exportWindow.appendChild(span);
	$(exportWindow).window({
		title : "导出Excel",
		minimizable : false,
		width : 400,
		height : 200,
		modal : true,
		closable : true
	});
}

function errorWin(result) {
	var ret = '<div id="errorWin">  <div style="text-align: center">  <div id="errorMessage" class="alert-info">'
			+ result.message
			+ '</div>  <a class="easyui-linkbutton" style="padding: 0 5px;"   onclick="showErrorDetail();">查看错误详情</a> '
			+ '<a class="easyui-linkbutton"   style="padding: 0 5px;" onclick="$(\'#errorWin\').window(\'close\')">关 闭  </a> </div> </div>';
	return ret;
}

function errorDetailWin(result) {
	var ret = '<div id="errorDetailWin"> <div style="text-align: center"> <div id="errorMessage" style="color: #31708f;padding: 10px;background-color: #d9edf7;	border-color: #bce8f1;">'
			+ result.message
			+ '</div> <div id="errorDetail" style=" padding: 10px;	text-align: left;">'
			+ result.detail + '</div> </div> </div>';
	return ret;
}
$.fn.serializeObject = function() {
	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name]) {
			if (!o[this.name].push) {
				o[this.name] = [ o[this.name] ];
			}
			o[this.name].push(this.value || '');
		} else {
			o[this.name] = this.value || '';
		}
	});
	return o;
};

/* 合并原来newpublic目录下的common.js */
// 格式化日期,
function formatDate(date, format) {
	var paddNum = function(num) {
		num += "";
		return num.replace(/^(\d)$/, "0$1");
	}
	// 指定格式字符
	var cfg = {
		yyyy : date.getFullYear() // 年 : 4位
		,
		yy : date.getFullYear().toString().substring(2)// 年 : 2位
		,
		M : date.getMonth() + 1 // 月 : 如果1位的时候不补0
		,
		MM : paddNum(date.getMonth() + 1) // 月 : 如果1位的时候补0
		,
		d : date.getDate() // 日 : 如果1位的时候不补0
		,
		dd : paddNum(date.getDate())// 日 : 如果1位的时候补0
		,
		hh : date.getHours() // 时
		,
		mm : date.getMinutes() // 分
		,
		ss : date.getSeconds()
	// 秒
	}
	format || (format = "yyyy-MM-dd hh:mm:ss");
	return format.replace(/([a-z])(\1)*/ig, function(m) {
		return cfg[m];
	});
}

// 打开窗体--easyui-window
var openModalWin = function(urlAddr, title, width, height, params) {
	var iframe = '<iframe src="'
			+ urlAddr
			+ '" frameborder="0" style="border:0;width:100%;height:100%;"></iframe>';
	parent.$("<div id='mWin' style='overflow:hidden;'></div>").window({
		title : title, // 窗口的标题文本
		height : height, //
		width : width, //
		content : iframe, // 面板（panel）主体内容
		maximizable : false, // 是否显示最大化按钮
		minimizable : false, // 是否显示最小化按钮
		collapsible : false, // 是否显示折叠按钮
		modal : true, // 窗口是不是模态（modal）窗口
		onClose : function() {
			parent.$("#mWin").dialog("destroy").remove();
		}
	});
};

// queryService 参数
var inputParams = new Array();
function clearParam() {
	inputParams.length = 0;
}
function addParam(_dataType, _name, _value) {
	for (var i = 0; i < this.inputParams.length; i++) {
		if (inputParams[i].ParamName == _name) {
			inputParams[i].ParamValues.push(_value);
			return;
		}
		;
	}
	;
	inputParams.push({
		paramName : _name,
		dataType : _dataType,
		paramValues : [ _value + "" ]
	});
}
/*
 * //queryService的分页过滤器，暂时没有用到。 var dataSetFilter = null; function
 * setDataSetFilter(isPagi, pPage, pageSize, limitCount, orderArr,
 * showFieldArr){ return (typeof(isPagi) != "object") ? { pageFlag: isPagi,
 * pageIndex: pPage, pageLen: pageSize, rowCount: limitCount, orderFields:
 * orderArr, showFields: showFieldArr } : isPagi; }
 */
function callRemoteFunctionQuery(queryName) {
	var queryParams = {
		className : "com.ztesoft.bs.datacommon.client.IomCommonServiceClient",
		methodName : "queryService",
		params : [ queryName, inputParams, null ]
	};
	return callRemoteFunction(queryParams);
}
function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null)
		return decodeURI(r[2]);
	return null;
}

function initLaydate() {
	$(".xlaydate").each(function() {
		var id = $(this).attr("id");
		laydate({
			elem : '#' + id,
			event : 'focus',
			istime : true,
			format : 'YYYY-MM-DD hh:mm:ss',
			choose : function() {
				$('#' + id).change();
			}
		});
	});
}

function authFilter() {
	try {
		$.post(base + "/desktopAction/getSession", function(data) {
			var result = JSON.parse(data);
			session = result.session.attributes;
			if (session && (session.user || session.userId)) {

			} else {
				showLoginWindow();
			}
		})
	} catch (e) {
		console.error("检查登录信息异常!", e);
	}
}
function showLoginWindow() {
	if (window.layer) {
		loginWindowLayerIndex = layer.open({
			type : 2,
			closeBtn : false,
			title : '<i class="glyphicon glyphicon-user" style="padding-right:5px"></i>登陆',
			shadeClose : false,
			shade : 0.8,
			area : [ '500px', '50%' ],
			content : '/BUSI2IOM/newDesktop/login.html' // iframe的url
		});
	}
}

// 初始化ztitle
function initZtitle() {
	if (window.layer) {
		$("[ztitle]").on('mouseover', function() {
			var value = $(this).attr("ztitle");
			var tipsIndex = layer.tips(value, $(this), {
				tips : [ 1, '#3595CC' ],
				time : 5000
			});
			$(this).attr("tipsIndex", tipsIndex);
		});

		$("[ztitle]").on('mouseout', function() {
			var value = $(this).attr("tipsIndex");
			layer.close(value);
		});
	}
}

function initUUID() {
	var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
			.split('');

	Math.uuid = function(len, radix) {
		var chars = CHARS, uuid = [], i;
		radix = radix || chars.length;

		if (len) {
			// Compact form
			for (i = 0; i < len; i++)
				uuid[i] = chars[0 | Math.random() * radix];
		} else {
			// rfc4122, version 4 form
			var r;

			// rfc4122 requires these characters
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';

			// Fill in random data. At i==19 set the high bits of clock sequence
			// as
			// per rfc4122, sec. 4.1.5
			for (i = 0; i < 36; i++) {
				if (!uuid[i]) {
					r = 0 | Math.random() * 16;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
				}
			}
		}

		return uuid.join('');
	};

	// A more performant, but slightly bulkier, RFC4122v4 solution. We boost
	// performance
	// by minimizing calls to random()
	Math.uuidFast = function() {
		var chars = CHARS, uuid = new Array(36), rnd = 0, r;
		for (var i = 0; i < 36; i++) {
			if (i == 8 || i == 13 || i == 18 || i == 23) {
				uuid[i] = '-';
			} else if (i == 14) {
				uuid[i] = '4';
			} else {
				if (rnd <= 0x02)
					rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
				r = rnd & 0xf;
				rnd = rnd >> 4;
				uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
			}
		}
		return uuid.join('');
	};

	// A more compact, but less performant, RFC4122v4 solution:
	Math.uuidCompact = function() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
				function(c) {
					var r = Math.random() * 16 | 0, v = c == 'x' ? r
							: (r & 0x3 | 0x8);
					return v.toString(16);
				});
	};

}
function initAlert() {
	if (window.layer) {
		window.sysAlert = window.alert;
		window.alert = layer.msg;
	}
}

// 数组扩展
function initArrayMethod() {

	Array.prototype.indexOf = Array.prototype.indexOf || function(e) {
		for (var i = 0, j; j = this[i]; i++) {
			if (j == e) {
				return i;
			}
		}
		return -1;
	}
	Array.prototype.lastIndexOf = Array.prototype.lastIndexOf || function(e) {
		for (var i = this.length - 1, j; j = this[i]; i--) {
			if (j == e) {
				return i;
			}
		}
		return -1;
	}
}

function initFloatLabel() {
	var floatLabels = $(".z-floatLabel");
	if (floatLabels.length > 0 && floatLabels.floatLabel) {
		floatLabels.floatLabel();
	}
}

function floatLabel(inputType) {
	$(inputType).each(function() {
		var $this = $(this);
		$this.focus(function() {
			$this.next().addClass('active');
		});
		$this.blur(function() {
			if ($this.val() === '' || $this.val() === 'blank') {
				$this.next().removeClass();
			}
		});
	});
}

function zAjax() {
	var url, param, callback, dataType;
	if (arguments.length <= 0) {
		throw new Error("参数个数不能为0!");
	} else {
		if (arguments.length > 1) {
			url = arguments[0];
		}
		switch (arguments.length) {
		case 2:
			callback = arguments[1];
			param = {};
			dataType = 'html';
			break;
		case 3:
			param = arguments[1];
			callback = arguments[2];
			dataType = 'html';
			break;
		case 4:
			param = arguments[1];
			callback = arguments[2];
			dataType = arguments[3];
			break;
		default:
			param = arguments[1];
			callback = arguments[2];
			dataType = arguments[3];
			break;
		}
	}
	$.ajax({
		type : 'POST',
		url : url,
		data : param,
		beforeSend : function(request) {
			request.setRequestHeader("userType", "ajax");
		},
		success : function(ret) {
			zAjaxSuccess(ret, callback);
		},
		dataType : dataType,
		error : function(xmlHttpRequest, error, throwObj) {
			// 请求抛出了异常
			var layerIndex = layer.alert(xmlHttpRequest.status + " "
					+ xmlHttpRequest.statusText, {
				icon : 7,
				title : '错误',
				skin : 'layer-ext-moon'
			})
		}
	});
}
// 解析ajax结果
function zAjaxSuccess(ret, callBack) {
	try {
		var ajaxResult = JSON.parse(ret);
		if (ajaxResult.code != 0) {
			alertException(ajaxResult);
		} else {
			callback(arguments);
		}
	} catch (e) {
		// 无法解析成json
		callback(ret);
	}
}

// 显示异常信息
function alertException(ajaxResult) {
	if (ajaxResult.code != 0) {
		// 后台抛出了异常
		var layerIndex = layer
				.alert(
						ajaxResult.msg,
						{
							icon : 7,
							title : '出现异常',
							skin : 'layer-ext-moon',
							btn : [ '查看异常详情', '关闭' ]
						},
						function() {
							var content = "<pre style='height:100%;width:100%;padding:0px;margin:0px;border-radius:0px;color:red'><pre>异常信息:"+ajaxResult.msg+"</pre>"
									+ ajaxResult.result + "</pre>";
							layer.open({
								type : 1,
								title : '异常详细信息',
								shadeClose : true,
								shade : false,
								maxmin : true, // 开启最大化最小化按钮
								area : [ '800px', '400px' ],
								content : content
							});
							layer.close(layerIndex);
						});
		return false;
	} else {
		layer.alert(ajaxResult.msg, {
			icon : 0,
			title : '信息',
			skin : 'layer-ext-moon'
		});
		return true;
	}
}



function isException(ajaxResult) {
	if (ajaxResult.code && ajaxResult.code != 0) {
		// 后台抛出了异常
		var layerIndex = layer
				.alert(
						ajaxResult.msg,
						{
							icon : 7,
							title : '出现异常',
							skin : 'layer-ext-moon',
							btn : [ '查看异常详情', '关闭' ]
						},
						function() {
							var content = "<pre style='height:100%;width:100%;padding:0px;margin:0px;border-radius:0px;color:red'><pre>异常信息:"+ajaxResult.msg+"</pre>"
									+ ajaxResult.result + "</pre>";
							layer.open({
								type : 1,
								title : '异常详细信息',
								shadeClose : true,
								shade : false,
								maxmin : true, // 开启最大化最小化按钮
								area : [ '800px', '400px' ],
								content : content
							});
							layer.close(layerIndex);
						});
		return true;
	} else {
		return false;
	}
}