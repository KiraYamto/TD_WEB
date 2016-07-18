define([
	'text!modules/iom/timelimit/templates/flowLimitManageView.html',
	'i18n!modules/iom/timelimit/i18n/timeLimit.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/timelimit/styles/timeLimit.css'
], function(flowLimitViewTpl, i18nTimeLimit, utils, css) {
	return fish.View.extend({
		template: fish.compile(flowLimitViewTpl),
		i18nData: fish.extend({}, i18nTimeLimit),		
		events: {
			'click #iomFlowLimit-addBtn':'flowLimitAdd',
			'click #iomFlowLimit-detailBtn': 'flowLimitDetail',
			'click #iomFlowLimit-modBtn': 'flowLimitUpdate',
			'click #iomFlowLimit-delBtn': 'flowLimitDelete'
		},
		
		initialize: function() {
			this.selectedService = undefined;
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.loadServiceCatalogData();
			this.renderFlowLimitGrid();
			this.resize();
		},
		
		renderFlowLimitGrid: function() {
			this.$("#iomFlowLimit-grid").grid({
				datatype: "json",
				height: "auto",
				colModel: [
					  {name: 'serviceName', label: '服务名称'},
					  {name: 'limitValue', label: '完成时限值'},
					  {name: 'alertValue', label: '告警时限值'},
					  {name: 'timeUnitName', label: '时间单位'},
					  {name: 'isWorkTimeName',  label: '只计算工作日'},
					  {name: 'id', label: 'id', key: true, hidden:true},
					  {name: 'serviceId', label: 'serviceId', hidden:true},
					  {name: 'timeUnit', label: 'timeUnit', hidden:true},
					  {name: 'isWorkTime',  label: 'isWorkTime', hidden:true}
				],
				onCellSelect: function(e, rowid, iCol, cellcontent) {
					if (iCol != 0) {
						$("#iomFlowLimit-grid").grid("setCheckRows",[rowid]);
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
		loadServiceCatalogData : function(){	
			var me=this;
			utils.ajax('cloudIomServiceForWeb','qryServiceCatalogTree').done(function(ret){
				var options = {
						fNodes : ret,
						check: {
							enable:false,
							chkboxType:{"Y":"s","N":"ps"}
						},
						view: {
							dblClickExpand: true,
							showLine : true,
							showIcon : true,
							fontCss: function(treeNode){
								return treeNode.highlight ? {color: "#096eca", "font-weight": "bold"} : {color: "#333", "font-weight": "normal"};
							}
						},
						callback: {
							onClick: function(e, treeNode, clickFlag) {
								if (treeNode.type == 'service') {
									me.selectedService = treeNode;
									me.getFlowLimitByServiceId(1, me.$("#iomFlowLimit-grid").grid("getGridParam", "rowNum"), null, null);
								}
							}
						}
				};
				$('#iomFlowLimit-serviceCatalog').tree(options); 
				$('#iomFlowLimit-serviceCatalog').niceScroll({
					cursorcolor: '#1d5987',
					cursorwidth: "10px",
			        cursoropacitymax:"0.2"
				});
			}).fail(function(ret){
    			fish.error({title:'错误',message:'服务目录查询异常'});
    		});
		},
		
		getFlowLimitByServiceId: function(page, rowNum, sortname, sortorder) {
			var me=this;
			var map = {};
			map.serviceId = me.selectedService.id;
			map.pageIndex = page?page:1;
			map.pageSize = rowNum?rowNum:me.$("#iomFlowLimit-grid").grid("getGridParam", "rowNum");
			
			var serviceName = me.selectedService.name;
			
			$("#iomFlowLimit-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb', 'qryFlowLimitByServiceId', map).done(function(ret){
				$.each(ret, function(i, n) {
					n.serviceName = serviceName;
					if (n.isWorkTime == 'Y') {
						n.isWorkTimeName = '是';
					} else {
						n.isWorkTimeName = '否';
					}
				});
				$("#iomFlowLimit-grid").grid("reloadData", {rows: ret});
			}).fail(function(ret){
    			fish.error({title:'错误',message:'流程时限查询异常'});
    		}).always(function(ret){
    			$("#iomFlowLimit-grid").unblockUI().data('blockui-content', false);
    		});
		},
		
		//新增
		flowLimitAdd:function(){
			var me = this;
			var selectedNode = $('#iomFlowLimit-serviceCatalog').tree("getSelectedNodes");
			if (selectedNode.length == 0 || selectedNode[0].type!='service') {
				fish.info({title:'提示',message:'请选择一个服务'});
				return;
			}
			
			this.recursiveExpandNode(selectedNode[0]);
			fish.popupView({
				url: 'modules/iom/timelimit/views/flowLimitAddView',
				width: "54%",
				viewOption: {
					serviceId: selectedNode[0].id,
					serviceName: selectedNode[0].name
				},callback:function(popup,view){
					popup.result.then(function (e) {
						me.getFlowLimitByServiceId();
					});
				}
			});
		},
		
		//详情
		flowLimitDetail:function(){ 
			var me = this;
			var selections = this.$("#iomFlowLimit-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1){
				fish.popupView({
					url: 'modules/iom/timelimit/views/flowLimitDetailView',
					width: "60%",
					viewOption: {
						flowLimitId: selections[0].id,
						serviceName: selections[0].serviceName
					}
				});
			} else if (selections.length > 1) {
				fish.info({title:'提示',message:'一次只能操作一条记录'});
			}  else {
				fish.info({title:'提示',message:'请勾选一条流程时限'});
			}
		},
		
		//修改
		flowLimitUpdate:function(){
			var me = this;
			var selections = this.$("#iomFlowLimit-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1){
				fish.popupView({
					url: 'modules/iom/timelimit/views/flowLimitUpdateView',
					width: "54%",
					viewOption: {
						flowLimitId: selections[0].id,
						serviceName: selections[0].serviceName,
						finishLimit: selections[0].limitValue,
						alertLimit: selections[0].alertValue,
						timeUnit: selections[0].timeUnit,
						isWorkingDays: selections[0].isWorkTime
					},callback:function(popup,view){
						popup.result.then(function (e) {
							me.getFlowLimitByServiceId();
						});
					}
				});
			} else if (selections.length > 1) {
				fish.info({title:'提示',message:'一次只能操作一条记录'});
			}  else {
				fish.info({title:'提示',message:'请勾选需要修改的流程时限'});
			}
		},
		
		//删除
		flowLimitDelete:function(){
			var me = this;
			var selections = this.$("#iomFlowLimit-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length > 0){
				var idList = [];
				$.each(selections, function(i, n) {
					idList.push(n.id);
				});
				
				fish.confirm('是否确定要删除流程时限？').result.done(function() {
					utils.ajax('cloudIomServiceForWeb', 'deleteFlowLimit', idList).done(function(ret){
						fish.info({title:'提示',message:'删除流程时限成功'});
						me.getFlowLimitByServiceId();
					}).fail(function(ret){
		    			fish.error({title:'错误',message:'删除流程时限异常'});
		    		});
		        });
			} else {
				fish.info({title:'提示',message:'请勾选需要删除的流程时限'});
			}
		},
		
		resize: function() {
			$("#iomFlowLimit-grid").grid("setGridHeight", $('#main-tabs-panel').height()-95);
			$("#iomFlowLimit-serviceCatalog").css({"height": $('#main-tabs-panel').height()-80, "overflow":"auto"});
			$("#iomFlowLimit-grid").grid("resize",true);
		},
		
		recursiveExpandNode: function(node) {
			if (node != null) {
				$("#iomFlowLimit-serviceCatalog").tree("expandNode", node.getParentNode(), true, false, true);
				this.recursiveExpandNode(node.getParentNode());
			}	
		}
	});
});