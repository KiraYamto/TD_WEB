define([
	'text!modules/iom/timelimit/templates/flowLimitDetailView.html',
	'i18n!modules/iom/timelimit/i18n/timeLimit.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/timelimit/styles/timeLimit.css'
], function(flowLimitDetailViewTpl, i18nTimeLimit, utils, css) {
	return fish.View.extend({
		template: fish.compile(flowLimitDetailViewTpl),
		i18nData: fish.extend({}, i18nTimeLimit),
		events: {
			'click #iomFlowLimit-applyRule-add':'addApplyRule',
			'click #iomFlowLimit-applyRule-del':'delApplyRule',
			'click #iomFlowLimit-applyRule-save':'saveApplyRule'
		},
		
		initialize: function() {

		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			//初始化tab
			$('#iomFlowLimit-applyRule-tabs').tabs();
			
			//初始化grid
			this.renderApplyRuleGrid();
			
			//隐藏按钮
			$('#iomFlowLimit-applyRule-save').hide();
			$('#iomFlowLimit-applyRule-del').hide();
			
			//隐藏全选按钮
			$("#cb_iomFlowLimit-applyRule-grid").hide();
			
			//查询适用规则
			this.queryFlowLimitApplyRule();
			
			//初始化combobox
			$('#iomFlowLimit-applyRule-orderPriority').combobox();
			$('#iomFlowLimit-applyRule-custType').combobox();
			this.qryAllOrderPrioritiesAndCustTypes();
			
			//清空其他条件
			$('#iomFlowLimit-applyRule-otherConds').empty();
			
			this.resize();
		},
		
		renderApplyRuleGrid: function() {
			var me = this;
			this.$("#iomFlowLimit-applyRule-grid").grid({
				datatype: "json",
				height: 250,
				colModel: [
					  {name: 'orderPriorityName', label: '定单等级'},
					  {name: 'custTypeName', label: '客户类型'},
					  {name: 'otherCond', label: '其他条件'},
					  {name: 'slaExtValue1', label: '扩展维度1', hidden:true},
					  {name: 'slaExtValue2', label: '扩展维度2', hidden:true},
					  {name: 'slaExtValue3',  label: '扩展维度3', hidden:true},
					  {name: 'slaExtValue4',  label: '扩展维度4', hidden:true},
					  {name: 'slaExtValue5',  label: '扩展维度5', hidden:true},
					  {name: 'id', label: 'id', key: true, hidden:true},
					  {name: 'orderPriority', label: 'orderPriority', hidden:true},
					  {name: 'custType', label: 'custType', hidden:true}
				],
				onCellSelect: function(e, rowid, iCol, cellcontent) {
					if (iCol != 0) {
						$("#iomFlowLimit-applyRule-grid").grid("setCheckRows",[rowid]);
						$("#iomFlowLimit-applyRule-grid").grid("setSelection", rowid, true);
					} 
				},
				onSelectChange: function(e, rowid, state, checked) {
					if (checked) {
						//强制一次只能选中一行
						$("#iomFlowLimit-applyRule-grid").grid("setAllCheckRows",false);
						$("#iomFlowLimit-applyRule-grid").grid("setCheckRows",[rowid],true);
						
						//隐藏增加，显示修改、删除
						$('#iomFlowLimit-applyRule-add').hide();
						$('#iomFlowLimit-applyRule-save').show();
						$('#iomFlowLimit-applyRule-del').show();
						
						//填充表单
						var row = $("#iomFlowLimit-applyRule-grid").grid("getCheckRows")[0];
						$('#iomFlowLimit-applyRule-orderPriority').combobox('value', row.orderPriority);
						$('#iomFlowLimit-applyRule-custType').combobox('value', row.custType);
					} else {
						$('#iomFlowLimit-applyRule-add').show();
						$('#iomFlowLimit-applyRule-save').hide();
						$('#iomFlowLimit-applyRule-del').hide();
						
						//清空表单
						$('#iomFlowLimit-applyRule-orderPriority').combobox('value', '');
						$('#iomFlowLimit-applyRule-custType').combobox('value', '');
						$('#iomFlowLimit-applyRule-otherConds').val('');
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
		
		queryFlowLimitApplyRule: function() {
			var paramsMap = {};
			paramsMap.flowLimitId = this.options.flowLimitId;
			$("#iomFlowLimit-applyRule-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb', 'queryFlowLimitApplyRule', paramsMap).done(function(ret){
				$("#iomFlowLimit-applyRule-grid").grid("reloadData", {rows: ret});
				$("#iomFlowLimit-applyRule-grid").unblockUI().data('blockui-content', false);
			}).fail(function(ret){
    			fish.error({title:'错误',message:'流程时限适用规则查询异常'});
    			$("#iomFlowLimit-applyRule-grid").unblockUI().data('blockui-content', false);
    		});
		},
		
		qryAllOrderPrioritiesAndCustTypes: function() {
			utils.ajax('cloudIomServiceForWeb', 'qryAllOrderPrioritiesAndCustTypes').done(function(ret){
				var orderPriorities = ret.orderPriorities;
				$('#iomFlowLimit-applyRule-orderPriority').combobox({dataSource: orderPriorities});
				
				var custTypes = ret.custTypes;
				$('#iomFlowLimit-applyRule-custType').combobox({dataSource: custTypes});
			});
		},

		addApplyRule: function() {
			var me=this;
			var isValid = $("#iomFlowLimit-applyRule-form").isValid();
			if(false==isValid){
				return;
			}
			
			var orderPriority = $('#iomFlowLimit-applyRule-orderPriority').combobox('value');
			var custType = $('#iomFlowLimit-applyRule-custType').combobox('value');
			var existingRows = $("#iomFlowLimit-applyRule-grid").grid('getGridParam','data');

			//筛选重复记录
			var duplicate = _.filter(existingRows, function(row) {
				return row.orderPriority==orderPriority && row.custType==custType;
			});
			if (duplicate.length > 0) {
				fish.error({
					title:'错误', 
					message:'流程时限适用规则已存在'
								+'，服务：'+me.options.serviceName
								+'，定单处理等级：'+$('#iomFlowLimit-applyRule-orderPriority').combobox('text')
								+'，客户类型：'+$('#iomFlowLimit-applyRule-custType').combobox('text')
				});
				return;
			}

			var paramsMap = {
				flowLimitId: me.options.flowLimitId,
				orderPriority: orderPriority,
				custType: custType
			};
			$("#iomFlowLimit-applyRule-tabs-a").blockUI({message: '添加中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb', 'addFlowLimitApplyRule', paramsMap).done(function(ret){
				fish.info({title:'提示',message:'增加流程时限适用规则成功'});
			}).fail(function(ret){
				fish.error({title:'错误',message:'增加流程时限适用规则异常'});
			}).always(function(ret){
				$("#iomFlowLimit-applyRule-tabs-a").unblockUI().data('blockui-content', false);
				me.queryFlowLimitApplyRule();
			});
		},
		
		delApplyRule: function() {
			var me = this;
			var selections = this.$("#iomFlowLimit-applyRule-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length > 0){
				var idList = [];
				$.each(selections, function(i, n) {
					idList.push(n.id);
				});
				
				fish.confirm('是否确定要删除流程时限适用规则？').result.done(function() {
					$("#iomFlowLimit-applyRule-tabs-a").blockUI({message: '删除中'}).data('blockui-content', true);
					utils.ajax('cloudIomServiceForWeb', 'deleteFlowLimitApplyRule', idList).done(function(ret){
						fish.info({title:'提示',message:'删除流程时限适用规则成功'});
					}).fail(function(ret){
		    			fish.error({title:'错误',message:'删除流程时限适用规则异常'});
		    		}).always(function(ret){
		    			$("#iomFlowLimit-applyRule-tabs-a").unblockUI().data('blockui-content', false);
						me.queryFlowLimitApplyRule();
						$("#iomFlowLimit-applyRule-grid").grid("resetSelection");
					});
		        });
			} else {
				fish.info({title:'提示',message:'请勾选需要删除的流程时限适用规则'});
			}
		},
		
		saveApplyRule: function() {
			var me=this;
			var isValid = $("#iomFlowLimit-applyRule-form").isValid();
			if(false==isValid){
				return;
			}
			var flowLimitApplyRuleId = $("#iomFlowLimit-applyRule-grid").grid("getCheckRows")[0].id;
			var orderPriority = $('#iomFlowLimit-applyRule-orderPriority').combobox('value');
			var custType = $('#iomFlowLimit-applyRule-custType').combobox('value');
			var existingRows = $("#iomFlowLimit-applyRule-grid").grid('getGridParam','data');
			//筛选重复记录
			var duplicate = _.filter(existingRows, function(row) {
				return row.orderPriority==orderPriority && row.custType==custType;
			});
			if (duplicate.length > 0) {
				fish.error({
					title:'错误', 
					message:'流程时限适用规则已存在'
								+'，服务：'+me.options.serviceName
								+'，定单处理等级：'+$('#iomFlowLimit-applyRule-orderPriority').combobox('text')
								+'，客户类型：'+$('#iomFlowLimit-applyRule-custType').combobox('text')
				});
				return;
			}
			
			var paramsMap = {
				id: flowLimitApplyRuleId,
				orderPriority: orderPriority,
				custType: custType
			};
			$("#iomFlowLimit-applyRule-tabs-a").blockUI({message: '保存中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb', 'updateFlowLimitApplyRule', paramsMap).done(function(ret){
				fish.info({title:'提示',message:'修改流程时限适用规则成功'});
			}).fail(function(ret){
				fish.error({title:'错误',message:'修改流程时限适用规则异常'});
			}).always(function(ret){
				$("#iomFlowLimit-applyRule-tabs-a").unblockUI().data('blockui-content', false);
				me.queryFlowLimitApplyRule();
				$("#iomFlowLimit-applyRule-grid").grid("resetSelection");
			});
		},
		
		resize: function() {
			$("#iomFlowLimit-applyRule-grid").grid('resize');
		}
	});
});