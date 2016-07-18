define([
	'text!modules/iom/product/templates/serviceApplyRuleUpdateView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/productManage.css'+codeVerP
], function(serviceApplyRuleUpdateViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(serviceApplyRuleUpdateViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		serviceData : null,
		events: {
			'click #iom-serviceApplyRule-update-save-button':'updatePackageApplyRule',
			'click #iom-serviceApplyRule-cancel-button':'updatePackageApplyRule2'
			
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData)); 
			return this;
		},
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.serviceData = this.options.data; 
			$('#iom-service-update-ruleName-add').val(this.serviceData.PACKAGE_APPLY_RULE_NAME);
		}, 
		updatePackageApplyRule : function(){	
			var me=this;
			var result = $("#iom-serviceApplyRule-add-form").isValid();
			if(false==result){
				return;
			}
	        //获取表单信息
			var formValue = $('#iom-serviceApplyRule-update-form').form("value");
			var map = new Object();
			map.ID = me.serviceData.ID
			map.PACKAGE_APPLY_RULE_NAME = formValue["iom-service-update-ruleName-add"]+"";
			map.PACKAGEID = formValue["iom-service-update-ruleCode-add"]+"";
			utils.ajax('cloudIomServiceForWeb','updatePackageApplyRule',map).done(function(ret){
				var data = JSON.parse(ret);
				var opreateResoult = data.opreateResoult;
				var opreateResoultMsg = data.opreateResoultMsg;
				if(false == opreateResoult){ 
					fish.info({title:'提示',message:opreateResoultMsg.errorMessage+","+opreateResoultMsg.errorResolve});
					return;
				}else{
					fish.info({title:'提示',message:opreateResoultMsg});
					me.popup.close(ret);
				}
			}).fail(function(e){
				console.log(e);
				fish.error(e);
			});
	        
		}
		 
		
		
	});
});