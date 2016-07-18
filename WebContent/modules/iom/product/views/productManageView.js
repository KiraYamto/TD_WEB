define([
	'text!modules/iom/product/templates/productManageView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/productManage.css'+codeVerP
], function(productManageViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(productManageViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		catalogId:null,
		events: {
			'click #product-product-add-btn':'productAdd',
			'click #product-product-detail-btn': 'openProductDetails',
			'click #product-product-mod-btn': 'openProductUpdate',
			'click #product-product-del-btn': 'deletePro'
			
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.loadProductGridRender();
			this.loadProductCatalogData();
			this.resize();
		},
		//根据目录id查询产品信息
		getProductDataByCatalogId: function(catalogId) { //请求服务器获取数据的方法
			var me=this;
			var map = new Object();
			var rowNum = this.$("#product-product-grid").grid("getGridParam", "rowNum");
			var page = this.$("#product-product-grid").grid("getGridParam", "page"); 
			if('' == catalogId || undefined == catalogId || null == catalogId){
				map.catalogId = me.catalogId+"";
			}else{
				map.catalogId = me.catalogId+"";
			}
			map.pageIndex = (page-1);
			map.pageSize = 10;
			$("#product-product-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb','getProductList',map).done(function(ret){
				ret = JSON.parse(ret);
				if(ret!=null){
					if(ret.records == 0){
						ret = "";
					} 
					
					$("#product-product-grid").grid("reloadData", ret);
				}
			}).fail(function(ret){
    			fish.error({title:'错误',message:'产品管理查询异常'});
    		});
			$("#product-product-grid").unblockUI().data('blockui-content', false);
		},
		/* 加载产品目录信息 */
		loadProductCatalogData : function(){	
			var me=this;
			utils.ajax('cloudIomServiceForWeb','getProductCatalog').done(function(ret){
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
						check: {
							enable: false
						},
						callback: {
							onClick: function(e,treeNode, clickFlag) {
								var catalogId = treeNode.id;
								me.catalogId=catalogId;
								me.getProductDataByCatalogId(catalogId);
							},
							onRightClick: $.proxy(me.OnRightClick,me)
						}
				};
				$('#iom-product-productCatalog').tree(options); 
				$("#iom-product-productCatalog").on("contextmenu", function() { // 禁止右击
					return false;
				})
				//在body中增加右键菜单的结构
				$("<ul>").append('<li id="m_add" >增加目录</li>')
					.append('<li id="m_add_sub" >增加子目录</li>')
					.append('<li id="m_update">修改目录</li>')
					.append('<li id="m_del" >删除目录</li>')
					.appendTo($('<div id="rMenu">')).parent().appendTo("body")
					.click(function(event) {
						var targetId = event.target.id;
						if(targetId == "m_add") {
							me.addTreeNode();
						} else if(targetId == "m_add_sub") {
							me.addTreeSubNode();
						} else if(targetId == "m_del") {
							me.removeTreeNode();
						} else if(targetId == "m_update") {
							me.updateTreeNode(true);
						} else if(targetId == "m_unCheck") {
							me.checkTreeNode(false);
						}
					});

				if(root.length>0){
					var nid = root[0].id;
					node = me.$("#iom-product-productCatalog").tree("getNodeByParam", 'ID', nid);
					me.$('#iom-product-productCatalog').tree("selectNode",node, true);
					me.catalogId=nid;
					me.getProductDataByCatalogId(nid);
				}
			}).fail(function(ret){
    			fish.error({title:'错误',message:'产品目录查询异常'});
    		});
		},  
		hideRMenu : function() {
			var me = this;
			var $rMenu = $("#rMenu");
			if ($rMenu) $rMenu.css({"visibility": "hidden"});
			$("body").off("mousedown", $.proxy(me.onBodyMouseDown,me));
		},
		showRMenu : function(type, x, y,targetElement) {
			var me = this;
			$("#rMenu ul").show();
			if (type=="root") {
				$("#m_del").hide();
				$("#m_check").hide();
				$("#m_unCheck").hide();
			} else {
				$("#m_del").show();
				$("#m_check").show();
				$("#m_unCheck").show();
			}
			$("#rMenu").css({"top":y+"px", "left":x+"px", "visibility":"visible"});
			$("body").on("mousedown", $.proxy(me.onBodyMouseDown,me));
		},
		OnRightClick : function(event, treeNode) {
			var me=this;
			if (!treeNode && event.target.tagName.toLowerCase() != "button" && $(event.target).parents("a").length == 0) {
				$("#iom-product-productCatalog").tree("cancelSelectedNode");
				me.showRMenu("root", event.clientX, event.clientY,event.target);
			} else if (treeNode && !treeNode.noR) {
				$("#iom-product-productCatalog").tree("selectNode",treeNode);
				me.showRMenu("node", event.clientX, event.clientY,event.target);
			}
		},
		onBodyMouseDown : function(event){
			if (!(event.target.id == "rMenu" || $(event.target).parents("#rMenu").length>0)) {
				$("#rMenu").css({"visibility" : "hidden"});
			}
		},
		addTreeSubNode : function() {
			var me = this;
			me.hideRMenu();
			var newNode = { name:'',id:'',pId:''};
			var selectedNodes = $("#iom-product-productCatalog").tree("getSelectedNodes");
			if (selectedNodes[0]) {
				newNode.checked = selectedNodes[0].checked;
				var pnode = selectedNodes[0];
				var pop =fish.popupView({
					url: 'modules/iom/product/views/productCatalogAddView',
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
							$("#iom-product-productCatalog").tree("addNodes",pnode,newNode);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			} else {
				$("#iom-product-productCatalog").tree("addNodes",null,newNode);
			}
		},
		addTreeNode : function() {
			var me = this;
			me.hideRMenu();
			var newNode = { name:'',id:'',pId:''};
			var selectedNodes = $("#iom-product-productCatalog").tree("getSelectedNodes");
			if (selectedNodes[0]) {
				newNode.checked = selectedNodes[0].checked;
				var pnode = me.$("#iom-product-productCatalog").tree("getNodeByParam", 'id', selectedNodes[0].pId);
				var pop =fish.popupView({
					url: 'modules/iom/product/views/productCatalogAddView',
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
							var code= e.CODE;
							var id = e.ID;
							var pId = e.PARENT_ID;
							newNode = { name:name,CODE:code,id:id,pId:pId};
							newNode.isParent = true;
							$("#iom-product-productCatalog").tree("addNodes",pnode,newNode);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			} else {
				$("#iom-product-productCatalog").tree("addNodes",null,newNode);
			}
		},
		updateTreeNode : function() {
			var me = this;
			me.hideRMenu();
			var newNode = { name:'',id:''};
			var selectedNodes = $("#iom-product-productCatalog").tree("getSelectedNodes");
			
			if (selectedNodes[0]) {
				newNode.checked = selectedNodes[0].checked;
				var pnode = me.$("#iom-product-productCatalog").tree("getNodeByParam", 'id', selectedNodes[0].pId);
				var currentNode = me.$("#iom-product-productCatalog").tree("getNodeByParam", 'id', selectedNodes[0].id);
				var pop =fish.popupView({
					url: 'modules/iom/product/views/productCatalogAddView',
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
						$("#iom-product-productCatalog").tree("updateNode",selectedNodes[0]);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
				
			} else {
				$("#iom-product-productCatalog").tree("updateNode",null,newNode);
			}
		},
		removeTreeNode : function() {
			var me = this;
			me.hideRMenu();
			var nodes = $("#iom-product-productCatalog").tree("getSelectedNodes");
			if (nodes && nodes.length>0) {
				if (nodes[0].children && nodes[0].children.length > 0) {
					var msg = "要删除的节点是父节点，如果删除将连同子节点一起删掉。\n\n请确认！";
					if (confirm(msg)==true){
						var id = nodes[0].id;
						utils.ajax('cloudIomServiceForWeb','deleteProductCatalog',id).done(function(ret){
							var data = JSON.parse(ret);
							var opreateResoult = data.opreateResoult;
							var opreateResoultMsg = data.opreateResoultMsg;
							if(false == opreateResoult){
								fish.info({title:'提示',message: opreateResoultMsg});
								return;
							}else{
								fish.info({title:'提示',message: opreateResoultMsg});
								$("#iom-product-productCatalog").tree("removeNode",nodes[0]);
								//me.popup.close(ret);
							} 
							
						}).fail(function(ret){
			    			fish.error({title:'错误',message:'产品目录删除异常'});
			    		});
					}
				} else {
					var id = nodes[0].id;
					utils.ajax('cloudIomServiceForWeb','deleteProductCatalog',id).done(function(ret){
						var data = JSON.parse(ret);
						var opreateResoult = data.opreateResoult;
						var opreateResoultMsg = data.opreateResoultMsg;
						if(false == opreateResoult){
							fish.info({title:'提示',message: opreateResoultMsg});
							return;
						}else{ 
							fish.info({title:'提示',message: opreateResoultMsg});
							$("#iom-product-productCatalog").tree("removeNode",nodes[0]);
						}
					}).fail(function(ret){
		    			fish.error({title:'错误',message:'产品目录删除异常'});
		    		});
					
					
				}
			}
		},
		resize: function() {
			$("#product-product-grid").grid("setGridHeight", $('#main-tabs-panel').height()-110);
			$("#iom-product-productCatalog").css({"height": $('#main-tabs-panel').height()-80, "overflow":"auto"});
			$("#product-product-grid").grid("resize");
		},
		checkTreeNode : function(checked) {
			var nodes = $("#iom-product-productCatalog").tree("getSelectedNodes");
			if (nodes && nodes.length>0) {
				$("#iom-product-productCatalog").tree("checkNode",nodes[0], checked, true);
			}
			hideRMenu();
		},
		loadProductGridRender: function() {
			var dcGridPerData = $.proxy(this.getProductDataByCatalogId,this); //函数作用域改变
			this.$("#product-product-grid").grid({
				datatype: "json",
				height: $(window).height()*0.695,
				colModel: [{
					name: 'NAME',
					label: '产品名称',
					sortable:false,
					width: 220
				},{
					name: 'CODE',
					sortable:false,
					width: 220,
					label: '产品编码'
				},{
					name: 'TYPE_ID',
					width: 220,
					label: 'TYPE_ID',
					hidden:true
				},{
					name: 'TYPE_NAME',
					width: 220,
					label: '产品类型',
					hidden:true
				},{
					name: 'ID',
					label: 'ID',
					width: 100,
					hidden:true
				}],
				rowNum: 10, 
				datatype: "json",
				pager: true,
				server: true,
				multiselect:false,
				shrinkToFit:true,
				onCellSelect: function(e, rowid, iCol, cellcontent) {
					$("#product-product-grid").grid("setAllCheckRows",false); 
					if (iCol != 0) {
						$("#product-product-grid").grid("setCheckRows",[rowid]);
					} 
				},
				pageData: dcGridPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		//新增产品 
		productAdd:function(){
			var me=this;
			var catalogId = me.catalogId;
			if('' == catalogId || undefined == catalogId){
				fish.info({title:'提示',message:'请选择产品目录！'});
				return;
			}
			var pop =fish.popupView({
				url: 'modules/iom/product/views/productAddView',
				width: "80%",
				viewOption : {"catalogId":catalogId},
				callback:function(popup,view){
					popup.result.then(function (e) {
						me.getProductDataByCatalogId(me.catalogId);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		openProductDetails:function(){  
			var me=this;
			var catalogId = me.catalogId;
			var selrow = this.$("#product-product-grid").grid("getSelection"); 
			if(null != selrow.ID || undefined != selrow.ID){    
				var pop =fish.popupView({
					url: 'modules/iom/product/views/productDetailView',
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
		openProductUpdate:function(){
			var me=this;
			var catalogId = me.catalogId;
			var selrow = this.$("#product-product-grid").grid("getSelection"); 
			if(null != selrow.ID || undefined != selrow.ID){    
				var pop =fish.popupView({
					url: 'modules/iom/product/views/productUpdateView',
					width: "80%", 
					viewOption:{
						action:"detail.spacerm-dc",
						productData:selrow,
						"catalogId":catalogId
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							me.getProductDataByCatalogId(me.catalogId);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		},
		
		deletePro:function(){
			var me=this;
			var selrow = this.$("#product-product-grid").grid("getSelection"); 
			if(null != selrow.ID || undefined != selrow.ID){     
				var arr = new Array(length);
				arr[0] = selrow.ID;
				fish.confirm('确认删除？').result.done(function() {
					utils.ajax('cloudIomServiceForWeb','delProd',arr).done(function(ret){
						me.getProductDataByCatalogId(me.catalogId);
					});
		        }).fail(function(){
		        	
		        });
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		}
		
		
	});
});