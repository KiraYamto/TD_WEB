define([ 'text!modules/nms/alarm/templates/alarmRedefineView.html',
		'i18n!modules/nms/alarm/i18n/alarm.i18n', 'modules/common/cloud-utils',
		'css!modules/nms/alarm/styles/alarmOperationList.css' ], function(
		viewTpl, i18n, utils, css) {
	var currentObj;
	var rowNum = 20;

	return fish.View.extend({
		template : fish.compile(viewTpl),
		i18nData : fish.extend({}, i18n),

		initialize : function() {
			currentObj = this;
			this.levelFieldId = "nms_alarm_operation_redefine_alarmLevelId";
			console.log("initialize");
		},

		events : {
			"click #nms_alarm_operation_redefine_conform_btn": "redefineAlarmLevel"
		},

		_beforeRender : function() {
			console.log("_beforeRender");
		},

		beforeRender : function() {
			console.log("beforeRender");
		},

		_render : function() {
			console.log("_render");
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		// 这里用来初始化页面上要用到的fish组件
		_afterRender : function() {

			// alert(this.options.alarmInstanceId);
			this.initLevelCombobox();
			this.loadAlarmData();
			console.log("_afterRender");
		},
		
		initLevelCombobox:function(){
			this.$el.find("#" + this.levelFieldId).combobox({
		        dataTextField: 'name',
		        dataValueField: 'id',
		        editable:true
		    });
			
			//初始化告警级别
			utils.ajax('alarmService','queryAlarmLevel').done($.proxy(function(data){
				this.$el.find("#" + this.levelFieldId).combobox('option', 'dataSource', data);
		    }, this));
		},

		loadAlarmData : function() {
			utils.ajax('alarmService', 'queryAlarmInfoById',this.options.alarmInstanceId).done($.proxy(function(data) {
				data.firstAlarmTime = data.firstAlarmTimeStr;
				this.$el.find("#nms_alarm_operation_redefineForm").form("value", data);
				this.$("#" + this.levelFieldId).combobox('value', data.alarmLevelId)
				
			}, this));
		},
		
		/**
		 * 重定义告警
		 */
		redefineAlarmLevel:function(){
			this.$el.blockUI({message: '告警重定义...'}).data('blockui-content', true);
			
			var alarmLevelId = this.$("#" + this.levelFieldId).combobox("value");
			//currentUser
			utils.ajax('alarmService', 'redefineAlarmLevel',this.options.alarmInstanceId,  alarmLevelId, currentUser.staffId).done($.proxy(function(data) {
				this.$el.unblockUI().data('blockui-content', false);
				if(data && data == 1){
					fish.info({title:'系统提醒', message:'告警重定义完成！'}, $.proxy(function(){
						this.popup.dismiss({action:'loadData'});
					},this));
				}else if(data && data == -1){
					fish.info("操作失败,服务器出现异常！");
				}else if(data && data == 2){
					fish.info("操作失败,告警对象不存在！");
				}else if(data && data == 3){
					fish.info("告警级别没变化,不需要修改！");
				}
			}, this));
			
		}
	});
});