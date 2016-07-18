define([
	'text!modules/iom/flow/templates/tacheButtonSelView.html'+codeVerP,
	'i18n!modules/iom/flow/i18n/tacheManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/flow/styles/tacheManage.css'+codeVerP
], function(tacheButtonSelViewTpl, i18nflowTacheManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(tacheButtonSelViewTpl),
		i18nData: fish.extend({}, i18nflowTacheManage),
		catalogId:null,
		events: {
			'click #iom-flowTache-add-btn':'tacheAdd',
			'click #iom-flowTache-detail-btn': 'openTacheDetails'
			
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
			this.loadButtonGridRender();
			this.loadTacheCatalogData();
		},
		
		/* 加载目录信息 */
		loadTacheCatalogData : function(){	
			var me=this;
			/*utils.ajax('cloudIomServiceForWeb','getFlowTacheCatalog').done(function(ret){
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
								me.getFlowTacheCatalogList(catalogId);
							},
							onRightClick: $.proxy(me.OnRightClick,me)
						}
				};
				$('#iom-flow-buttonCatalog').tree(options); 
				$("#iom-flow-buttonCatalog").on("contextmenu", function() { // 禁止右击
					return false;
				}) 
				if(root.length>0){
					var nid = root[0].id;
					node = me.$("#iom-flow-buttonCatalog").tree("getNodeByParam", 'ID', nid);
					me.$('#iom-flow-buttonCatalog').tree("selectNode",node, true);
					me.catalogId=nid;
					me.getFlowTacheCatalogList(nid);
				}
			}).fail(function(ret){
    			fish.error({title:'错误',message:'按钮目录查询异常'});
    		});*/
		},   
		//根据目录id查询环节信息
		getFlowTacheCatalogList: function(catalogId) { //请求服务器获取数据的方法
			var me=this;
			var map = new Object();
			var rowNum = this.$("#iom-flowbutton-grid").grid("getGridParam", "rowNum");
			var page = this.$("#iom-flowbutton-grid").grid("getGridParam", "page"); 
			if('' == catalogId || undefined == catalogId || null == catalogId){
				map.catalogId = me.catalogId+"";
			}else{
				map.catalogId = me.catalogId+"";
			}
			map.pageIndex = (page-1);
			map.pageSize = 10;
			$("#iom-flowbutton-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			/*utils.ajax('cloudIomServiceForWeb','getFlowTacheCatalogList',map).done(function(ret){
				ret = JSON.parse(ret);
				if(ret!=null){
					if(ret.length == 0){
						ret = "";
					} 
					if(ret.total > 0){
						for(var i = 0 ;i<ret.total;i++){ 
						}
					}
					$("#iom-flowbutton-grid").grid("reloadData", ret);
				}
			}).fail(function(ret){
    			fish.error({title:'错误',message:'环节管理查询异常'});
    		});*/
			$("#iom-flowbutton-grid").unblockUI().data('blockui-content', false);
		},
		loadTacheGridRender: function() {
			var dcGridPerData = $.proxy(this.getFlowTacheCatalogList,this); //函数作用域改变
			this.$("#iom-flowbutton-grid").grid({
				datatype: "json",
				height: 200,
				colModel: [{
					name: 'tacheName',
					label: '按钮名称',
					width: 220
				},{
					name: 'tacheCode',
					width: 220,
					label: '动作函数'
				},{
					name: 'stateText',
					width: 220,
					label: '图标文件' 
				},{
					name: 'state',
					width: 220,
					label: '链接页面' 
				},{
					name: 'effDate',
					width: 300,
					label: '高度'
				},{
					name: 'expDate',
					width: 300,
					label: '宽度'
				},{
					name: 'id',
					label: 'ID',
					width: 100, 
					hidden:true
				}],
				rowNum: 10, 
				datatype: "json",
				pager: true,
				pgnumbers : false,
				server: true,
				multiselect:false,
				pageData: dcGridPerData, //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
				onSelectRow:function( e, rowid, iRow, iCol){
					//iRow.find('.cbox').prop("checked", true);
				}, 
			    onRowCollapse:function(e, rowData){
			        console.log(rowData);
			    }
			});
		},
		loadButtonGridRender: function() {
			var dcGridPerData = $.proxy(this.getFlowTacheCatalogList,this); //函数作用域改变
			this.$("#iom-flowbuttonadd-grid").grid({
				datatype: "json",
				height: 180,
				colModel: [{
					name: 'tacheName',
					label: '显示名称',
					width: 220
				},{
					name: 'tacheCode',
					width: 220,
					label: '路径'
				},{
					name: 'stateText',
					width: 220,
					label: '按钮名称' 
				},{
					name: 'state',
					width: 220,
					label: '显示顺序',
					hidden:true
				},{
					name: 'effDate',
					width: 300,
					label: '高度'
				},{
					name: 'expDate',
					width: 300,
					label: '动作函数'
				},{
					name: 'expDate',
					width: 300,
					label: '工单类型'
				},{
					name: 'id',
					label: 'ID',
					width: 100, 
					hidden:true
				}], 
				datatype: "local", 
				pgnumbers : false,
				server: false, 
				pageData: dcGridPerData, //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
				onSelectRow:function( e, rowid, iRow, iCol){
					//iRow.find('.cbox').prop("checked", true);
				} 
			});
		},
		
		//新增环节版本
		tacheAdd:function(){
			var selections = this.$("#iom-flowbutton-grid").grid("getCheckRows");//返回所有被选中的行
			var me=this;
			var catalogId = me.catalogId;
			if('' == catalogId || undefined == catalogId){
				fish.info({title:'提示',message:'请选择环节目录！'});
				return;
			}
			if(selections.length == 1){
				var rowData = selections[0];
				if(true==rowData.isLeaf){
					fish.info({title:'提示',message:'您选择的是环节版本，请选择环节目录！'});
					return;
				}
				var children = $("#iom-flowbutton-grid").grid("getNodeChildren", rowData);
				var pop =fish.popupView({
					url: 'modules/iom/flow/views/tacheAddView',
					width: "60%",
					viewOption : {
						"catalogId":catalogId,
						tacheData : rowData
					},
					callback:function(popup,view){
						popup.result.then(function (e) { 
							//me.getFlowTacheCatalogList(me.catalogId);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}else if(selections.length > 1){
				fish.info({title:'提示',message:'一次只能操作一条记录！'});
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		} 
		
	});
});