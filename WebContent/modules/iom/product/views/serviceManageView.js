define([
	'text!modules/iom/product/templates/serviceManageView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/serviceManage.css'+codeVerP
], function(serviceManageViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(serviceManageViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		catalogId:null,
		events: {
			'click #service-service-add-btn':'serviceAdd',
			'click #service-service-detail-btn': 'openOrderDetails',
			'click #service-service-mod-btn': 'openOrderUpdate',
			'click #service-service-del-btn': 'deleteSer'
			
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.loadServiceGridRender();
			this.loadServiceCatalogData();
			this.resize();
		},
		resize: function() {
			$("#iom-service-grid").grid("setGridHeight", $('#main-tabs-panel').height()-110);
			$("#iom-service-serviceCatalog").css({"height": $('#main-tabs-panel').height()-80, "overflow":"auto"});
			$("#iom-service-grid").grid("resize");
		},
		//根据目录id查询服务信息
		getSerDataByCatalogId: function(catalogId) { //请求服务器获取数据的方法
			var me=this;
			var map = new Object();
			var rowNum = this.$("#iom-service-grid").grid("getGridParam", "rowNum");
			var page = this.$("#iom-service-grid").grid("getGridParam", "page"); 
			if('' == catalogId || undefined == catalogId || null == catalogId){
				map.catalogId = me.catalogId+"";
			}else{
				map.catalogId = me.catalogId+"";
			}
			map.pageIndex = (page-1);
			map.pageSize = 10;
			$("#iom-service-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb','getServiceList',map).done(function(ret){
				ret = JSON.parse(ret);
				if(ret!=null){
					if(ret.records == 0){
						ret = "";
					} 
					$("#iom-service-grid").grid("reloadData", ret);
				}
			}).fail(function(ret){
    			fish.error({title:'错误',message:'服务管理查询异常'});
    		});
			$("#iom-service-grid").unblockUI().data('blockui-content', false);
		},
		loadServiceGridRender: function() {
			var dcGridPerData = $.proxy(this.getSerDataByCatalogId,this); //函数作用域改变
			this.$("#iom-service-grid").grid({
				datatype: "json",
				height: $(window).height()*0.695,
				colModel: [{
					name: 'NAME',
					label: '服务名称',
					width: 300
				},{
					name: 'CODE',
					width: 220,
					label: '服务编码'
				},{
					name: 'TYPE_NAME',
					width: 220,
					label: '服务归属',
					hidden:true
				},{
					name: 'EDITION',
					width: 220,
					label: '服务版本'
				},{
					name: 'EFF_DATE',
					width: 300,
					label: '生效日期', 
				},{
					name: 'EXP_DATE',
					width: 300,
					label: '失效日期'
				},{
					name: 'CREATED_DATE',
					width: 220,
					label: '创建日期',
					hidden:true
				},{
					name: 'COMMENTS',
					width: 220,
					label: '备注'
				},{
					name: 'ID',
					label: 'ID',
					width: 100,
					hidden:true
				},{
					name: 'SORT_ID',
					label: 'SORT_ID',
					width: 100,
					hidden:true
				},{
					name: 'CATALOG_ID',
					width: 220,
					label: 'CATALOG_ID',
					hidden:true
				}],
				rowNum: 10, 
				datatype: "json",
				pager: true,
				server: true,
				multiselect:false,
				shrinkToFit:false,
				onCellSelect: function(e, rowid, iCol, cellcontent) {
					$("#iom-service-grid").grid("setAllCheckRows",false); 
					if (iCol != 0) {
						$("#iom-service-grid").grid("setCheckRows",[rowid]);
					} 
				},
				pageData: dcGridPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		/* 加载目录信息 */
		loadServiceCatalogData : function(){
			var me=this;
			utils.ajax('cloudIomServiceForWeb','getServiceCatalog').done(function(ret){
				var root = [];
				ret = JSON.parse(ret);
				if (ret){
					$.each(ret, function(i, n) {
						var pId = n.pId;
						if (undefined == pId || '' == pId) {
							n.isParent = true;
						} else if(undefined != pId && '' != pId){
							n.isParent = false;
						}
						else{
							n.isParent = true;
						}
						root.push(n);
					});
				}
				var options = {
						fNodes : root,
						data : {
							key : {
								icon: 'icon'
							},
							simpleData :{
									enable : true,
							},
							keep : {
								parent : true,
								leaf : true
							}
						},
						view: {
							dblClickExpand: false,
							showLine : true,
							showIcon :　false
						},
						callback: {
							onClick: function(e,treeNode, clickFlag) {
								var catalogId = treeNode.id;
								me.catalogId=catalogId;
								me.getSerDataByCatalogId(catalogId);
							},
							onRightClick: $.proxy(me.OnRightClick,me)
						}
				};
				$('#iom-service-serviceCatalog').tree(options);
				$("#iom-service-serviceCatalog").on("contextmenu", function() { // 禁止右击
					return false;
				})
				//在body中增加右键菜单的结构
				$("<ul>").append('<li id="iom-service-m_add" >增加目录</li>')
					.append('<li id="iom-service-m_add_sub" >增加子目录</li>')
					.append('<li id="iom-service-m_update">修改目录</li>')
					.append('<li id="iom-service-m_del" >删除目录</li>')
					.appendTo($('<div id="iom-service-rMenu">')).parent().appendTo("body")
					.click(function(event) {
						var targetId = event.target.id;
						if(targetId == "iom-service-m_add") {
							me.addTreeNode();
						} else if(targetId == "iom-service-m_add_sub") {
							me.addTreeSubNode();
						} else if(targetId == "iom-service-m_del") {
							me.removeTreeNode();
						} else if(targetId == "iom-service-m_update") {
							me.updateTreeNode(true);
						} else if(targetId == "m_unCheck") {
							me.checkTreeNode(false);
						}
					});

				if(root.length>0){
					var nid = root[0].id;
					node = me.$("#iom-service-serviceCatalog").tree("getNodeByParam", 'ID', nid);
					me.$('#iom-service-serviceCatalog').tree("selectNode",node, true);
					me.catalogId=nid;
					me.getSerDataByCatalogId(nid);
				}
			}).fail(function(ret){
    			fish.error({title:'错误',message:'服务目录查询异常'});
    		});
		},
		hideRMenu : function() {
			var me = this;
			var $rMenu = $("#iom-service-rMenu");
			if ($rMenu) $rMenu.css({"visibility": "hidden"});
			$("body").off("mousedown", $.proxy(me.onBodyMouseDown,me));
		},
		showRMenu : function(type, x, y,targetElement) {
			var me = this;
			$("#iom-service-rMenu ul").show();
			if (type=="root") {
				$("#m_del").hide();
				$("#m_check").hide();
				$("#m_unCheck").hide();
			} else {
				$("#m_del").show();
				$("#m_check").show();
				$("#m_unCheck").show();
			}
			$("#iom-service-rMenu").css({"top":y+"px", "left":x+"px", "visibility":"visible"});
			$("body").on("mousedown", $.proxy(me.onBodyMouseDown,me));
		},
		OnRightClick : function(event, treeNode) {
			var me=this;
			if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
				$("#iom-service-serviceCatalog").tree("cancelSelectedNode");
				me.showRMenu("root", event.clientX, event.clientY,event.target);
			} else if (treeNode && !treeNode.noR) {
				$("#iom-service-serviceCatalog").tree("selectNode",treeNode);
				me.showRMenu("node", event.clientX, event.clientY,event.target);
			}
		},
		onBodyMouseDown : function(event){
			if (!(event.target.id == "iom-service-rMenu" || $(event.target).parents("#iom-service-rMenu").length>0)) {
				$("#iom-service-rMenu").css({"visibility" : "hidden"});
			}
		},
		addTreeSubNode : function() {
			var me = this;
			me.hideRMenu();
			var newNode = { name:'',id:'',pId:''};
			var selectedNodes = $("#iom-service-serviceCatalog").tree("getSelectedNodes");
			if (selectedNodes[0]) {
				newNode.checked = selectedNodes[0].checked;
				var pnode = selectedNodes[0];
				var pop =fish.popupView({
					url: 'modules/iom/product/views/serviceCatalogAddView',
					width: "40%",
					viewOption : {
						"selectedNode":selectedNodes[0],
						"pnode":pnode,
						"operateType":"add"
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							e.isParent = false;
							var name = e.NAME;
							var code = e.CODE;
							var id = e.ID;
							var pId = e.PARENT_ID;
							newNode = { name:name,CODE:code,id:id,pId:pId};
							$("#iom-service-serviceCatalog").tree("addNodes",pnode,newNode);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			} else {
				$("#iom-service-serviceCatalog").tree("addNodes",null,newNode);
			}
		},
		addTreeNode : function() {
			var me = this;
			me.hideRMenu();
			var newNode = { name:'',id:'',pId:''};
			var selectedNodes = $("#iom-service-serviceCatalog").tree("getSelectedNodes");
			if (selectedNodes[0]) {
				newNode.checked = selectedNodes[0].checked;
				var pnode = me.$("#iom-service-serviceCatalog").tree("getNodeByParam", 'id', selectedNodes[0].pId);
				var pop =fish.popupView({
					url: 'modules/iom/product/views/serviceCatalogAddView',
					width: "40%",
					viewOption : {
						"selectedNode":selectedNodes[0],
						"pnode":pnode,
						"operateType":"add"
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							e.isParent = true;
							var name = e.NAME;
							var code = e.CODE;
							var id = e.ID;
							var pId = e.PARENT_ID;
							newNode = { name:name,CODE:code,id:id,pId:pId};
							newNode.isParent = true;
							$("#iom-service-serviceCatalog").tree("addNodes",pnode,newNode);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			} else {
				$("#iom-service-serviceCatalog").tree("addNodes",null,newNode);
			}
		},
		updateTreeNode : function() {
			var me = this;
			me.hideRMenu();
			var newNode = { name:'',id:''};
			var selectedNodes = $("#iom-service-serviceCatalog").tree("getSelectedNodes");
			
			if (selectedNodes[0]) {
				newNode.checked = selectedNodes[0].checked;
				var pnode = me.$("#iom-service-serviceCatalog").tree("getNodeByParam", 'id', selectedNodes[0].pId);
				var currentNode = me.$("#iom-service-serviceCatalog").tree("getNodeByParam", 'id', selectedNodes[0].id);
				var pop =fish.popupView({
					url: 'modules/iom/product/views/serviceCatalogAddView',
					width: "40%",
					title:'修改目录',
					viewOption : {
						"selectedNode":selectedNodes[0],
						"pnode":pnode,
						"currentNode":currentNode,
						"operateType":"update"
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
						selectedNodes[0].name = e.NAME;
						selectedNodes[0].CODE = e.CODE;
						selectedNodes[0].id = e.ID;
						selectedNodes[0].pId = e.PARENT_ID;	  
						$("#iom-service-serviceCatalog").tree("updateNode",selectedNodes[0]);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
				
			} else {
				$("#iom-service-serviceCatalog").tree("updateNode",null,newNode);
			}
		},
		removeTreeNode : function() {
			var me = this;
			me.hideRMenu();
			var nodes = $("#iom-service-serviceCatalog").tree("getSelectedNodes");
			if (nodes && nodes.length>0) {
				if (nodes[0].children && nodes[0].children.length > 0) {
					var msg = "要删除的节点是父节点，如果删除将连同子节点一起删掉。\n\n请确认！";
					if (confirm(msg)==true){
						var id = nodes[0].id;
						utils.ajax('cloudIomServiceForWeb','deleteServiceCatalog',id).done(function(ret){
							var data = JSON.parse(ret);
							var opreateResoult = data.opreateResoult;
							var opreateResoultMsg = data.opreateResoultMsg;
							if(false == opreateResoult){
								fish.info({title:'提示',message: opreateResoultMsg});
								return;
							}else{
								fish.info({title:'提示',message: opreateResoultMsg});
								$("#iom-service-serviceCatalog").tree("removeNode",nodes[0]);
								//me.popup.close(ret);
							} 
							
						}).fail(function(ret){
			    			fish.error({title:'错误',message:'服务目录删除异常'});
			    		});
					}
				} else {
					var id = nodes[0].id;
					utils.ajax('cloudIomServiceForWeb','deleteServiceCatalog',id).done(function(ret){
						var data = JSON.parse(ret);
						var opreateResoult = data.opreateResoult;
						var opreateResoultMsg = data.opreateResoultMsg;
						if(false == opreateResoult){
							fish.info({title:'提示',message: opreateResoultMsg});
							return;
						}else{ 
							fish.info({title:'提示',message: opreateResoultMsg});
							$("#iom-service-serviceCatalog").tree("removeNode",nodes[0]);
						}
					}).fail(function(ret){
		    			fish.error({title:'错误',message:'产品目录删除异常'});
		    		});
					
					
				}
			}
		},
		
		checkTreeNode : function(checked) {
			var nodes = $("#iom-service-serviceCatalog").tree("getSelectedNodes");
			if (nodes && nodes.length>0) {
				$("#iom-service-serviceCatalog").tree("checkNode",nodes[0], checked, true);
			}
			hideRMenu();
		},
		//新增
		serviceAdd:function(){
			var me=this;
			var catalogId = me.catalogId;
			if('' == catalogId || undefined == catalogId){
				fish.info({title:'提示',message:'请选择服务目录！'});
				return;
			}
			var pop =fish.popupView({
				url: 'modules/iom/product/views/serviceAddView',
				width: "80%",
				viewOption : {"catalogId":catalogId},
				callback:function(popup,view){
					popup.result.then(function (e) {
						me.getSerDataByCatalogId(me.catalogId);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		openOrderDetails:function(){ //定单详情按钮事件
			var selrow = this.$("#iom-service-grid").grid("getSelection"); 
			if(null != selrow.ID || undefined != selrow.ID){   
				var catalogId = selrow.CATALOG_ID;
				var pop =fish.popupView({
					url: 'modules/iom/product/views/serviceDetailView',
					width: "80%", 
					viewOption:{
						action:"detail.spacerm-dc",
						serviceData:selrow,
						"catalogId":catalogId
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							alert("e=" + e);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		},
		openOrderUpdate:function(){
			var me=this;
			var catalogId = me.catalogId;
			var selrow = this.$("#iom-service-grid").grid("getSelection"); 
			if(null != selrow.ID || undefined != selrow.ID){  
				var pop =fish.popupView({
					url: 'modules/iom/product/views/serviceUpdateView',
					width: "80%", 
					viewOption:{
						action:"detail.spacerm-dc",
						serviceData:selrow,
						"catalogId":catalogId
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							me.getSerDataByCatalogId(me.catalogId);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		},
		
		deleteSer:function(){
			var me=this;
			var selrow = this.$("#iom-service-grid").grid("getSelection"); 
			if(null != selrow.ID || undefined != selrow.ID){   
				var arr = new Array(length);
				arr[0] = selrow.ID;
				fish.confirm('确认删除？').result.done(function() {
					utils.ajax('cloudIomServiceForWeb','deleteService',arr).done(function(ret){
						me.getSerDataByCatalogId(me.catalogId);
					});
		        }).fail(function(){
		        	
		        });
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		}
		
		
	});
});