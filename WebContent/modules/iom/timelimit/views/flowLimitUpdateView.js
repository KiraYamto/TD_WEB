define([
	'text!modules/iom/timelimit/templates/flowLimitUpdateView.html'+codeVerP,
	'i18n!modules/iom/timelimit/i18n/timeLimit.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/timelimit/styles/timeLimit.css'+codeVerP
], function(flowLimitUpdateViewTpl, i18nTimeLimit, utils, css) {
	return fish.View.extend({
		template: fish.compile(flowLimitUpdateViewTpl),
		i18nData: fish.extend({}, i18nTimeLimit),
		events: {
			'click #iomFlowLimit-save-button':'flowLimitUpdate'
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			$('#iomFlowLimit-timeUnit').combobox();
			$('#iomFlowLimit-isWorkingDays').combobox();
			
			$('#iomFlowLimit-serviceName').val(this.options.serviceName);
			$('#iomFlowLimit-finishLimit').val(this.options.finishLimit);
			$('#iomFlowLimit-alertLimit').val(this.options.alertLimit);
			$('#iomFlowLimit-timeUnit').combobox('value', this.options.timeUnit);
			$('#iomFlowLimit-isWorkingDays').combobox('value', this.options.isWorkingDays);
		}, 

		/* 修改 */
		flowLimitUpdate : function(){	
			var me=this;
			var isValid = $("#iomFlowLimit-form").isValid();
			if(false==isValid){
				return;
			}

	        //获取表单信息
			var formValue = $('#iomFlowLimit-form').form("value");
			var map = {};
			map.id = me.options.flowLimitId+"";
			map.finishLimit = formValue["iomFlowLimit-finishLimit"]+"";
			map.alertLimit = formValue["iomFlowLimit-alertLimit"]+"";
			map.timeUnit = formValue["iomFlowLimit-timeUnit"];
			map.isWorkingDays = formValue["iomFlowLimit-isWorkingDays"];
			
			utils.ajax('cloudIomServiceForWeb','updateFlowLimit', map).done(function(ret){
				fish.info({title:'提示',message:'修改流程时限成功'});
				me.popup.close(ret);
			}).fail(function(e){
				fish.error({title:'错误',message:'修改流程时限失败'});
			});  
		}
		
	});
});