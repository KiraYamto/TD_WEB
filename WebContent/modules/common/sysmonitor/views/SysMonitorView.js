define([ 'text!modules/common/sysmonitor/templates/SysMonitorView.html',
		'i18n!modules/common/sysmonitor/i18n/SysMonitor.i18n',
		'modules/common/cloud-utils',
		"css!modules/common/sysmonitor/styles/sysmonitor.css"], 
		function(viewTpl, i18n,utils) {

	return fish.View.extend({
		template : fish.compile(viewTpl),
		i18nData : fish.extend({}, i18n),
		events : {
			
		},
		initialize : function() {
			
		},
		tabActived:function(){
			MainView.maximization();
			
			MainView.lightoff();
		},
		tabHid:function(){
			MainView.minimize();
			
			MainView.lighton();
		},
		// 这里用来进行dom操作
		_render : function() {
			this.$el.html(this.template(this.i18nData));
			this.$el.css({
				"height":"100%",
				"width":"100%"
			});
			MainView.maximization();
			
			MainView.lightoff();
			return this;
		},
		_afterRender:function(){
			
			var width = window.screen.width;
			
			var w =this.$el.width()+8;
            var w1=(w/12);
            
            var h=this.$el.height();
            var min_rows=20;
            var h1=(h/min_rows)-10;
            
            /*if(h1<20){
            	h1=20;
            	min_rows=h/(20+30);
            }*/
            
            
			this.gridster = this.$(".gridster > ul").gridster({
				namespace:".portal",
                widget_margins: [5, 5],
                widget_base_dimensions: [w1, h1],
                min_rows:min_rows,
                min_cols:12
            }).data('gridster');
			//window.screen.availWidth-$(".content-wrapper").css("margin-left").replace("px","")-20
			this.loadWidgets();
			
		},
		loadWidgets:function(){
			var me = this, loadWidgetModule = $.proxy(this.loadWidgetModule,this);
			this.widgets=[
			              	{widgetId:5,moduleName:"iomisamonitor",moduleUrl:"modules/common/sysmonitor/widgets/iomisamonitor/views/IomIsaMonitorView",isIframe:"N",frameUrl:"",sizeX:3, sizeY:13},
						{widgetId:2,moduleName:"m1",moduleUrl:"modules/common/sysmonitor/views/sysAlarmMap",isIframe:"N",frameUrl:"",sizeX:6, sizeY:13},
						{widgetId:3,moduleName:"m2",moduleUrl:"modules/common/sysmonitor/views/alarmStatisWrap",isIframe:"N",frameUrl:"",sizeX:3, sizeY:13},
						{widgetId:4,moduleName:"devinspection",moduleUrl:"modules/common/sysmonitor/widgets/devinspection/views/DevInspectionView",isIframe:"N",frameUrl:"",sizeX:3, sizeY:7},
						{widgetId:1,moduleName:"resourcecapacity",moduleUrl:"modules/common/sysmonitor/widgets/rmmonitor/views/ResourceCapacityView",isIframe:"N",frameUrl:"",sizeX:6, sizeY:7},
			              
			              {widgetId:6,moduleName:"m5",moduleUrl:"modules/nms/monitorHomePage/views/resourcePoolStatistics",isIframe:"N",frameUrl:"",sizeX:3, sizeY:7}
			              ];
			
			$.each(this.widgets,function(i,w){
				
				if(w.isIframe=="Y"){
					var widget = me.gridster.add_widget('<li id="sysmonitor-widget-'+w.moduleName+'" style=""></li>',w.sizeX,w.sizeY);
				}
				else{
					var widget = me.gridster.add_widget('<li id="sysmonitor-widget-'+w.moduleName+'" style=""></li>',w.sizeX,w.sizeY);
					loadWidgetModule('#sysmonitor-widget-'+w.moduleName+'',w.moduleUrl,widget);
				}
				
			});
			setTimeout($.proxy(this.resize(),this),300);
		},
		loadWidgetModule:function(viewId,moduleUrl,widget){
			this.requireView({
				selector : viewId,
				url : moduleUrl,
				viewOption : {
					widget : widget
				}
			})
		},
		
		resize:function(){
			if(this.gridster){
				var w =this.$el.width()+8;
				var w1=(w/12)-10;
				var h=this.$el.height();
				var min_rows=20;
		        var h1=(h/min_rows)-10;
		        this.gridster.options=$.extend(this.gridster.options,{
					namespace:".portal",
	                widget_margins: [5, 5],
	                widget_base_dimensions: [w1, h1],
	                min_rows:min_rows,
	                min_cols:12
	            });
		        //this.gridster.generate_grid_and_stylesheet();
		        //$(window).trigger('resize.gridster');
		        
		        this.gridster.options.resize.enabled && this.setup_resize();
		        this.gridster.generate_grid_and_stylesheet();
		        this.gridster.get_widgets_from_DOM();
		        this.gridster.set_dom_grid_height(this.$el.height()+"px");
		        this.gridster.set_dom_grid_width();
		        this.gridster.$wrapper.addClass('ready');
		        //this.draggable();
		        this.gridster.options.resize.enabled && this.resizable();
			}
		}
	});
});