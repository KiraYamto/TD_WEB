define([
	'text!modules/common/sysmonitor/templates/specialAlarmStatisView.html',
	'i18n!modules/common/sysmonitor/i18n/SysMonitor.i18n',
	'modules/common/cloud-utils'
], function(viewTpl, i18n,utils) {
	var currentObj;
	
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		
		initialize:function(){
			currentObj = this;
		},
		
		events: {
		},
		
		_beforeRender:function(){
		},
		
		beforeRender:function(){
		},
		
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			this.$el.css({
				"height":"100%",
				"width":"100%"
			});
			return this;
		},
		
		_afterRender: function() {
			var h = this.$(".sysmonitorwidget-alarmmonitor-main").height()-30-this.$(".sysmonitorwidget-alarmmonitor-error-body").outerHeight();
			this.$(".sysmonitorwidget-alarmmonitor-bussinessiom-body").height(h+"px");
			this.$(".sysmonitorwidget-alarmmonitor-netdev-con").css("top",(this.$(".sysmonitorwidget-alarmmonitor-netdev").width()/2-25)+"px");  			
			this.$(".sysmonitorwidget-alarmmonitor-host-con").css("top",(this.$(".sysmonitorwidget-alarmmonitor-host").width()/2-25)+"px");			
			this.$(".sysmonitorwidget-alarmmonitor-netmonitor-con").css("top",(this.$(".sysmonitorwidget-alarmmonitor-netmonitor").width()/2-25)+"px");
		},
		
		resize:function(){
			var h = this.$(".sysmonitorwidget-alarmmonitor-main").height()-30-this.$(".sysmonitorwidget-alarmmonitor-error-body").outerHeight();
			this.$(".sysmonitorwidget-alarmmonitor-bussinessiom-body").height(h+"px");			
			this.$(".sysmonitorwidget-alarmmonitor-netdev-con").css("top",(this.$(".sysmonitorwidget-alarmmonitor-netdev").width()/2-25)+"px");  			
			this.$(".sysmonitorwidget-alarmmonitor-host-con").css("top",(this.$(".sysmonitorwidget-alarmmonitor-host").width()/2-25)+"px");
			this.$(".sysmonitorwidget-alarmmonitor-netmonitor-con").css("top",(this.$(".sysmonitorwidget-alarmmonitor-netmonitor").width()/2-25)+"px");
		}
	});
});