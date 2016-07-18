/*$("#searchField").click(function() {
   if ($("#searchField").val() == "DATETIME"){
       $('#searchValue').hide("fast");
       $('#datetimepicker').show();
   }
   else{
       $('#datetimepicker').hide("fast");
       $('#searchValue').show();
   }
});*/
$(function() {
	publicInit();
	String.prototype.trim=function(){return $.trim(this);}
	
});

Date.prototype.format = function(fmt) {
	fmt = fmt || 'yyyy-MM-dd hh:mm:ss';
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

if ($.fn && $.fn.datetimepicker) {
	$('#dateCreateTime').datetimepicker({
		format : "yyyy-mm-dd hh:ii:00",// yyyy-mm-dd
		weekStart : 1,
		todayHighlight : true,
		pickerPosition : "bottom-right",
		todayBtn : true,
		startView : 2,
		minView : 0,
		forceParse : false
	});

	$('#dateStartTime').datetimepicker({
		format : "yyyy-mm-dd hh:ii:00",
		weekStart : 1,
		todayHighlight : true,
		pickerPosition : "bottom-right",
		todayBtn : true,
		startView : 2,
		minView : 0,
		forceParse : false
	});

	$('#dateEndTime').datetimepicker({
		format : "yyyy-mm-dd hh:ii:59",
		weekStart : 1,
		todayHighlight : true,
		pickerPosition : "bottom-right",
		todayBtn : true,
		startView : 2,
		minView : 0,
		forceParse : false
	});
}

// 写cookies
function setCookie(name, value) {
	var Days = 30;
	var exp = new Date();
	exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
	document.cookie = name + "=" + escape(value) + ";expires="
			+ exp.toGMTString();
}

// 读取cookies
function getCookie(name) {
	var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");

	if (arr = document.cookie.match(reg))
		return unescape(arr[2]);
	else
		return null;
}

// 删除cookies
function delCookie(name) {
	var exp = new Date();
	exp.setTime(exp.getTime() - 1);
	var cval = getCookie(name);
	if (cval != null)
		document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
}
function publicInit() {
	if ($.fn.layout) {
		$('.xlayout').each(function(){
			$(this).layout({
				defaults : {
					fxName : "slide",
					fxSpeed : "slow",
					spacing_closed : 10,
					spacing_open : 0,
					paneClass:""
				}
			});
		})
	}
}
