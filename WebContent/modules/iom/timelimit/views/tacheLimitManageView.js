define([
	'text!modules/iom/timelimit/templates/tacheLimitManageView.html'+codeVerP,
	'i18n!modules/iom/timelimit/i18n/timeLimit.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/timelimit/styles/timeLimit.css'+codeVerP
], function(tacheLimitViewTpl, i18nTimeLimit, utils, css) {
	return fish.View.extend({
		template: fish.compile(tacheLimitViewTpl),
		i18nData: fish.extend({}, i18nTimeLimit),
		selectedTache: undefined,
		events: {
			'click #iomTacheLimit-addBtn':'tacheLimitAdd',
			'click #iomTacheLimit-detailBtn': 'tacheLimitDetail',
			'click #iomTacheLimit-modBtn': 'tacheLimitUpdate',
			'click #iomTacheLimit-delBtn': 'tacheLimitDelete',
			/*'input #iomTacheLimit-searchInput': 'search'*/
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.loadTacheCatalogData();
			this.renderTacheLimitGrid();
			this.resize();
		},
		
		renderTacheLimitGrid: function() {
			this.$("#iomTacheLimit-grid").grid({
				datatype: "json",
				height: "auto",
				colModel: [
					  {name: 'tachePath', label: '环节路径'},
					  {name: 'tacheName', label: '环节名称'},
					  {name: 'limitValue', label: '完成时限值'},
					  {name: 'alertValue', label: '告警时限值'},
					  {name: 'timeUnitName', label: '时间单位'},
					  {name: 'isWorkTimeName',  label: '只计算工作日'},
					  {name: 'id', label: 'id', key: true, hidden:true},
					  {name: 'tacheId', label: 'tacheId', hidden:true},
					  {name: 'timeUnit', label: 'timeUnit', hidden:true},
					  {name: 'isWorkTime',  label: 'isWorkTime', hidden:true}
				],
				onCellSelect: function(e, rowid, iCol, cellcontent) {
					if (iCol != 0) {
						$("#iomTacheLimit-grid").grid("setCheckRows",[rowid]);
					} 
				},
				cmTemplate:{sortable: false},
				datatype: "json",
				multiselect:true,
				shrinkToFit:true,
				autowidth: true,
				autoResizable: true
			});
		},
		
		/* 加载目录信息 */
		loadTacheCatalogData : function(){	
			var me=this;
			/*var getFontCss = $.proxy(this.getFontCss,this);*/
			utils.ajax('cloudIomServiceForWeb','getFlowTacheCatalog').done(function(ret){
				var root = [];
				ret = JSON.parse(ret);
				if (ret){
					$.each(ret, function(i, n) {
						var children = n.children;
						n.name = n.text;
						n.isParent = true;
						if(undefined != children && children.length > 0){
							$.each(children, function(j, m) {
								m.name = m.text;
								m.isParent = true;
							});
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
								leaf : false
							}
						},
						view: {
							dblClickExpand: true,
							showLine : true,
							showIcon : true
							/*fontCss: getFontCss*/
						},
						check: {
							enable: false
						},
						callback: {
							onExpand: function(e, treeNode, clickFlag) {
								if (treeNode.isParent == true) {
									//已加载环节，跳出
									var children = treeNode.children;
									var tacheChildren = _.filter(children, function(o){return o.tacheName!=undefined;});
									if (tacheChildren.length > 0) {
										return;
									}
									
									//未加载环节，查询环节
									var catalogId = treeNode.id;
									$("#iomTacheLimit-tacheCatalog").blockUI({message: '加载中'}).data('blockui-content', true);
									utils.ajax('cloudIomServiceForWeb','getFlowTacheListNoPage',{catalogId:catalogId}).done(function(ret){
										ret = JSON.parse(ret);
										var taches = ret.rows;
										var validTaches = []
										$.each(taches, function(i, n) {
											if (n.state == '10A') {
												n.name = n.tacheName;
												n.isParent = false;
												validTaches.push(n);
											}
										});
										if (validTaches.length > 0) {
											me.$("#iomTacheLimit-tacheCatalog").tree("addNodes", treeNode, validTaches);
										}
									}).always(function(ret){
										$("#iomTacheLimit-tacheCatalog").unblockUI().data('blockui-content', false);
									});
								}
							},
							onClick: function(e, treeNode, clickFlag) {
								if (treeNode.tacheName) {
									me.selectedTache = treeNode;
									me.getTacheLimitByTacheId(1, me.$("#iomTacheLimit-grid").grid("getGridParam", "rowNum"), null, null);
								}
							}
						}
				};
				$('#iomTacheLimit-tacheCatalog').tree(options); 
				$('#iomTacheLimit-tacheCatalog').niceScroll({
					cursorcolor: '#1d5987',
					cursorwidth: "10px",
			        cursoropacitymax:"0.2"
				});
			}).fail(function(ret){
    			fish.error({title:'错误',message:'环节目录查询异常'});
    		});
		},
		
		getTacheLimitByTacheId: function(page, rowNum, sortname, sortorder) {
			var me=this;
			var map = {};
			map.tacheId = me.selectedTache.id;
			map.pageIndex = page?page:1;
			map.pageSize = rowNum?rowNum:me.$("#iomTacheLimit-grid").grid("getGridParam", "rowNum");
			
			var tachePath = "";
			var node = me.selectedTache;
			while (node.getParentNode() != null) {
				tachePath = tachePath + node.getParentNode().name + "/";
				node = node.getParentNode();
			}
			tachePath = tachePath.substr(0, tachePath.length-1);
			var tacheName = me.selectedTache.tacheName;
			
			$("#iomTacheLimit-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb', 'qryTacheLimitByTacheId', map).done(function(ret){
				ret = JSON.parse(ret);
				var rows = ret.rows;
				$.each(rows, function(i, n) {
					n.tachePath = tachePath;
					n.tacheName = tacheName;
					if (n.isWorkTime == 'Y') {
						n.isWorkTimeName = '是';
					} else {
						n.isWorkTimeName = '否';
					}
				});
				$("#iomTacheLimit-grid").grid("reloadData", ret);
				$("#iomTacheLimit-grid").unblockUI().data('blockui-content', false);
			}).fail(function(ret){
    			fish.error({title:'错误',message:'环节时限查询异常'});
    			$("#iomTacheLimit-grid").unblockUI().data('blockui-content', false);
    		});
		},
		
		//新增
		tacheLimitAdd:function(){
			var me = this;
			var selectedNode = $('#iomTacheLimit-tacheCatalog').tree("getSelectedNodes");
			if (selectedNode.length == 0 || !selectedNode[0].tacheName) {
				fish.info({title:'提示',message:'请选择一个环节'});
				return;
			}
			
			this.recursiveExpandNode(selectedNode[0]);
			fish.popupView({
				url: 'modules/iom/timelimit/views/tacheLimitAddView',
				width: "54%",
				viewOption: {
					tacheId: selectedNode[0].id,
					tacheName: selectedNode[0].tacheName
				},callback:function(popup,view){
					popup.result.then(function (e) {
						me.getTacheLimitByTacheId();
					});
				}
			});
		},
		
		//详情
		tacheLimitDetail:function(){ 
			var me = this;
			var selections = this.$("#iomTacheLimit-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1){
				fish.popupView({
					url: 'modules/iom/timelimit/views/tacheLimitDetailView',
					width: "60%",
					viewOption: {
						tacheLimitId: selections[0].id,
						tacheName: selections[0].tacheName
					}
				});
			} else if (selections.length > 1) {
				fish.info({title:'提示',message:'一次只能操作一条记录'});
			}  else {
				fish.info({title:'提示',message:'请勾选一条环节时限'});
			}
		},
		
		//修改
		tacheLimitUpdate:function(){
			var me = this;
			var selections = this.$("#iomTacheLimit-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1){
				fish.popupView({
					url: 'modules/iom/timelimit/views/tacheLimitUpdateView',
					width: "54%",
					viewOption: {
						tacheLimitId: selections[0].id,
						tacheName: selections[0].tacheName,
						finishLimit: selections[0].limitValue,
						alertLimit: selections[0].alertValue,
						timeUnit: selections[0].timeUnit,
						isWorkingDays: selections[0].isWorkTime
					},callback:function(popup,view){
						popup.result.then(function (e) {
							me.getTacheLimitByTacheId();
						});
					}
				});
			} else if (selections.length > 1) {
				fish.info({title:'提示',message:'一次只能操作一条记录'});
			}  else {
				fish.info({title:'提示',message:'请勾选需要修改的环节时限'});
			}
		},
		
		//删除
		tacheLimitDelete:function(){
			var me = this;
			var selections = this.$("#iomTacheLimit-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length > 0){
				var idList = [];
				$.each(selections, function(i, n) {
					idList.push(n.id);
				});
				
				fish.confirm('是否确定要删除环节时限？').result.done(function() {
					utils.ajax('cloudIomServiceForWeb', 'deleteTacheLimit', idList).done(function(ret){
						fish.info({title:'提示',message:'删除环节时限成功'});
						me.getTacheLimitByTacheId();
					}).fail(function(ret){
		    			fish.error({title:'错误',message:'删除环节时限异常'});
		    		});
		        });
			} else {
				fish.info({title:'提示',message:'请勾选需要删除的环节时限'});
			}
		},
		
		resize: function() {
			$("#iomTacheLimit-grid").grid("setGridHeight", $('#main-tabs-panel').height()-95);
			$("#iomTacheLimit-tacheCatalog").css({"height": $('#main-tabs-panel').height()-80, "overflow":"auto"});
			$("#iomTacheLimit-grid").grid("resize",true);
		},
		
		recursiveExpandNode: function(node) {
			if (node != null) {
				$("#iomTacheLimit-tacheCatalog").tree("expandNode", node.getParentNode(), true, false, true);
				this.recursiveExpandNode(node.getParentNode());
			}	
		}
		
		/*search: function() {
			var nodeList = $("#iomTacheLimit-tacheCatalog").tree("getNodesByParamFuzzy", "name", $('#iomTacheLimit-searchInput').val());
			if (nodeList.length > 0) {
				for (var i = 0, l = nodeList.length; i < l; i++) {
					nodeList[i].highlight = true;
					//$("#iomTacheLimit-tacheCatalog").tree("expandNode", nodeList[i]);
					$("#iomTacheLimit-tacheCatalog").tree("updateNode", nodeList[i]);
				}
			} else {
				nodeList = $("#iomTacheLimit-tacheCatalog").tree("getNodes");
				for (var i = 0, l = nodeList.length; i < l; i++) {
					nodeList[i].highlight = false;
					$("#iomTacheLimit-tacheCatalog").tree("updateNode", nodeList[i]);
				}
			}
		},
		
		getFontCss: function(treeNode) {
			return (!!treeNode.highlight) ? {color: "#A60000", "font-weight": "bold"} : {
				color: "#333",
				"font-weight": "normal"
			};
		}*/
	});
});