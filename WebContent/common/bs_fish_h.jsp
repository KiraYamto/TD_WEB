<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>

<%
/*
 * 获取地址
 */
	String path = request.getContextPath();
	String basePath = request.getScheme() + "://"
			+ request.getServerName() + ":" + request.getServerPort()
			+ path + "/";
	String version=(new java.util.Date()).getTime()+"";
%>
<script type="text/javascript">
/*
 * 添加ie浏览器String的endsWith和startsWith方法
 */
if(!String.prototype.endsWith){
	String.prototype.endsWith=function(s){
	 if(s==null||s==""||this.length==0||s.length>this.length)
	    return false;
	 if(this.substring(this.length-s.length)==s)
	    return true;
	 else
	    return false;
	 return true;
	}
}
if(!String.prototype.startsWith){
	String.prototype.startsWith=function(s){
	 if(s==null||s==""||this.length==0||s.length>this.length)
	  return false;
	 if(this.substr(0,s.length)==s)
	    return true;
	 else
	    return false;
	 return true;
	}
}

/*
 * 添加ES5的语法map，用es5-shim应该可以去掉这一段
 */
//Production steps of ECMA-262, Edition 5, 15.4.4.19
//Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
	 Array.prototype.map = function(callback, thisArg) {
	
	     var T, A, k;
	
	     if (this == null) {
	         throw new TypeError(" this is null or not defined");
	     }
	
	     // 1. Let O be the result of calling ToObject passing the |this| value as the argument.
	     var O = Object(this);
	
	     // 2. Let lenValue be the result of calling the Get internal method of O with the argument "length".
	     // 3. Let len be ToUint32(lenValue).
	     var len = O.length >>> 0;
	
	     // 4. If IsCallable(callback) is false, throw a TypeError exception.
	     // See: http://es5.github.com/#x9.11
	     if (typeof callback !== "function") {
	         throw new TypeError(callback + " is not a function");
	     }
	
	     // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
	     if (thisArg) {
	         T = thisArg;
	     }
	
	     // 6. Let A be a new array created as if by the expression new Array(len) where Array is
	     // the standard built-in constructor with that name and len is the value of len.
	     A = new Array(len);
	
	     // 7. Let k be 0
	     k = 0;
	
	     // 8. Repeat, while k < len
	     while(k < len) {
	
	         var kValue, mappedValue;
	
	         // a. Let Pk be ToString(k).
	         //   This is implicit for LHS operands of the in operator
	         // b. Let kPresent be the result of calling the HasProperty internal method of O with argument Pk.
	         //   This step can be combined with c
	         // c. If kPresent is true, then
	         if (k in O) {
	
	             // i. Let kValue be the result of calling the Get internal method of O with argument Pk.
	             kValue = O[ k ];
	
	             // ii. Let mappedValue be the result of calling the Call internal method of callback
	             // with T as the this value and argument list containing kValue, k, and O.
	             mappedValue = callback.call(T, kValue, k, O);
	
	             // iii. Call the DefineOwnProperty internal method of A with arguments
	             // Pk, Property Descriptor {Value: mappedValue, : true, Enumerable: true, Configurable: true},
	             // and false.
	
	             // In browsers that support Object.defineProperty, use the following:
	             // Object.defineProperty(A, Pk, { value: mappedValue, writable: true, enumerable: true, configurable: true });
	
	             // For best browser support, use the following:
	             A[ k ] = mappedValue;
	         }
	         // d. Increase k by 1.
	         k++;
	     }
	
	     // 9. return A
	     return A;
	 };
}
</script>
<script type="text/javascript">
    var basePath='<%=basePath%>';//基地址
    var userMenus=null;
    var codeVer='<%=version%>',codeVerP='?v='+codeVer;//发布的版本号
  <%--   var currentUser=<%=com.ztesoft.cloud.utils.helper.json.GsonUtils.toJson(request.getSession().getAttribute("currentUser")) %>;//当前登录人
    var currentJob=<%=com.ztesoft.cloud.utils.helper.json.GsonUtils.toJson(request.getSession().getAttribute("currentJob")) %>;//职位
    var userMenus=<%=com.ztesoft.cloud.utils.helper.json.GsonUtils.toJson(request.getSession().getAttribute("menus")) %>;//菜单
    var currentPrivs=<%=com.ztesoft.cloud.utils.helper.json.GsonUtils.toJson(request.getSession().getAttribute("currentPrivs")) %>;//权限 --%>
    
