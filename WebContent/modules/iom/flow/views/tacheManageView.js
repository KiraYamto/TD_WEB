define([
	'text!modules/iom/flow/templates/tacheManageView.html'+codeVerP,
	'i18n!modules/iom/flow/i18n/tacheManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/flow/styles/tacheManage.css'+codeVerP
], function(flowTacheManageViewTpl, i18nflowTacheManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(flowTacheManageViewTpl),
		i18nData: fish.extend({}, i18nflowTacheManage),
		catalogId:null,
		events: {
			'click #iom-flowTache-add-btn':'tacheAdd',
			'click #iom-flowTache-mod-btn':'tacheUpdate',
			'click #iom-flowTache-saveAs-btn':'tacheSaveAs',
			'click #iom-flowTache-detail-btn': 'openTacheDetails',
			'click #iom-flowTache-del-btn': 'tacheVesionDelete',
			'click #iom-flowTache-active-btn': 'tacheVesionActive',
			'click #iom-flowTache-forceInvalid-btn': 'tacheVesionActive',
			'click #iom-flowTest-btn' : 'orderTest'
			
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.loadTacheGridRender();
			this.loadTacheCatalogData();
			$("#iom-flowTache-active-btn").hide();
			$("#iom-flowTache-forceInvalid-btn").hide();
			this.resize();
		},
		resize: function() {
			$("#iom-flowTache-grid").grid("setGridHeight", $('#main-tabs-panel').height()-110);
			$("#iom-flow-tacheCatalog").css({"height": $('#main-tabs-panel').height()-80, "overflow":"auto"});
			$("#iom-flowTache-grid").grid("resize");
		},
		//根据目录id查询环节信息
		getFlowTacheList: function(catalogId) { //请求服务器获取数据的方法
			var me=this;
			var map = new Object();
			var rowNum = this.$("#iom-flowTache-grid").grid("getGridParam", "rowNum");
			var page = this.$("#iom-flowTache-grid").grid("getGridParam", "page"); 
			if('' == catalogId || undefined == catalogId || null == catalogId){
				map.catalogId = me.catalogId+"";
			}else{
				map.catalogId = me.catalogId+"";
			}
			map.pageIndex = (page-1)+"";
			map.pageSize = 10+"";
			$("#iom-flowTache-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb','getFlowTacheList',map).done(function(ret){
				ret = JSON.parse(ret);
				if(ret!=null){
					if(ret.rows.length == 0){
						ret = "";
					} 
					if(ret.rows.length > 0){
						for(var i = 0 ;i<ret.rows.length;i++){
							if(ret.rows[i].state=='10A'){
								//ret.rows[i].stateText="有效";
							}else if(ret.rows[i].state=='10P'){
								//ret.rows[i].stateText="作废";
							}
							ret.rows[i].stateText=null;
							ret.rows[i].tacheId=ret.rows[i].id;
							//ret.rows[i].tacheName=ret.rows[i].TACHE_NAME;
							ret.rows[i].stateDateText=null;
							if(ret.rows[i].isAuto=='0'){
								ret.rows[i].isAutoText="否";
							}else if(ret.rows[i].isAuto=='1'){
								ret.rows[i].isAutoText="是";
							}
							ret.rows[i].children = [];
						}
					}
					$("#iom-flowTache-grid").grid("reloadData", ret);
				}
			}).fail(function(ret){
    			fish.error({title:'错误',message:'环节管理查询异常'});
    		});
			$("#iom-flowTache-grid").unblockUI().data('blockui-content', false);
		},
		/* 加载目录信息 */
		loadTacheCatalogData : function(){	
			var me=this;
			utils.ajax('cloudIomServiceForWeb','getFlowTacheCatalog').done(function(ret){
				var root = [];
				ret = JSON.parse(ret);
				if (ret){
					$.each(ret, function(i, n) {
						var children = n.children;
						n.name = n.text;
						if (undefined == children || '' == children) {
							n.isParent = true;
						} else if(undefined != children && '' != children){
							$.each(children, function(j, m) {
								m.name = m.text;
							});
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
								icon: 'icon',
								children:'children'
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
						check: {
							enable: false
						},
						callback: {
							onClick: function(e,treeNode, clickFlag) {
								var catalogId = treeNode.id;
								me.catalogId=catalogId;
								me.getFlowTacheList(catalogId);
							},
							onRightClick: $.proxy(me.OnRightClick,me)
						}
				};
				$('#iom-flow-tacheCatalog').tree(options); 
				$("#iom-flow-tacheCatalog").on("contextmenu", function() { // 禁止右击
					return false;
				})
				//在body中增加右键菜单的结构
				/*$("<ul>").append('<li id="iom_flowTache_m_add" >增加目录</li>')
					.append('<li id="iom_flowTache_m_del" >删除目录</li>')
					.append('<li id="iom_flowTache_m_update">修改目录</li>')
					.appendTo($('<div id="iom_flowTache_rMenu">')).parent().appendTo("body")
					.click(function(event) {
						var targetId = event.target.id;
						if(targetId == "iom_flowTache_m_add") {
							me.addTreeNode();
						} else if(targetId == "iom_flowTache_m_del") {
							me.removeTreeNode();
						} else if(targetId == "iom_flowTache_m_update") {
							me.updateTreeNode(true);
						} else if(targetId == "m_unCheck") {
							me.checkTreeNode(false);
						}
					});*/

				if(root.length>0){
					var nid = root[0].id;
					node = me.$("#iom-flow-tacheCatalog").tree("getNodeByParam", 'ID', nid);
					me.$('#iom-flow-tacheCatalog').tree("selectNode",node, true);
					me.catalogId=nid;
					me.getFlowTacheList(nid);
				}
			}).fail(function(ret){
    			fish.error({title:'错误',message:'环节目录查询异常'});
    		});
		},  
		hideiom_flowTache_rMenu : function() {
			var me = this;
			var $iom_flowTache_rMenu = $("#iom_flowTache_rMenu");
			if ($iom_flowTache_rMenu) $iom_flowTache_rMenu.css({"visibility": "hidden"});
			$("body").off("mousedown", $.proxy(me.onBodyMouseDown,me));
		},
		showiom_flowTache_rMenu : function(type, x, y,targetElement) {
			var me = this;
			$("#iom_flowTache_rMenu ul").show();
			if (type=="root") {
				$("#iom_flowTache_m_del").hide();
				$("#m_check").hide();
				$("#m_unCheck").hide();
			} else {
				$("#iom_flowTache_m_del").show();
				$("#m_check").show();
				$("#m_unCheck").show();
			}
			$("#iom_flowTache_rMenu").css({"top":y+"px", "left":x+"px", "visibility":"visible"});
			$("body").on("mousedown", $.proxy(me.onBodyMouseDown,me));
		},
		OnRightClick : function(event, treeNode) {
			var me=this;
			if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
				$("#iom-flow-tacheCatalog").tree("cancelSelectedNode");
				me.showiom_flowTache_rMenu("root", event.clientX, event.clientY,event.target);
			} else if (treeNode && !treeNode.noR) {
				$("#iom-flow-tacheCatalog").tree("selectNode",treeNode);
				me.showiom_flowTache_rMenu("node", event.clientX, event.clientY,event.target);
			}
		},
		onBodyMouseDown : function(event){
			if (!(event.target.id == "iom_flowTache_rMenu" || $(event.target).parents("#iom_flowTache_rMenu").length>0)) {
				$("#iom_flowTache_rMenu").css({"visibility" : "hidden"});
			}
		},
		addTreeNode : function() {
			var me = this;
			me.hideiom_flowTache_rMenu();
			var newNode = { name:'',id:'',pId:''};
			var selectedNodes = $("#iom-flow-tacheCatalog").tree("getSelectedNodes");
			if (selectedNodes[0]) {
				newNode.checked = selectedNodes[0].checked;
				var pop =fish.popupView({
					url: 'modules/iom/product/views/productCatalogAddView',
					width: "40%",
					viewOption : {
						"selectedNode":selectedNodes[0],
						"operateType":"add"
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							e.isParent = false;
							var name = e.NAME;
							var id = e.ID;
							var pId = e.PARENT_ID;
							newNode = { name:name,id:id,pId:pId};
							$("#iom-flow-tacheCatalog").tree("addNodes",selectedNodes[0],newNode);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			} else {
				$("#iom-flow-tacheCatalog").tree("addNodes",null,newNode);
			}
		},
		updateTreeNode : function() {
			var me = this;
			me.hideiom_flowTache_rMenu();
			var newNode = { name:'',id:''};
			var selectedNodes = $("#iom-flow-tacheCatalog").tree("getSelectedNodes");
			if (selectedNodes[0]) {
				newNode.checked = selectedNodes[0].checked;
				var pop =fish.popupView({
					url: 'modules/iom/product/views/productCatalogAddView',
					width: "40%",
					viewOption : {
						"selectedNode":selectedNodes[0],
						"operateType":"update"
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							var name = e.NAME;
							var id = e.ID;
							var pId = e.PARENT_ID;
							newNode = { name:name,id:id,pId:pId};
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
				$("#iom-flow-tacheCatalog").tree("addNodes",selectedNodes[0],newNode);
			} else {
				$("#iom-flow-tacheCatalog").tree("addNodes",null,newNode);
			}
		},
		removeTreeNode : function() {
			hideiom_flowTache_rMenu();
			var nodes = $("#iom-flow-tacheCatalog").tree("getSelectedNodes");
			if (nodes && nodes.length>0) {
				if (nodes[0].children && nodes[0].children.length > 0) {
					var msg = "要删除的节点是父节点，如果删除将连同子节点一起删掉。\n\n请确认！";
					if (confirm(msg)==true){
						$("#iom-flow-tacheCatalog").tree("removeNode",nodes[0]);
					}
				} else {
					$("#iom-flow-tacheCatalog").tree("removeNode",nodes[0]);
				}
			}
		},
		checkTreeNode : function(checked) {
			var nodes = $("#iom-flow-tacheCatalog").tree("getSelectedNodes");
			if (nodes && nodes.length>0) {
				$("#iom-flow-tacheCatalog").tree("checkNode",nodes[0], checked, true);
			}
			hideiom_flowTache_rMenu();
		},
		//根据环节id查询环节版本信息
		getFlowTacheDefList: function(tacheId) { //请求服务器获取数据的方法
			var me=this;
			var map = new Object();
			var rowNum = this.$("#iom-flowTache-grid").grid("getGridParam", "rowNum");
			var page = this.$("#iom-flowTache-grid").grid("getGridParam", "page"); 
			if('' == tacheId || undefined == tacheId || null == tacheId){
				//map.tacheId = me.tacheId+"";
				return;
			}else{
				map.tacheId = tacheId+"";
			}
			map.pageIndex = (page-1);
			map.pageSize = 10;
			//$("#iom-flowTache-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb','getFlowTacheList',map).done(function(ret){
				ret = JSON.parse(ret);
				if(ret!=null){
					if(ret.length == 0){
						ret = "";
					} 
					if(ret.total > 0){
						for(var i = 0 ;i<ret.total;i++){
							if(ret.rows[i].state=='10A'){
								ret.rows[i].stateText="有效";
							}else if(ret.rows[i].state=='10P'){
								ret.rows[i].stateText="作废";
							}
							
							if(ret.rows[i].isAuto=='0'){
								ret.rows[i].isAutoText="否";
							}else if(ret.rows[i].isAuto=='1'){
								ret.rows[i].isAutoText="是";
							}
							
							ret.rows[i].children = [{}];
						}
					}
					$("#iom-flowTache-grid").grid("reloadData", ret);
				}
			}).fail(function(ret){
    			fish.error({title:'错误',message:'环节管理查询异常'});
    		});
			$("#iom-flowTache-grid").unblockUI().data('blockui-content', false);
		},
		loadTacheGridRender: function() {
			var dcGridPerData = $.proxy(this.getFlowTacheList,this); //函数作用域改变
			this.$("#iom-flowTache-grid").grid({
				datatype: "json",
				height: $(window).height()*0.695,
				colModel: [{
					name: 'tacheName',
					label: '环节名称',
					width: 220
				},{
					name: 'tacheCode',
					width: 220,
					label: '环节编码'
				},{
					name: 'stateText',
					width: 220,
					label: '状态' 
				},{
					name: 'state',
					width: 220,
					label: '状态',
					hidden:true
				},{
					name: 'effDate',
					width: 300,
					label: '生效时间'
				},{
					name: 'expDate',
					width: 300,
					label: '失效时间'
				},{
					name: 'stateDateText',
					width: 300,
					label: '状态时间'
				},{
					name: 'tacheCatalogId',
					label: 'tacheCatalogId',
					width: 100,
					hidden:true
				},{
					name: 'isAuto',
					label: 'isAuto',
					width: 100, 
					hidden:true
				},{
					name: 'isAutoText',
					label: '是否自动回单',
					width: 100,
					hidden:true
				},{
					name: 'id',
					label: 'ID',
					width: 100,
					key:true,
					hidden:true
				}],
				rowNum: 10, 
				datatype: "json",
				pager: true,
				server: true,
				multiselect:false,
				pageData: dcGridPerData, //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
				expandColumn:"tacheName",
				treeGrid:true,
				onRightClickRow : function( e, rowid, iRow, iCol ){ 
				},
				treeIcons: {
	                plus: 'glyphicon glyphicon-triangle-right',
	                minus: 'glyphicon glyphicon-triangle-bottom',
	                leaf: '',
	                folderClosed: '', //支持全局配置,展开列的close状态的节点图标，默认为空
	                folderOpen: '' //支持全局配置,展开列的open状态的节点图标，默认为空
	            },
	            onSelectRow: function( e, rowid, state, checked ){
	            	//$("#iom-flowTache-grid").grid("setSelection",false);
	            	var selrow = $("#iom-flowTache-grid").grid("getSelection"); 
	            },
	            onCellSelect: function(e, rowid, iCol, cellcontent) {
					$("#iom-flowTache-grid").grid("setAllCheckRows",false); 
					if (iCol != 0) {
						$("#iom-flowTache-grid").grid("setCheckRows",[rowid]);
						var rowData = $("#iom-flowTache-grid").grid("getRowData", rowid,true);
						if(true == rowData.isLeaf && "10B" == rowData.state){
							$("#iom-flowTache-active-btn").show();
							$("#iom-flowTache-forceInvalid-btn").show();
						}else{
							$("#iom-flowTache-active-btn").hide();
							$("#iom-flowTache-forceInvalid-btn").hide();
						}
					} 
				}, 
				onRowExpand:function(e, rowData){//展开父节点rowData
			        console.log(rowData);
			        $("#iom-flowTache-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			        var children = $("#iom-flowTache-grid").grid("getNodeChildren", rowData);
			        var map = new Object();
			        map.id=rowData.id+"";
			        //if(children.length==0){
			        if(children.length==0){
				        utils.ajax('cloudIomServiceForWeb','getFlowTacheEditionList',map).done(function(ret){
							ret = JSON.parse(ret);
							if(ret!=null){
								if(ret.length == 0){
									ret = [];
									fish.info({title:'提示',message:'该环节下没有版本信息'});
								}
								if(ret.length > 0){
									for(var i = 0 ;i<ret.length;i++){
										if(ret[i].state=='10A'){
											ret[i].stateText="<font color='#0066FF'>激活</font>";
										}else if(ret[i].state=='10B'){
											ret[i].stateText="<font color='red'>锁定</font>";
										}else if(ret[i].state=='10C'){
											ret[i].stateText="失效";
										}else if(ret[i].state=='10X'){
											ret[i].stateText="<font color='#000099'>删除</font>";
										}
										ret[i].icon='';
										ret[i].stateDateText=ret[i].stateDate;
										ret[i].tacheName=ret[i].EDITION;
										//ret.rows[i].children = [{}];
									}
									$("#iom-flowTache-grid").grid('addChildNodes', ret, rowData);
								}
							}
						}).fail(function(ret){
			    			fish.error({title:'错误',message:'环节管理查询异常'});
			    		});
				        
			        }
			        $("#iom-flowTache-grid").unblockUI().data('blockui-content', false);
			    },
				onRowCollapse:function(e, rowData){
			        console.log(rowData);
			    }
			});
		},
		//新增环节版本
		tacheAdd:function(){
			var selrow = $("#iom-flowTache-grid").grid("getSelection"); 
			var me=this;
			var catalogId = me.catalogId;
			if('' == catalogId || undefined == catalogId){
				fish.info({title:'提示',message:'请选择环节目录！'});
				return;
			}
			if(null != selrow.id || undefined != selrow.id){ 
				if(true==selrow.isLeaf){
					fish.info({title:'提示',message:'您选择的是环节版本，请选择环节目录！'});
					return;
				} 
				var pop =fish.popupView({
					url: 'modules/iom/flow/views/tacheAddView',
					width: "60%",
					viewOption : {
						"catalogId":catalogId,
						"operateType":"add",
						selectRowData : selrow,
						parentRowData : null
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							e = JSON.parse(e);
							if(e.releaseState=='10A'){
								e.stateText="<font color='#0066FF'>激活</font>";
							}else if(e.releaseState=='10B'){
								e.stateText="<font color='red'>锁定</font>";
							}else if(e.releaseState=='10C'){
								e.stateText="失效";
							}else if(e.releaseState=='10X'){
								e.stateText="<font color='#000099'>删除</font>";
							}
							e.tacheName = e.edition;
							e.tacheCode='';
							e.stateDateText=e.stateDate;
							me.getFlowTacheList(me.catalogId); 
							$("#iom-flowTache-grid").grid('collapseNode',selrow,true);
							$("#iom-flowTache-grid").grid('expandNode',selrow,true);
							//$("#iom-flowTache-grid").grid('addChildNodes', e, selectRowData);
							//me.getFlowTacheList(me.catalogId);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}else{
				fish.info({title:'提示',message:'请勾选一条环节目录记录！'});
			}
		},
		//另存环节版本
		tacheSaveAs:function(){
			var selrow = $("#iom-flowTache-grid").grid("getSelection");
			var me=this;
			var catalogId = me.catalogId;
			if('' == catalogId || undefined == catalogId){
				fish.info({title:'提示',message:'请选择环节目录！'});
				return;
			}
			if(null != selrow.id || undefined != selrow.id){  
				if(false==selrow.isLeaf){
					fish.info({title:'提示',message:'您选择的是环节目录，请选择环节版本！'});
					return;
				}
				var parentRowData = $("#iom-flowTache-grid").grid("getRowData", selrow.parent,true);
				var pop =fish.popupView({
					url: 'modules/iom/flow/views/tacheAddView',
					width: "60%",
					viewOption : {
						"catalogId":catalogId,
						"operateType":"saveAs",
						selectRowData : selrow,
						parentRowData : parentRowData
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							e = JSON.parse(e);
							if(e.releaseState=='10A'){
								e.stateText="<font color='#0066FF'>激活</font>";
							}else if(e.releaseState=='10B'){
								e.stateText="<font color='red'>锁定</font>";
							}else if(e.releaseState=='10C'){
								e.stateText="失效";
							}else if(e.releaseState=='10X'){
								e.stateText="<font color='#000099'>删除</font>";
							}
							e.tacheName = e.edition;
							e.tacheCode='';
							e.stateDateText=e.stateDate;
							$("#iom-flowTache-grid").grid('collapseNode',parentRowData,true);
							//$("#iom-flowTache-grid").grid('expandNode',selectRowData,true);
							me.getFlowTacheList(me.catalogId);
							//me.getFlowTacheList(me.catalogId);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		},
		//修改环节版本
		tacheUpdate:function(){
			var selrow = $("#iom-flowTache-grid").grid("getSelection"); 
			var me=this;
			var catalogId = me.catalogId;
			if('' == catalogId || undefined == catalogId){
				fish.info({title:'提示',message:'请选择环节目录！'});
				return;
			}
			if(null != selrow.id || undefined != selrow.id){  
				var parentRowData = $("#iom-flowTache-grid").grid("getRowData", selrow.parent,true);
				if(false==selrow.isLeaf){
					fish.info({title:'提示',message:'您选择的是环节目录，请选择环节版本！'});
					return;
				} 
				var pop =fish.popupView({
					url: 'modules/iom/flow/views/tacheAddView',
					width: "60%",
					viewOption : {
						"catalogId":catalogId,
						"operateType":"update",
						selectRowData : selrow,
						parentRowData : parentRowData
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							e = JSON.parse(e);
							if(e.releaseState=='10A'){
								e.stateText="<font color='#0066FF'>激活</font>";
							}else if(e.releaseState=='10B'){
								e.stateText="<font color='red'>锁定</font>";
							}else if(e.releaseState=='10C'){
								e.stateText="失效";
							}else if(e.releaseState=='10X'){
								e.stateText="<font color='#000099'>删除</font>";
							}
							e.tacheName = e.edition;
							e.tacheCode='';
							e.stateDateText=e.stateDate;
							$("#iom-flowTache-grid").grid('collapseNode',parentRowData,true);
							me.getFlowTacheList(me.catalogId);
							//$("#iom-flowTache-grid").grid('expandNode',parentRowData,true);
							//$("#iom-flowTache-grid").grid('addChildNodes', e, rowData);
							//me.getFlowTacheList(me.catalogId);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		},
		//删除环节版本
		tacheVesionDelete:function(){
			var selrow = $("#iom-flowTache-grid").grid("getSelection");
			var me=this;
			var map = new Object();
			var catalogId = me.catalogId;
			if('' == catalogId || undefined == catalogId){
				fish.info({title:'提示',message:'请选择环节目录！'});
				return;
			}
			if(null != selrow.id || undefined != selrow.id){  
				var parentRowData = $("#iom-flowTache-grid").grid("getRowData", selrow.parent,true);
				map.id=selrow.id;
				if(false==selrow.isLeaf){
					fish.info({title:'提示',message:'您选择的是环节目录，请选择环节版本！'});
					return;
				}  
				fish.confirm('确认删除？').result.done(function() {
					utils.ajax('cloudIomServiceForWeb','deleteFlowTacheEdition',map).done(function(ret){
						var data = JSON.parse(ret);
						var opreateResoult = data.opreateResoult;
						var opreateResoultMsg = data.opreateResoultMsg;
						if(false == opreateResoult){
							fish.info({title:'提示',message: opreateResoultMsg});
							return;
						}else{ 
							fish.info({title:'提示',message: opreateResoultMsg});
							$("#iom-flowTache-grid").grid('collapseNode',parentRowData,true);
							me.getFlowTacheList(me.catalogId);
						}
					});
		        }).fail(function(){ 
		        }); 
					
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		},
		tacheVesionActive:function(e){
			var selections = this.$("#iom-flowTache-grid").grid("getCheckRows");//返回所有被选中的行
			var me=this;
			var map = new Object();
			var catalogId = me.catalogId;
			if('' == catalogId || undefined == catalogId){
				fish.info({title:'提示',message:'请选择环节目录！'});
				return;
			}
			if(selections.length == 1){
				var selectRowData = selections[0]; 
				var parentRowData = $("#iom-flowTache-grid").grid("getRowData", selectRowData.parent,true);
				map.id=selectRowData.id;
				if(e.target.id == 'iom-flowTache-active-btn'){
					map.releaseState = "10A";//'10A 激活 10B,锁定 10C,失效 10X,删除',
				}else if(e.target.id == 'iom-flowTache-forceInvalid-btn'){
					map.releaseState = "10C";
				}
				if(false==selectRowData.isLeaf){
					fish.info({title:'提示',message:'您选择的是环节目录，请选择环节版本！'});
					return;
				}  
				utils.ajax('cloudIomServiceForWeb','updateFlowTacheReleaseState',map).done(function(ret){
					var data = JSON.parse(ret);
					var opreateResoult = data.opreateResoult;
					var opreateResoultMsg = data.opreateResoultMsg;
					if(false == opreateResoult){
						fish.info({title:'提示',message: opreateResoultMsg});
						return;
					}else{ 
						fish.info({title:'提示',message: opreateResoultMsg});
						$("#iom-flowTache-grid").grid('collapseNode',parentRowData,true);
						me.getFlowTacheList(me.catalogId);
						parentRowData = $("#iom-flowTache-grid").grid("getRowData", selectRowData.parent,true);
						$("#iom-flowTache-grid").grid('expandNode',parentRowData,true);
						
					}
				});
			}else if(selections.length > 1){
				fish.info({title:'提示',message:'一次只能操作一条记录！'});
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		},
		openTacheDetails:function(){ //定单详情按钮事件 
			var selrow = $("#iom-flowTache-grid").grid("getSelection"); 
			var me=this;
			var catalogId = me.catalogId;
			if(selrow != null){ 
				var pop =fish.popupView({
					url: 'modules/iom/flow/views/tacheDetailView',
					width: "50%", 
					viewOption:{
						action:"detail.spacerm-dc",
						tacheData:selrow,
						"catalogId":catalogId
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							//alert("e=" + e);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		},
		
		
		orderTest:function(){
			var pop =fish.popupView({
				url: 'modules/iom/flow/views/tacheTestView',
				width: "60%",
				viewOption : {
				},
				callback:function(popup,view){
					popup.result.then(function (e) {
						e = JSON.parse(e);
						if(e.releaseState=='10A'){
							e.stateText="<font color='#0066FF'>激活</font>";
						}else if(e.releaseState=='10B'){
							e.stateText="<font color='red'>锁定</font>";
						}else if(e.releaseState=='10C'){
							e.stateText="失效";
						}else if(e.releaseState=='10X'){
							e.stateText="<font color='#000099'>删除</font>";
						}
						e.tacheName = e.edition;
						e.tacheCode='';
						e.stateDateText=e.stateDate;
						$("#iom-flowTache-grid").grid('addChildNodes', e, rowData);
						//me.getFlowTacheList(me.catalogId);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		}
		
	});
});