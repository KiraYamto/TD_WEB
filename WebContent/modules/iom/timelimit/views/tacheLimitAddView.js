define([
	'text!modules/iom/timelimit/templates/tacheLimitAddView.html'+codeVerP,
	'i18n!modules/iom/timelimit/i18n/timeLimit.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/timelimit/styles/timeLimit.css'+codeVerP
], function(tacheLimitAddViewTpl, i18nTimeLimit, utils, css) {
	return fish.View.extend({
		template: fish.compile(tacheLimitAddViewTpl),
		i18nData: fish.extend({}, i18nTimeLimit),
		tacheId: undefined,
		events: {
			'click #iomTacheLimit-save-button':'tacheLimitAdd'
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.tacheId = this.options.tacheId; 
			$('#iomTacheLimit-tacheName').val(this.options.tacheName);
			$('#iomTacheLimit-timeUnit').combobox();
			$('#iomTacheLimit-isWorkingDays').combobox();
		}, 

		/* 新增 */
		tacheLimitAdd : function(){	
			var me=this;
			var isValid = $("#iomTacheLimit-form").isValid();
			if(false==isValid){
				return;
			}

	        //获取表单信息
			var formValue = $('#iomTacheLimit-form').form("value");
			var map = {};
			map.tacheId = me.tacheId+"";
			map.finishLimit = formValue["iomTacheLimit-finishLimit"]+"";
			map.alertLimit = formValue["iomTacheLimit-alertLimit"]+"";
			map.timeUnit = formValue["iomTacheLimit-timeUnit"];
			map.isWorkingDays = formValue["iomTacheLimit-isWorkingDays"];
			
			utils.ajax('cloudIomServiceForWeb','addTacheLimit', map).done(function(ret){
				fish.info({title:'提示',message:'新增环节时限成功'});
				me.popup.close(ret);
			}).fail(function(e){
				fish.error({title:'错误',message:'新增环节时限失败'});
			});  
		}
		
	});
});