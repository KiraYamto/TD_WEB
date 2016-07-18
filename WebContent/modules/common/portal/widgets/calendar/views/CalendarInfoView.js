define([
	'text!modules/common/portal/widgets/calendar/templates/CalendarInfoView.html',
	'i18n!modules/common/portal/widgets/calendar/i18n/Calendar.i18n',
	'modules/common/cloud-utils'
], function(viewTpl, i18n,utils) {
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		events: {
			"click #com-portal-calendarinfo-save":"saveCalendar",
			"click #com-portal-calendarinfo-delete":"deleteCalendar"
		},
		_render: function() {
			
			this.$el.html(this.template(this.i18nData));
			
			this.$("#com-portal-calendarinfo-starttime").datetimepicker({
		        viewType: "time"
		    });
			
			this.$("#com-portal-calendarinfo-endtime").datetimepicker({
		        viewType: "time"
		    });
			
			this.$('#com-portal-calendarinfo-form').form({
		        validate: 1
		    });
			if(this.options.selectdate){
				var dateTitle = fish.dateutil.format(this.options.selectdate, "yyyy年mm月dd日");
				this.$(".modal-title").text("添加"+dateTitle+"工作项");
			}
			if(this.options.adding){
				//fish.dateutil.format(this.options.selectdate,'HH:ii:ss')
				this.$("#com-portal-calendarinfo-starttime").val( fish.dateutil.format(this.options.startTime,'HH:ii:ss'));
				this.$("#com-portal-calendarinfo-endtime").val( fish.dateutil.format(this.options.endTime,'HH:ii:ss'));
				
				
				this.$('#com-portal-calendarinfo-delete').remove();
			}else{
				this.$('#com-portal-calendarinfo-form').form('value',this.options.event);
			}
			
			return this;
		},
		_afterRender: function() {
			
			
		},saveCalendar: function() {
			if(this.$('#com-portal-calendarinfo-form').isValid()){
				var popup=this.popup;
				
				//if(this.options.adding){
					var val = this.$('#com-portal-calendarinfo-form').form('value')
					val.start=fish.dateutil.format(this.options.selectdate, "yyyy-mm-dd ")+val.startTime;
					val.end=fish.dateutil.format(this.options.selectdate, "yyyy-mm-dd ")+val.endTime;
					
					
					
					popup.close(val);	
				//}
					
			}
			
			
		},deleteCalendar: function() {
			var popup=this.popup;
			
			 fish.confirm('确认是否删除该工作项项').result.then(function() {
		            fish.success('删除成功');
		            popup.close('deleted');
		        });
		}
		
	
	});
});