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
    var basePath='<%=basePath%>';//基地址
    var codeVer='<%=version%>',codeVerP='?v='+codeVer;//发布的版本号
 var userMenus=null;
</script>

<link rel="stylesheet" href="<%=basePath%>resources/fish/fish-desktop/css/fish-desktop-portal.min.css">
<script type="text/javascript" src="<%=basePath%>resources/fish/fish-desktop/js/fish-desktop-all.min.js"></script>
<%-- 开始添加第三方插件 --%>
<%-- font-awesome字体图标 --%>	
<link rel="stylesheet" href="<%=basePath%>resources/font-awesome-4.3.0/css/font-awesome.min.css" />
<%-- 添加第三方结束 --%>	
	
<%-- 程序入口 --%>	
<script type="text/javascript"
	src="<%=basePath%>resources/fish/fish-desktop/js/fish-desktop-require.js?v=<%=version%>"
	data-main="<%=request.getParameter("main")%>"></script>

