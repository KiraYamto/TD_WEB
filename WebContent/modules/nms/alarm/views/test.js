/**
 * Created by wxh on 2016-2-4.
 */
$(function(){
	var options = {
		check: {
			enable: true,
			chkboxType: {"Y":"", "N":""}
		},
		view: {
			dblClickExpand: false
		},
		data: {
			simpleData: {
				enable: true
			}
		},
		callback: {
			onCheck: onCheck
		},
		fNodes:[
			{id:1, pId:0, name:"北京"},
			{id:2, pId:0, name:"天津"},
			{id:3, pId:0, name:"上海"},
			{id:6, pId:0, name:"重庆"},
			{id:4, pId:0, name:"河北省", open:true, nocheck:true},
			{id:41, pId:4, name:"石家庄"},
			{id:42, pId:4, name:"保定"},
			{id:43, pId:4, name:"邯郸"},
			{id:44, pId:4, name:"承德"},
			{id:5, pId:0, name:"广东省", open:true, nocheck:true},
			{id:51, pId:5, name:"广州"},
			{id:52, pId:5, name:"深圳"},
			{id:53, pId:5, name:"东莞"},
			{id:54, pId:5, name:"佛山"},
			{id:6, pId:0, name:"福建省", open:true, nocheck:true},
			{id:61, pId:6, name:"福州"},
			{id:62, pId:6, name:"厦门"},
			{id:63, pId:6, name:"泉州"},
			{id:64, pId:6, name:"三明"}
		]
	};

	$("#treeDemo").tree(options);
	$("#citySel").click(function(){
		showMenu();
	});
	$("#menuBtn").click(function() {
		showMenu();
		return false;
	});
	$("#tree_select_menu_checkbox_html").position({
		of: $( "#citySel" ),
		my: "left bottom",
		at: "left top"
	}).hide();



	function onCheck(e, treeNode) {
		var nodes = $("#treeDemo").tree("getCheckedNodes",true),
			v = "";
		for (var i=0, l=nodes.length; i<l; i++) {
			v += nodes[i].name + ",";
		}
		if (v.length > 0 ) v = v.substring(0, v.length-1);
		var cityObj = $("#citySel");
		cityObj.attr("value", v);
	}

	function showMenu() {
		$("#tree_select_menu_checkbox_html").slideDown("fast");
		$("body").on("mousedown", onBodyDown);
	}
	function hideMenu() {
		$("#tree_select_menu_checkbox_html").fadeOut("fast");
		$("body").on("mousedown", onBodyDown);
	}
	function onBodyDown(event) {
		if (!(event.target.id == "menuBtn" || event.target.id == "citySel" || event.target.id == "menuContent" || $(event.target).parents("#menuContent").length>0 || event.target.id.indexOf("treeDemo") != -1)) {
			hideMenu();
		}
	}
})