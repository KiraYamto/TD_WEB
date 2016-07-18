define([ 'text!modules/nms/alarm/templates/alarmConfirm.html',
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
			console.log("initialize");
		},

		events : {
			"click #alarmConfirmBtn": "confirmAlarm"
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

			this.loadAlarmData();
			console.log("_afterRender");
		},

		loadAlarmData : function() {
			utils.ajax('alarmService', 'queryAlarmInfoById',this.options.alarmInstanceId).done($.proxy(function(data) {
				this.$el.find("#alarmInfoForm").form("value", data);
				data.firstAlarmTime = data.firstAlarmTimeStr;
				
				this.$el.find("#alarmInfoForm").form("value", data);
			}, this));
		},
		
		/**
		 * 确认告警
		 */
		confirmAlarm:function(){
			this.$el.blockUI({message: '告警确认中...'}).data('blockui-content', true);
			//currentUser
			utils.ajax('alarmService', 'confirmAlarm',this.options.alarmInstanceId, currentUser.staffId).done($.proxy(function(data) {
				this.$el.unblockUI().data('blockui-content', false);
				if(data && data == 1){
					fish.info({title:'系统提醒', message:'告警确认完成！'}, $.proxy(function(){
						this.popup.dismiss({action:'loadData'});
					},this));
				} else if(data && data == 2){
					fish.info("操作异常，告警对象不存在！", function(){
						currentObj.popup.close();
					});
				}  else if(data && data == 3){
					fish.info("告警已经确认，无需重复操作！", function(){
						currentObj.popup.close();
					});
				}else if(data && data == -1){
					fish.info("告警确认失败,服务器异常！", function(){
						currentObj.popup.close();
					});
				}else{
					fish.info("告警确认失败，未知异常！", function(){
						currentObj.popup.close();
					});
				}
			}, this));
		}
	});
});