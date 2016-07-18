define([
	'text!modules/nms/monitorHomePage/templates/alarmCountStatis.html',
	'i18n!modules/nms/monitorHomePage/i18n/monitor.i18n',
	'modules/common/cloud-utils'
], function(viewTpl, i18n, utils) {
	var currentObj;
	
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		
		initialize:function(){
			currentObj = this;
			console.log("initialize");
		},
		
		events: {
		},
		
		_render: function() {
			this.$el.html(this.template(this.i18nData));			
			return this;
		},
		
		_afterRender: function() {
			
		},
		
		/**
		 * 更新告警数量
		 */
		setAlarmCouont:function(pAlarmCount){
			if(pAlarmCount && !isNaN(pAlarmCount)){
				this.$el.find(".alarmCount").text(pAlarmCount);
			}
		}
		
	});
});