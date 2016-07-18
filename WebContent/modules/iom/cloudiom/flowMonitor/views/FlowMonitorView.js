define([
        'text!modules/iom/cloudiom/flowMonitor/templates/FlowMonitorView.html',
        'modules/common/cloud-utils'
        ], function(FlowMonitorViewTpl,utils) {
	return fish.View.extend({
		template: fish.compile(FlowMonitorViewTpl,utils),
		events: {

		},

		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template);
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			var url = './modules/iom/cloudiom/flowMonitor/shadowFlow.html?processInstanceId='+this.options.processInstanceId;
			var iframe = $('<iframe src="'+url+'" id="flowMonitor-frame" width="100%" height="100%" frameborder="0" scrolling="hidden"></iframe>');
			$('#flowMonitor-frameDiv').append(iframe);
		}
	});
});