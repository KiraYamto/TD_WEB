define([
	'text!modules/iom/product/templates/serviceApplyRuleAddView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/productManage.css'+codeVerP
], function(serviceApplyRuleAddViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(serviceApplyRuleAddViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		serviceData : null,
		events: {
			'click #iom-serviceApplyRule-save-button':'addPackageApplyRule',
			'click #iom-serviceApplyRule-cancel-button':'addPackageApplyRule2'
			
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData)); 
			return this;
		},
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.serviceData = this.options.serviceData; 
			$('#iom-service-ruleName-add').val(this.serviceData.NAME);
		}, 
		addPackageApplyRule : function(){	
			var me=this;
			var result = $("#iom-serviceApplyRule-add-form").isValid();
			if(false==result){
				return;
			}
	        //获取表单信息
			var formValue = $('#iom-serviceApplyRule-add-form').form("value");
			var map = new Object();
			map.PACKAGE_APPLY_RULE_NAME = formValue["iom-service-ruleName-add"]+"";
			map.PACKAGEID = formValue["iom-service-ruleCode-add"]+"";
			map.AREA_ID = "-1";
			map.SERVICE_ID = me.serviceData.ID+"";
			map.PACKAGEID = "cloud_iom";
			map.FLOW_TYPE = "FP";
			map.PRODUCT_ID = me.serviceData.PRO_ID+"";
			utils.ajax('cloudIomServiceForWeb','addPackageApplyRule',map).done(function(ret){
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
				me.serviceData = data;
			}).fail(function(e){
				console.log(e);
				fish.error(e);
			});
	        
		}
		 
		
		
	});
});