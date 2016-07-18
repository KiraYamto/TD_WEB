define([ 'text!modules/common/portal/templates/PortalView.html',
		'i18n!modules/common/portal/i18n/Portal.i18n',
		'modules/common/cloud-utils',
		"css!modules/common/portal/styles/portal.css"/*,
		'resources/gridster/jquery.gridster',
	    'css!resources/gridster/jquery.gridster.css'*/ ], 
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
			this.$el.css({
				"height":"100%",
				"width":"100%"
			});
			
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
			setTimeout(function(){
				$(window).resize();
			},300);
		},
		loadWidgets:function(){
			var me = this, loadWidgetModule = $.proxy(this.loadWidgetModule,this);
			this.widgets=[
			              {widgetId:1,moduleName:"notice",moduleUrl:"modules/common/portal/widgets/notice/views/NoticeWidgetView",isIframe:"N",frameUrl:"",sizeX:6, sizeY:10},
			              {widgetId:2,moduleName:"canlendar",moduleUrl:"modules/common/portal/widgets/calendar/views/CalendarWidgetView",isIframe:"N",frameUrl:"",sizeX:6, sizeY:10},
			              {widgetId:3,moduleName:"devinspection",moduleUrl:"modules/common/sysmonitor/widgets/devinspection/views/DevInspectionView",isIframe:"N",frameUrl:"",sizeX:3, sizeY:10},
			              
			              {widgetId:4,moduleName:"resourcecapacity",moduleUrl:"modules/common/sysmonitor/widgets/rmmonitor/views/ResourceCapacityView",isIframe:"N",frameUrl:"",sizeX:6, sizeY:10},
			              
			              {widgetId:5,moduleName:"m5",moduleUrl:"modules/nms/monitorHomePage/views/resourcePoolStatistics",isIframe:"N",frameUrl:"",sizeX:3, sizeY:10}
			              ];
			$.each(this.widgets,function(i,w){
				
				if(w.isIframe=="Y"){
					var widget = me.gridster.add_widget('<li id="portal-widget-'+w.moduleName+'" ></li>',w.sizeX,w.sizeY);
				}
				else{
					var widget = me.gridster.add_widget('<li id="portal-widget-'+w.moduleName+'"></li>',w.sizeX,w.sizeY);
					loadWidgetModule('#portal-widget-'+w.moduleName+'',w.moduleUrl,widget);
				}
				
			});
			
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