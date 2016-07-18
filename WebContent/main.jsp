<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <jsp:include page="./common/bs_fish_h.jsp">
    	<jsp:param  name="main" value="modules/common/main" />
    </jsp:include>
    <%

		String version=(new java.util.Date()).getTime()+"";
	    response.setHeader("Pragma","No-cache"); 
		response.setHeader("Cache-Control","no-cache"); 
		response.setDateHeader("Expires", 0); 
	%>

    <link rel="stylesheet" href="modules/common/styles/cloud-proj-all.css?v=<%=version%>">
  
    <!--[if IE 8]>
    <script type="text/javascript" src="resources/html5shiv/html5shiv-r29.min.js?v=<%=version%>"></script>
	<script type="text/javascript" src="resources/fish/fish/libs/bootstrap/respond.js?v=<%=version%>"></script>
	<script type="text/javascript" src="resources/es5-shim-4.1.13/es5-shim.min.js?v=<%=version%>"></script>
    <![endif]-->
    
</head>
<body class="skin-blue-light sidebar-mini">

</body>
</html>
