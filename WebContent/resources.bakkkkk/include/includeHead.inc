<%@ page language="java" import="java.util.*" contentType="text/html;charset=UTF-8" pageEncoding="UTF-8"%>
<% 
String title = "即时开通";
String path = request.getContextPath(); 
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
%>
<head>
	<base href="<%=basePath%>">
	<meta content="text/html; charset=utf-8" http-equiv="Content-Type">
	<title><%=title %></title>		
	<link rel="stylesheet" type="text/css" href="<%=basePath %>fish/css/fish-desktop.css" />
	<script src="<%=basePath %>fish/js/fish-desktop-all.js"></script>
	<script src="<%=basePath %>resources/js/common.js"></script>
	<script src="<%=basePath %>resources/js/json2.js"></script>
	<script src="<%=basePath %>public/script/invokeRemote.js"></script>
	
</head>

