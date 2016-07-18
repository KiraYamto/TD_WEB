define([ 'text!modules/nms/alarm/templates/alarmSendOrderView.html',
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
			this.levelFieldId = "nms_alarm_operation_sendOrder_alarmLevelId";
			this.faultErmgLevelFieldId = "nms_alarm_operation_sendOrder_faultErmgLevelId";
			this.faultGradeFieldId = "nms_alarm_operation_sendOrder_faultGradeId";
			console.log("initialize");
		},

		events : {
			"click #nms_alarm_operation_sendOrder_conform_btn": "sendAlarmOrder"
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
			this.initCombobox();
			this.loadAlarmData();
			console.log("_afterRender");
		},
		
		initCombobox:function(){
			this.$("#" + this.levelFieldId).combobox({
		        dataTextField: 'name',
		        dataValueField: 'id',
		        editable:false
		    }).combobox('disable');
			this.$("#" + this.faultErmgLevelFieldId).combobox({
				 dataTextField: 'name',
			     dataValueField: 'id',
			     editable:false,
			     dataSource:[{id:1, name:'非常紧急'},{id:2, name:'紧急'},{id:3, name:'一般'}]
			});
			this.$("#" + this.faultGradeFieldId).combobox({
				 dataTextField: 'name',
			     dataValueField: 'id',
			     editable:false,
			     dataSource:[{id:100, name:'一级故障'},{id:101, name:'二级故障'},{id:102, name:'三级故障(严重故障)'},{id:103, name:'四级故障(一般故障)'},{id:104, name:'客户投诉'}]
			});
			
			//初始化告警级别
			utils.ajax('alarmService','queryAlarmLevel').done($.proxy(function(data){
				this.$el.find("#" + this.levelFieldId).combobox('option', 'dataSource', data);
		    }, this));
		},

		loadAlarmData : function() {
			utils.ajax('alarmService', 'queryAlarmInfoById',this.options.alarmInstanceId).done($.proxy(function(data) {
				data.firstAlarmTime = data.firstAlarmTimeStr;
				this.$el.find("#nms_alarm_operation_sendOrder_view").form("value", data);
				this.$("#" + this.levelFieldId).combobox('value', data.alarmLevelId)
				
			}, this));
		},
		
		/**
		 * 派单
		 */
		sendAlarmOrder:function(){
			if(this.options.dealWithStatusId && this.options.dealWithStatusId == 2){
				fish.info({title:'系统提醒', message:'告警已经派单,无需重复派单！'});
				return;
			}
			var result = this.$("#nms_alarm_operation_sendOrderForm").isValid();
			if(!result){
				return;
			}
			this.$el.blockUI({message: '告警正在派单...'}).data('blockui-content', true);
			var faultErmgLevelId = this.$("#" + this.faultErmgLevelFieldId).combobox("value");
			var faultErmgLevelText = this.$("#" + this.faultErmgLevelFieldId).combobox("text");
			
			var faultGradeId = this.$("#" + this.faultGradeFieldId).combobox("value");
			var faultGradeText = this.$("#" + this.faultGradeFieldId).combobox("text");
			
			utils.ajax('alarmService', 'sendAlarmOrder', {}, [this.options.alarmInstanceId], 
					{faultGradeId:parseInt(faultGradeId), faultGradeValue:faultGradeText,
					faultErmgLevelId:parseInt(faultErmgLevelId), faultErmgLevelValue:faultErmgLevelText},
					currentUser.staffId).done($.proxy(function(data) {		
				this.$el.unblockUI().data('blockui-content', false);
				if(data && data == 1){
					fish.info({title:'系统提醒', message:'派单成功！'}, $.proxy(function(){
						this.popup.dismiss({action:'loadData'});
					},this));
				}else if(data && data == -1){
					fish.info("操作失败,服务器出现异常！");
				}else if(data && data == 2){
					fish.info("操作失败,告警对象不存在！");
				}else if(data && data == 3){
					fish.info("告警已经派单，无需重复派单！");
				}else{
					fish.info("操作失败,位置异常！");
				}
			}, this));
		}
	});
});