<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!-- bootStrap-angularjs -->
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<base href="<%=basePath %>" />
<link rel="stylesheet"
	href="<%=basePath %>resources/bootstrap/css/bootstrap.min.css">
<link rel="stylesheet"
	href="<%=basePath %>resources/font-awesome-4.3.0/css/font-awesome.min.css">
<script type="text/javascript">
var basePath="<%=basePath%>";
</script>
<script type="text/javascript" src="<%=basePath %>resources/jquery/jquery.min.js"></script>
<script type="text/javascript"
	src="<%=basePath %>resources/bootstrap/js/bootstrap.min.js"></script>
<script src="<%=basePath %>resources/layer/layer.js"></script>
<script type="text/javascript" src="<%=basePath %>resources/angularjs/angular2.js"></script>
