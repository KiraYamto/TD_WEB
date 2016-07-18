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
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
   
  
    <link rel="stylesheet" href="modules/login/style/login.css?v=1.0"> 
    <%
    	response.setHeader("Pragma","No-cache"); 
		response.setHeader("Cache-Control","no-cache"); 
		response.setDateHeader("Expires", 0); 
	%>
<link rel="stylesheet" href="<%=basePath%>/resources/fish_v2.1.2/css/fish-desktop-default.css" id="themesCss">
<link rel="stylesheet" href="<%=basePath%>/resources/css/pretty-json.css">
<!--json格式化样式文件 -->
<link rel="stylesheet" href="<%=basePath%>/common/css/common.css">
<!-- 项目公共样式文件 -->
<link rel="stylesheet" href="<%=basePath%>/resources/fish_v2.1.2/libs/font-awesome/css/font-awesome.css" type="text/css">
<!--bootstarp 字体 -->


</head>


<script type="text/javascript" src="<%=basePath%>/resources/fish_v2.1.2/js/fish-desktop-all.min.js"></script>
<!-- fish框架Js文件 -->
<script type="text/javascript" src="<%=basePath%>/resources/fish_v2.1.2/locale/fish-desktop-locale.zh.js"></script>
<!-- fish框架语言包Js文件 -->
<script type="text/javascript" src="<%=basePath%>/resources/fish_v2.1.2/libs/bootstrap/html5shiv.js"></script>
<!-- fish框架 bootstrap -->
<script type="text/javascript" src="<%=basePath%>/resources/fish_v2.1.2/libs/bootstrap/respond.js"></script>
<!-- fish框架 bootstrap -->
<script type="text/javascript">
</script>
<script type="text/javascript"
	src="<%=basePath%>resources/fish/fish-desktop/js/fish-desktop-require.js?v=<%=version%>"
	data-main="/newPages/configPages/main"></script>

<script type="text/javascript" >
var contextPath = "<%=basePath%>";
</script>
<body>
	

</body>
</html>