</script>
<%-- <base href="<%=basePath%>" /> --%>
<!-- base标签指定了资源默认的加载路径,会影响requireJS入口路径，不能添加 -->

<link rel="stylesheet"
	href="<%=basePath%>resources/fish/fish-desktop/css/fish-desktop-portal.min.css" />
	
<%-- 开始添加第三方插件 --%>
<%-- font-awesome字体图标 --%>	
<link rel="stylesheet"
	href="<%=basePath%>resources/font-awesome-4.3.0/css/font-awesome.min.css" />

<link rel="stylesheet"
	href="<%=basePath%>resources/fish/fish-desktop/third-party/pagesidebar/pagesidebar.css" />
<link rel="stylesheet"
	href="<%=basePath%>resources/fish/fish-desktop/third-party/fileupload/fileupload.css" />
<link rel="stylesheet" href="<%=basePath%>resources/fonts-icon/fonts-icon.css" />
<%-- 网管的监控网格样式 --%>	
<link rel="stylesheet" href="<%=basePath%>resources/fish/proj-plugins/css/monitorgrid.css?v=<%=version%>" />

<script type="text/javascript"
	src="<%=basePath%>resources/fish/fish-desktop/js/fish-desktop-all.min.js"></script>

<script type="text/javascript"
	src="<%=basePath%>resources/echarts/echarts.min.js"></script>
<script type="text/javascript"
        src="<%=basePath%>resources/echarts/map/js/china.js"></script>
<script type="text/javascript"
	src="<%=basePath%>resources/echarts/china-main-city/henan-main-city-map.js"></script>
<script type="text/javascript"
	src="<%=basePath%>resources/echarts/henan.js"></script>
<script type="text/javascript"
	src="<%=basePath%>resources/fish/fish-desktop/third-party/pagesidebar/fish.pagesidebar.js"></script>
<script type="text/javascript"
	src="<%=basePath%>resources/fish/fish-desktop/locale/fish-desktop-locale.zh.min.js"></script>
<script type="text/javascript"
	src="<%=basePath%>resources/fish/fish-desktop/locale/fish-desktop-locale.en.min.js"></script>
<script type="text/javascript"
	src="<%=basePath%>resources/fish/fish-desktop/third-party/fileupload/fish.fileupload.js"></script>

<script type="text/javascript" src="<%=basePath%>resources/zeroclipboard/ZeroClipboard.min.js"></script>
<link rel="stylesheet" href="<%=basePath%>resources/gridster/jquery.gridster.min.css" />
<script type="text/javascript"
	src="<%=basePath%>resources/gridster/jquery.gridster.min.js"></script>

<%-- fullcalendar日历插件 --%>	
<link rel="stylesheet" href="<%=basePath%>resources/fullcalendar/fullcalendar.min.css" />
<script type="text/javascript"
	src="<%=basePath%>resources/fullcalendar/moment.min.js"></script>
<script type="text/javascript"
	src="<%=basePath%>resources/fullcalendar/fullcalendar.min.js"></script>
<script type="text/javascript" src="<%=basePath%>resources/echarts/map/js/china.js?v=<%=version%>"></script>
<%-- 添加第三方结束 --%>	
<script type="text/javascript"
	src="<%=basePath%>resources/fish/proj-plugins/cloud-destop-shim.js?v=<%=version%>"></script>
<%-- 添加定制方法 --%>
<%-- swfobject兼容IE8、9 websocket --%>
 <!--[if LTE IE 9]>
 	
    <script type="text/javascript" src="<%=basePath%>resources/swfobject/swfobject.js"></script>
	<script type="text/javascript" src="<%=basePath%>resources/swfobject/web_socket.js"></script>
<![endif]-->
<%-- 程序入口 --%>	
<script type="text/javascript"
	src="<%=basePath%>resources/fish/fish-desktop/js/fish-desktop-require.js?v=<%=version%>"
	data-main="<%=request.getParameter("main")%>"></script>
<script type="text/javascript">
   if(userMenus){
    	userMenus=_.sortBy(userMenus, function(m){ return m.homePageSeq; });
    }
</script>


	
