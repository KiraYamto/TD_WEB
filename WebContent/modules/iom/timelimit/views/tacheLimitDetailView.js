define([
	'text!modules/iom/timelimit/templates/tacheLimitDetailView.html'+codeVerP,
	'i18n!modules/iom/timelimit/i18n/timeLimit.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/timelimit/styles/timeLimit.css'+codeVerP
], function(tacheLimitDetailViewTpl, i18nTimeLimit, utils, css) {
	return fish.View.extend({
		template: fish.compile(tacheLimitDetailViewTpl),
		i18nData: fish.extend({}, i18nTimeLimit),
		events: {
			'click #iomTacheLimit-applyRule-add':'addApplyRule',
			'click #iomTacheLimit-applyRule-del':'delApplyRule',
			'click #iomTacheLimit-applyRule-save':'saveApplyRule',
			'click #iomTacheLimit-applyRule-selectService':'selectService'
		},
		
		selectedService: [],
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			//初始化tab
			$('#iomTacheLimit-applyRule-tabs').tabs();
			
			//初始化grid
			this.renderApplyRuleGrid();
			
			//隐藏按钮
			$('#iomTacheLimit-applyRule-save').hide();
			$('#iomTacheLimit-applyRule-del').hide();
			
			//隐藏全选按钮
			$("#cb_iomTacheLimit-applyRule-grid").hide();
			
			//查询适用规则
			this.queryTacheLimitApplyRule();
			
			//初始化combobox
			$('#iomTacheLimit-applyRule-orderPriority').combobox();
			$('#iomTacheLimit-applyRule-custType').combobox();
			this.qryAllOrderPrioritiesAndCustTypes();
			
			//清空其他条件
			$('#iomTacheLimit-applyRule-otherConds').empty();
			
			this.resize();
		},
		
		renderApplyRuleGrid: function() {
			var me = this;
			this.$("#iomTacheLimit-applyRule-grid").grid({
				datatype: "json",
				height: 250,
				colModel: [
					  {name: 'serviceName', label: '服务'},
					  {name: 'orderPriorityName', label: '定单等级'},
					  {name: 'custTypeName', label: '客户类型'},
					  {name: 'otherCond', label: '其他条件'},
					  {name: 'slaExtValue1', label: '扩展维度1', hidden:true},
					  {name: 'slaExtValue2', label: '扩展维度2', hidden:true},
					  {name: 'slaExtValue3',  label: '扩展维度3', hidden:true},
					  {name: 'slaExtValue4',  label: '扩展维度4', hidden:true},
					  {name: 'slaExtValue5',  label: '扩展维度5', hidden:true},
					  {name: 'id', label: 'id', key: true, hidden:true},
					  {name: 'serviceId', label: 'serviceId', hidden:true},
					  {name: 'orderPriority', label: 'orderPriority', hidden:true},
					  {name: 'custType', label: 'custType', hidden:true}
				],
				onCellSelect: function(e, rowid, iCol, cellcontent) {
					if (iCol != 0) {
						$("#iomTacheLimit-applyRule-grid").grid("setCheckRows",[rowid]);
						$("#iomTacheLimit-applyRule-grid").grid("setSelection", rowid, true);
					} 
				},
				onSelectChange: function(e, rowid, state, checked) {
					if (checked) {
						//强制一次只能选中一行
						$("#iomTacheLimit-applyRule-grid").grid("setAllCheckRows",false);
						$("#iomTacheLimit-applyRule-grid").grid("setCheckRows",[rowid],true);
						
						//隐藏增加，显示修改、删除
						$('#iomTacheLimit-applyRule-add').hide();
						$('#iomTacheLimit-applyRule-save').show();
						$('#iomTacheLimit-applyRule-del').show();
						
						//填充表单
						var row = $("#iomTacheLimit-applyRule-grid").grid("getCheckRows")[0];
						$('#iomTacheLimit-applyRule-service').val(row.serviceName);
						$('#iomTacheLimit-applyRule-orderPriority').combobox('value', row.orderPriority);
						$('#iomTacheLimit-applyRule-custType').combobox('value', row.custType);
						
						me.selectedService = [{id: row.serviceId}];
						
						$('#iomTacheLimit-applyRule-selectService').hide();
					} else {
						$('#iomTacheLimit-applyRule-add').show();
						$('#iomTacheLimit-applyRule-save').hide();
						$('#iomTacheLimit-applyRule-del').hide();
						
						//清空表单
						$('#iomTacheLimit-applyRule-service').val('');
						$('#iomTacheLimit-applyRule-orderPriority').combobox('value', '');
						$('#iomTacheLimit-applyRule-custType').combobox('value', '');
						$('#iomTacheLimit-applyRule-otherConds').val('');
						
						me.selectedService = [];
						
						$('#iomTacheLimit-applyRule-selectService').show();
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
		
		queryTacheLimitApplyRule: function() {
			var paramsMap = {};
			paramsMap.tacheLimitId = this.options.tacheLimitId;
			$("#iomTacheLimit-applyRule-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb', 'queryTacheLimitApplyRule', paramsMap).done(function(ret){
				$("#iomTacheLimit-applyRule-grid").grid("reloadData", {rows: ret});
				$("#iomTacheLimit-applyRule-grid").unblockUI().data('blockui-content', false);
			}).fail(function(ret){
    			fish.error({title:'错误',message:'环节时限适用规则查询异常'});
    			$("#iomTacheLimit-applyRule-grid").unblockUI().data('blockui-content', false);
    		});
		},
		
		qryAllOrderPrioritiesAndCustTypes: function() {
			utils.ajax('cloudIomServiceForWeb', 'qryAllOrderPrioritiesAndCustTypes').done(function(ret){
				var orderPriorities = ret.orderPriorities;
				$('#iomTacheLimit-applyRule-orderPriority').combobox({dataSource: orderPriorities});
				
				var custTypes = ret.custTypes;
				$('#iomTacheLimit-applyRule-custType').combobox({dataSource: custTypes});
			});
		},
		
		selectService: function() {
			var me = this;
			fish.popupView({
				url: 'modules/iom/timelimit/views/selectServiceView',
				width: "30%",
				viewOption: {
					selectedService: me.selectedService
				},
				callback:function(popup,view){
					popup.result.then(function(selectedService) {
						me.selectedService = selectedService;
						var serviceStr = '';
						for (i in selectedService) {
							serviceStr = serviceStr + selectedService[i].name + ', ';
						}
						serviceStr = serviceStr.substr(0,serviceStr.length-2);
						$('#iomTacheLimit-applyRule-service').val(serviceStr);
					});
				}
			});
		},
		
		addApplyRule: function() {
			var me=this;
			var isValid = $("#iomTacheLimit-applyRule-form").isValid();
			if(false==isValid){
				return;
			}
			
			var serviceIdStr = '';
			var orderPriority = $('#iomTacheLimit-applyRule-orderPriority').combobox('value');
			var custType = $('#iomTacheLimit-applyRule-custType').combobox('value');
			var existingRows = $("#iomTacheLimit-applyRule-grid").grid('getGridParam','data');
			for (i in me.selectedService) {
				var serviceId = me.selectedService[i].id;
				//筛选重复记录
				var duplicate = _.filter(existingRows, function(row) {
					return row.serviceId==serviceId && row.orderPriority==orderPriority && row.custType==custType;
				});
				if (duplicate.length > 0) {
					fish.error({
						title:'错误', 
						message:'环节时限适用规则已存在'
									+'，服务：'+me.selectedService[i].name
									+'，定单处理等级：'+$('#iomTacheLimit-applyRule-orderPriority').combobox('text')
									+'，客户类型：'+$('#iomTacheLimit-applyRule-custType').combobox('text')
					});
					return;
				}
				serviceIdStr = serviceIdStr + serviceId + ',';
			}
			serviceIdStr = serviceIdStr.substr(0,serviceIdStr.length-1);
			
			var paramsMap = {
				serviceId: serviceIdStr,
				tacheLimitId: me.options.tacheLimitId,
				orderPriority: orderPriority,
				custType: custType
			};
			$("#iomTacheLimit-applyRule-tabs-a").blockUI({message: '添加中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb', 'addTacheLimitApplyRule', paramsMap).done(function(ret){
				fish.info({title:'提示',message:'增加环节时限适用规则成功'});
			}).fail(function(ret){
				fish.error({title:'错误',message:'增加环节时限适用规则异常'});
			}).always(function(ret){
				$("#iomTacheLimit-applyRule-tabs-a").unblockUI().data('blockui-content', false);
				me.queryTacheLimitApplyRule();
			});
		},
		
		delApplyRule: function() {
			var me = this;
			var selections = this.$("#iomTacheLimit-applyRule-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length > 0){
				var idList = [];
				$.each(selections, function(i, n) {
					idList.push(n.id);
				});
				
				fish.confirm('是否确定要删除环节时限适用规则？').result.done(function() {
					$("#iomTacheLimit-applyRule-tabs-a").blockUI({message: '删除中'}).data('blockui-content', true);
					utils.ajax('cloudIomServiceForWeb', 'deleteTacheLimitApplyRule', idList).done(function(ret){
						fish.info({title:'提示',message:'删除环节时限适用规则成功'});
					}).fail(function(ret){
		    			fish.error({title:'错误',message:'删除环节时限适用规则异常'});
		    		}).always(function(ret){
		    			$("#iomTacheLimit-applyRule-tabs-a").unblockUI().data('blockui-content', false);
						me.queryTacheLimitApplyRule();
						$("#iomTacheLimit-applyRule-grid").grid("resetSelection");
					});
		        });
			} else {
				fish.info({title:'提示',message:'请勾选需要删除的环节时限适用规则'});
			}
		},
		
		saveApplyRule: function() {
			var me=this;
			var isValid = $("#iomTacheLimit-applyRule-form").isValid();
			if(false==isValid){
				return;
			}
			var tacheLimitApplyRuleId = $("#iomTacheLimit-applyRule-grid").grid("getCheckRows")[0].id;
			var serviceId = $("#iomTacheLimit-applyRule-grid").grid("getCheckRows")[0].serviceId;
			var orderPriority = $('#iomTacheLimit-applyRule-orderPriority').combobox('value');
			var custType = $('#iomTacheLimit-applyRule-custType').combobox('value');
			var existingRows = $("#iomTacheLimit-applyRule-grid").grid('getGridParam','data');
			//筛选重复记录
			var duplicate = _.filter(existingRows, function(row) {
				return row.serviceId==serviceId && row.orderPriority==orderPriority && row.custType==custType;
			});
			if (duplicate.length > 0) {
				fish.error({
					title:'错误', 
					message:'环节时限适用规则已存在'
								+'，服务：'+$("#iomTacheLimit-applyRule-grid").grid("getCheckRows")[0].serviceName
								+'，定单处理等级：'+$('#iomTacheLimit-applyRule-orderPriority').combobox('text')
								+'，客户类型：'+$('#iomTacheLimit-applyRule-custType').combobox('text')
				});
				return;
			}
			
			var paramsMap = {
				id: tacheLimitApplyRuleId,
				orderPriority: $('#iomTacheLimit-applyRule-orderPriority').combobox('value'),
				custType: $('#iomTacheLimit-applyRule-custType').combobox('value')
			};
			$("#iomTacheLimit-applyRule-tabs-a").blockUI({message: '保存中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb', 'updateTacheLimitApplyRule', paramsMap).done(function(ret){
				fish.info({title:'提示',message:'修改环节时限适用规则成功'});
			}).fail(function(ret){
				fish.error({title:'错误',message:'修改环节时限适用规则异常'});
			}).always(function(ret){
				$("#iomTacheLimit-applyRule-tabs-a").unblockUI().data('blockui-content', false);
				me.queryTacheLimitApplyRule();
				$("#iomTacheLimit-applyRule-grid").grid("resetSelection");
			});
		},
		
		resize: function() {
			$("#iomTacheLimit-applyRule-grid").grid('resize');
		}
	});
});