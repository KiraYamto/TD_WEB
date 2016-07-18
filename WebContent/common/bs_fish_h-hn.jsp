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
</script>
<script type="text/javascript">
    var basePath='<%=basePath%>';//地址
    var codeVer='<%=version%>',codeVerP='?v='+codeVer;//版本号
    var currentUser=<%=com.ztesoft.cloud.utils.helper.json.GsonUtils.toJson(request.getSession().getAttribute("currentUser")) %>;
    var currentJob=<%=com.ztesoft.cloud.utils.helper.json.GsonUtils.toJson(request.getSession().getAttribute("currentJob")) %>;
    var userMenus=<%=com.ztesoft.cloud.utils.helper.json.GsonUtils.toJson(request.getSession().getAttribute("menus")) %>;

    var currentPrivs=<%=com.ztesoft.cloud.utils.helper.json.GsonUtils.toJson(request.getSession().getAttribute("currentPrivs")) %>;
    
    </script>
<%-- <base href="<%=basePath%>" /> --%>
<!-- base标签指定了资源默认的加载路径,会影响requireJS入口路径-->
<link rel="stylesheet"
	href="<%=basePath%>resources/font-awesome-4.3.0/css/font-awesome.min.css?v=<%=version%>">

	<link rel="stylesheet"
	href="<%=basePath%>resources/fish/fish-desktop/css/fish-desktop-portal.css?v=<%=version%>">

<link rel="stylesheet"
	href="<%=basePath%>resources/fish/fish-desktop/third-party/pagesidebar/pagesidebar.css?v=<%=version%>">
<link rel="stylesheet"
	href="<%=basePath%>resources/fish/fish-desktop/third-party/fileupload/fileupload.css?v=<%=version%>">
<link rel="stylesheet"
	href="<%=basePath%>resources/fonts-icon/fonts-icon.css?v=<%=version%>">
<%-- <link rel="stylesheet" href="<%=basePath%>resources/idc/idccommon.css"> --%>

<script type="text/javascript"
	src="<%=basePath%>resources/fish/fish-desktop/js/fish-desktop-all.js?v=<%=version%>"></script>

<script type="text/javascript"
	src="<%=basePath%>resources/echarts/echarts.js?v=<%=version%>"></script>
<script type="text/javascript"
	src="<%=basePath%>resources/echarts/china-main-city/henan-main-city-map.js?v=<%=version%>"></script>
<script type="text/javascript"
	src="<%=basePath%>resources/echarts/henan.js?v=<%=version%>"></script>
<script type="text/javascript"
	src="<%=basePath%>resources/fish/fish-desktop/third-party/pagesidebar/fish.pagesidebar.js?v=<%=version%>"></script>
<script type="text/javascript"
	src="<%=basePath%>resources/fish/fish-desktop/locale/fish-desktop-locale.zh.js?v=<%=version%>"></script>
<script type="text/javascript"
	src="<%=basePath%>resources/fish/fish-desktop/locale/fish-desktop-locale.en.js?v=<%=version%>"></script>
<script type="text/javascript"
	src="<%=basePath%>resources/fish/fish-desktop/third-party/fileupload/fish.fileupload.js?v=<%=version%>"></script>
	<script type="text/javascript"
	src="<%=basePath%>resources/fish/proj-plugins/cloud-destop-shim.js?v=<%=version%>"></script>
	<script type="text/javascript"
	src="<%=basePath%>resources/zeroclipboard/ZeroClipboard.min.js?v=<%=version%>"></script>
<script type="text/javascript"
	src="<%=basePath%>resources/fish/fish-desktop/js/fish-desktop-require.js?v=<%=version%>"
	data-main="<%=request.getParameter("main")%>"></script>
	<script type="text/javascript">
   if(userMenus){
    	userMenus=_.sortBy(userMenus, function(m){ return m.homePageSeq; });
    }
    </script>
