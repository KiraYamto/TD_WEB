define([
	'text!modules/iom/product/templates/eventManageView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/eventManage.css'+codeVerP
], function(eventManageViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(eventManageViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		catalogId:null,
		events: {
			'click #event-event-add-btn':'eventAdd',
			'click #event-event-detail-btn': 'openEventDetails',
			'click #event-event-mod-btn': 'openEventUpdate',
			'click #event-event-del-btn': 'deleteEvent'
			
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.loadEventGridRender();
			this.loadEventCatalogData();
			this.resize();
		},
		resize: function() {
			$("#iom-event-grid").grid("setGridHeight", $('#main-tabs-panel').height()-110);
			$("#iom-event-eventCatalog").css({"height": $('#main-tabs-panel').height()-80, "overflow":"auto"});
			$("#iom-event-grid").grid("resize");
		},
		getEventDataByCatalogId: function(catalogId) { //请求服务器获取数据的方法
			var me=this;
			var map = new Object();
			var rowNum = this.$("#iom-event-grid").grid("getGridParam", "rowNum");
			var page = this.$("#iom-event-grid").grid("getGridParam", "page"); 
			if('' == catalogId || undefined == catalogId || null == catalogId){
				map.catalogId = me.catalogId+"";
			}else{
				map.catalogId = me.catalogId+"";
			}
			map.pageIndex = (page-1);
			map.pageSize = 10;
			$("#iom-event-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb','getEventList',map).done(function(ret){
				ret = JSON.parse(ret);
				if(ret!=null){
					if(ret.records == 0){
						ret = "";
					} 
					$("#iom-event-grid").grid("reloadData", ret);
				}
			}).fail(function(ret){
    			fish.error({title:'错误',message:'事件管理查询异常'});
    		});
			$("#iom-event-grid").unblockUI().data('blockui-content', false);
		},
		loadEventGridRender: function() {
			var dcGridPerData = $.proxy(this.getEventDataByCatalogId,this); //函数作用域改变
			this.$("#iom-event-grid").grid({
				datatype: "json",
				height: $(window).height()*0.695,
				colModel: [{
					name: 'NAME',
					label: '事件名称',
					sortable:false,
					width: 220
				},{
					name: 'CODE',
					width: 220,
					sortable:false,
					label: '事件编码'
				},{
					name: 'TYPE_NAME',
					sortable:false,
					width: 220,
					label: '事件类型'
				},{
					name: 'EFF_DATE',
					sortable:false,
					width: 350,
					label: '生效日期', 
				},{
					name: 'EXP_DATE',
					sortable:false,
					width: 350,
					label: '失效日期'
				},{
					name: 'CRM_ID',
					sortable:false,
					width: 220,
					label: 'CRM_ID'
				},{
					name: 'CREATED_DATE',
					sortable:false,
					width: 220,
					label: '创建日期',
					hidden:true
				},{
					name: 'COMMENTS',
					sortable:false,
					width: 220,
					label: '备注'
				},{
					name: 'ID',
					label: 'ID',
					width: 100,
					hidden:true
				},{
					name: 'TYPE_ID',
					label: 'TYPE_ID',
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
				shrinkToFit:true,
				pageData: dcGridPerData, //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
				onCellSelect: function(e, rowid, iCol, cellcontent) {
					$("#iom-event-grid").grid("setAllCheckRows",false);
					if (iCol != 0) {
						$("#iom-event-grid").grid("setCheckRows",[rowid]);
					} 
				}
			});
		},
		/* 加载目录信息 */
		loadEventCatalogData : function(){	
			var me=this;
			utils.ajax('cloudIomServiceForWeb','getEventCatalog').done(function(ret){
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
								me.getEventDataByCatalogId(catalogId);
							},
							onRightClick: $.proxy(me.OnRightClick,me)
						}
				};
				$('#iom-event-eventCatalog').tree(options);
				$("#iom-event-eventCatalog").on("contextmenu", function() { // 禁止右击
					return false;
				})
				//在body中增加右键菜单的结构
				$("<ul>").append('<li id="iom-event-m_add" >增加目录</li>')
					.append('<li id="iom-event-iom-event-m_add_sub" >增加子目录</li>')
					.append('<li id="iom-event-m_update">修改目录</li>')
					.append('<li id="iom-event-m_del" >删除目录</li>')
					.appendTo($('<div id="iom-event-rMenu">')).parent().appendTo("body")
					.click(function(event) {
						var targetId = event.target.id;
						if(targetId == "iom-event-m_add") {
							me.addTreeNode();
						} else if(targetId == "iom-event-iom-event-m_add_sub") {
							me.addTreeSubNode();
						} else if(targetId == "iom-event-m_del") {
							me.removeTreeNode();
						} else if(targetId == "iom-event-m_update") {
							me.updateTreeNode(true);
						} else if(targetId == "m_unCheck") {
							me.checkTreeNode(false);
						}
					});
				
				if(root.length>0){
					var nid = root[0].id;
					node = me.$("#iom-event-eventCatalog").tree("getNodeByParam", 'ID', nid);
					me.$('#iom-event-eventCatalog').tree("selectNode",node, true);
					me.catalogId=nid;
					me.getEventDataByCatalogId(nid);
				}
			}).fail(function(ret){
    			fish.error({title:'错误',message:'事件目录查询异常'});
    		});
		},
		hideRMenu : function() {
			var me = this;
			var $rMenu = $("#iom-event-rMenu");
			if ($rMenu) $rMenu.css({"visibility": "hidden"});
			$("body").off("mousedown", $.proxy(me.onBodyMouseDown,me));
		},
		showRMenu : function(type, x, y,targetElement) {
			var me = this;
			$("#iom-event-rMenu ul").show();
			if (type=="root") {
				$("#m_del").hide();
				$("#m_check").hide();
				$("#m_unCheck").hide();
			} else {
				$("#m_del").show();
				$("#m_check").show();
				$("#m_unCheck").show();
			}
			$("#iom-event-rMenu").css({"top":y+"px", "left":x+"px", "visibility":"visible"});
			$("body").on("mousedown", $.proxy(me.onBodyMouseDown,me));
		},
		OnRightClick : function(event, treeNode) {
			var me=this;
			if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
				$("#iom-event-eventCatalog").tree("cancelSelectedNode");
				me.showRMenu("root", event.clientX, event.clientY,event.target);
			} else if (treeNode && !treeNode.noR) {
				$("#iom-event-eventCatalog").tree("selectNode",treeNode);
				me.showRMenu("node", event.clientX, event.clientY,event.target);
			}
		},
		onBodyMouseDown : function(event){
			if (!(event.target.id == "rMenu" || $(event.target).parents("#iom-event-rMenu").length>0)) {
				$("#iom-event-rMenu").css({"visibility" : "hidden"});
			}
		},
		addTreeSubNode : function() {
			var me = this;
			me.hideRMenu();
			var newNode = { name:'',id:'',pId:''};
			var selectedNodes = $("#iom-event-eventCatalog").tree("getSelectedNodes");
			if (selectedNodes[0]) {
				newNode.checked = selectedNodes[0].checked;
				var pnode = selectedNodes[0];
				var pop =fish.popupView({
					url: 'modules/iom/product/views/eventCatalogAddView',
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
							var code= e.CODE;
							var id = e.ID;
							var pId = e.PARENT_ID;
							newNode = { name:name,CODE:code,id:id,pId:pId};
							$("#iom-event-eventCatalog").tree("addNodes",pnode,newNode);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			} else {
				$("#iom-event-eventCatalog").tree("addNodes",null,newNode);
			}
		},
		addTreeNode : function() {
			var me = this;
			me.hideRMenu();
			var newNode = { name:'',id:'',pId:''};
			var selectedNodes = $("#iom-event-eventCatalog").tree("getSelectedNodes");
			if (selectedNodes[0]) {
				newNode.checked = selectedNodes[0].checked;
				var pnode = me.$("#iom-event-eventCatalog").tree("getNodeByParam", 'id', selectedNodes[0].pId);
				var pop =fish.popupView({
					url: 'modules/iom/product/views/eventCatalogAddView',
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
							$("#iom-event-eventCatalog").tree("addNodes",pnode,newNode);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			} else {
				$("#iom-event-eventCatalog").tree("addNodes",null,newNode);
			}
		},
		updateTreeNode : function() {
			var me = this;
			me.hideRMenu();
			var newNode = { name:'',id:''};
			var selectedNodes = $("#iom-event-eventCatalog").tree("getSelectedNodes");
			if (selectedNodes[0]) {
				newNode.checked = selectedNodes[0].checked;
				var pnode = me.$("#iom-event-eventCatalog").tree("getNodeByParam", 'id', selectedNodes[0].pId);
				var currentNode = me.$("#iom-event-eventCatalog").tree("getNodeByParam", 'id', selectedNodes[0].id);
				var pop =fish.popupView({
					url: 'modules/iom/product/views/eventCatalogAddView',
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
						$("#iom-event-eventCatalog").tree("updateNode",selectedNodes[0]);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
				
			} else {
				$("#iom-event-eventCatalog").tree("updateNode",null,newNode);
			}
		},
		removeTreeNode : function() {
			var me = this;
			me.hideRMenu();
			var nodes = $("#iom-event-eventCatalog").tree("getSelectedNodes");
			if (nodes && nodes.length>0) {
				if (nodes[0].children && nodes[0].children.length > 0) {
					var msg = "要删除的节点是父节点，如果删除将连同子节点一起删掉。\n\n请确认！";
					if (confirm(msg)==true){
						var id = nodes[0].id;
						utils.ajax('cloudIomServiceForWeb','deleteEventCatalog',id).done(function(ret){
							var data = JSON.parse(ret);
							var opreateResoult = data.opreateResoult;
							var opreateResoultMsg = data.opreateResoultMsg;
							if(false == opreateResoult){
								fish.info({title:'提示',message: opreateResoultMsg});
								return;
							}else{
								fish.info({title:'提示',message: opreateResoultMsg});
								$("#iom-event-eventCatalog").tree("removeNode",nodes[0]);
							} 
							
						}).fail(function(ret){
			    			fish.error({title:'错误',message:'事件目录删除异常'});
			    		});
					}
				} else {
					var id = nodes[0].id;
					utils.ajax('cloudIomServiceForWeb','deleteEventCatalog',id).done(function(ret){
						var data = JSON.parse(ret);
						var opreateResoult = data.opreateResoult;
						var opreateResoultMsg = data.opreateResoultMsg;
						if(false == opreateResoult){
							fish.info({title:'提示',message: opreateResoultMsg});
							return;
						}else{ 
							fish.info({title:'提示',message: opreateResoultMsg});
							$("#iom-event-eventCatalog").tree("removeNode",nodes[0]);
						}
					}).fail(function(ret){
		    			fish.error({title:'错误',message:'事件目录删除异常'});
		    		});
				}
			}
		},
		checkTreeNode : function(checked) {
			var nodes = $("#iom-event-eventCatalog").tree("getSelectedNodes");
			if (nodes && nodes.length>0) {
				$("#iom-event-eventCatalog").tree("checkNode",nodes[0], checked, true);
			}
			hideRMenu();
		},
		//新增
		eventAdd:function(){
			var me=this;
			var catalogId = me.catalogId;
			if('' == catalogId || undefined == catalogId){
				fish.info({title:'提示',message:'请选择事件目录！'});
				return;
			}
			var pop =fish.popupView({
				url: 'modules/iom/product/views/eventAddView',
				width: "80%",
				viewOption : {"catalogId":catalogId},
				callback:function(popup,view){
					popup.result.then(function (e) {
						me.getEventDataByCatalogId(me.catalogId);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		openEventDetails:function(){ 
			var selrow = this.$("#iom-event-grid").grid("getSelection"); 
			if(null != selrow.ID || undefined != selrow.ID){     
				var catalogId = selrow.CATALOG_ID;
				var pop =fish.popupView({
					url: 'modules/iom/product/views/eventDetailView',
					width: "80%", 
					viewOption:{
						action:"detail.spacerm-dc",
						productData:selrow,
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
		openEventUpdate:function(){
			var me=this;
			var catalogId = me.catalogId;
			var selrow = this.$("#iom-event-grid").grid("getSelection"); 
			if(null != selrow.ID || undefined != selrow.ID){  
				var pop =fish.popupView({
					url: 'modules/iom/product/views/eventUpdateView',
					width: "80%", 
					viewOption:{
						action:"detail.spacerm-dc",
						eventData:selrow,
						"catalogId":catalogId
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							me.getEventDataByCatalogId(me.catalogId);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		},
		
		deleteEvent:function(){
			var me=this;
			var selrow = this.$("#iom-event-grid").grid("getSelection"); 
			if(null != selrow.ID || undefined != selrow.ID){      
				var arr = new Array(length);
				arr[0] = selrow.ID;
				fish.confirm('确认删除？').result.done(function() {
					utils.ajax('cloudIomServiceForWeb','delEvent',arr).done(function(ret){
						me.getEventDataByCatalogId(me.catalogId);
					});
		        }).fail(function(){
		        	
		        });
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		}
		
		
	});
});