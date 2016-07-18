<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
   
    <jsp:include page="./common/bs_fish_login_h.jsp">
    	<jsp:param  name="main" value="modules/login/main" />
    </jsp:include>
    <link rel="stylesheet" href="modules/login/style/login.css?v=1.0"> 
    <%
    	response.setHeader("Pragma","No-cache"); 
		response.setHeader("Cache-Control","no-cache"); 
		response.setDateHeader("Expires", 0); 
	%>
    <!-- <script type="text/javascript" src="resources/fish/proj-plugins/cloud-fish-shim.js?v=1.0"></script> -->
</head>
<body>
	
</body>
</body>
</html>
