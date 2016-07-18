define([ 'text!modules/common/portal/widgets/calendar/templates/CalendarWidgetView.html',
		'i18n!modules/common/portal/widgets/calendar/i18n/Calendar.i18n',
		'modules/common/cloud-utils' ], 
		function(viewTpl, i18n,utils) {

	return fish.View.extend({
		template : fish.compile(viewTpl),
		i18nData : fish.extend({}, i18n),
		events : {
			
		},
		initialize : function() {
			
		},
		// 这里用来进行dom操作
		_render : function() {
			this.$el.html(this.template(this.i18nData));
			this.$el.css({"width":"100%","height":"100%"});
			
			return this;
		},
		_afterRender:function(){
			var me=this;
			this.$('#com-portal-calendar').fullCalendar({
				lang:'zh',
			      header: {
			          left: 'prev,next today',
			          center: 'title',
			          right: 'month,agendaWeek,agendaDay'
			        },
			        
			        monthNames: ["一月 工作项", "二月 工作项", "三月 工作项", "四月 工作项", "五月 工作项", "六月 工作项", "七月 工作项", "八月 工作项", "九月 工作项", "十月 工作项", "十一月 工作项", "十二月 工作项"],
			        monthNamesShort: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
			        dayNames: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
			        dayNamesShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
			        today: ["今天"],
			        firstDay: 1,
			        buttonText: {
			        today: '本月',
			        month: '月',
			        week: '周',
			        day: '日',
			        },
			        
			        height:this.$el.height(),
			        width:this.$el.width(),
			        editable: true,
			        selectable: true,
			        timezone:'local',
			        //selectHelper: true, //在agenda的视图中,选中单元格会显示时间
			        allDayText: "全天事件",//默认"all-day"
			        //scrollTime: '08:00:00', //默认滚动到上午8点
			        slotDuration: '00:30:00', //两个时间之间的间隔
			        //slotEventOverlap: true,//是否允许事件重叠
			        viewDisplay: function (view) {//动态把数据查出，按照月份动态查询
	                  var viewStart = $.fullCalendar.formatDate(view.start, "yyyy-MM-dd HH:mm:ss");
	                  var viewEnd = $.fullCalendar.formatDate(view.end, "yyyy-MM-dd HH:mm:ss");
	                  me.$('#com-portal-calendar').fullCalendar('removeEvents');
	                  //$.post("http://www.cnblogs.com/sr/AccessDate.ashx", { start: viewStart, end: viewEnd }, function (data) {
	 
			        },
			        select: function (start, end, jsEvent, view) {//可以用dayClick日期点击后弹出的jq ui的框，添加日程记录
			        	// var selectdate = fish.dateutil.format(start.toDate(), "yyyy年mm月dd日");
			        	 
			        	fish.popupView({url: 'modules/common/portal/widgets/calendar/views/CalendarInfoView',
							width: "60%",
							viewOption:{
								selectdate:start.toDate(),
								adding:true,
								startTime:start.toDate(),
								endTime:end.toDate()
							},
							callback:function(popup,view){
								
								popup.result.then(function (e) {
									me.$('#com-portal-calendar').fullCalendar('renderEvent', e, true); // stick? = true
									console.log(e);
								},function (e) {
									console.log('关闭了',e);
								});
							}
						});
			        },
			        
			        eventClick: function(event) { 　//点击事项的方法 //弹出层修改?可删除//选中项丢失
			        	
			        	fish.popupView({url: 'modules/common/portal/widgets/calendar/views/CalendarInfoView',
							width: "60%",
							viewOption:{
								selectdate: fish.dateutil.parse(event.start._i,'yyyy-mm-dd HH:ii:ss'),
								event:event
								
							},
							callback:function(popup,view){
								
								popup.result.then(function (e) {
									
									
									if(e=="deleted"){
										me.$('#com-portal-calendar').fullCalendar('removeEvents', event._id);
									}
									else{
										me.$('#com-portal-calendar').fullCalendar('removeEvents', event._id);
										me.$('#com-portal-calendar').fullCalendar('renderEvent', e);
									}
									
								},function (e) {
									console.log('关闭了',e);
								});
							}
						});
			          /*var title = fish.prompt('工作项:',event.title);
			          var eventData;
			          if (title) {
			            event.title = title;
			            $('#com-portal-calendar').fullCalendar('updateEvent', event); // stick? = true
			          }else{
			            $('#com-portal-calendar').fullCalendar('removeEvents', event._id); // stick? = true
			          }*/
			            //TODO      添加点击某事项时需要进行操作的方法，比如：修改会议、备注等事项
			        },
/*			        eventResize: function(event, delta, revertFunc) {
			        	
			        	revertFunc();

			        },*/
			        events: [
			         /* {
			            title: 'All Day Event',
			            start: '2014-09-01'
			          },
			          {
			            title: 'Long Event',
			            start: '2014-09-07',
			            end: '2014-09-10'
			          },
			          {
			            id: 999,
			            title: 'Repeating Event',
			            start: '2014-09-01 12:00:00',
			            end: '2014-09-01 16:00:00',
			          }*/
			        ]
			      });
			
		},
		resize:function(){
			this.$('#com-portal-calendar').fullCalendar('option', 'height', this.$el.height());
		   
		}
	});
});