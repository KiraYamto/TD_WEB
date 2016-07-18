define(['text!modules/common/portal/widgets/notice/templates/NoticeWidgetView.html',
		'i18n!modules/common/portal/widgets/notice/i18n/Notice.i18n',
		'modules/common/cloud-utils' ], 
		function(viewTpl, i18n,utils) {

	return fish.View.extend({
		template : fish.compile(viewTpl),
		i18nData : fish.extend({}, i18n),
		events : {
			'click #com-portal-notice-add':"addNotice",
			'click #com-portal-notice-viewhis' : "viewNoticeHis"
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
			var me=this;
			
			this.$("#com-portal-notice-grid").grid({
				 data: [],
				 colModel: [{
			            name: 'noticeId', 
			            hidden: true,
			            key:true
			        },{
			        	name: 'noticeBody',
	                    label: "公共",
	                    width: "100%",
	                    sortable: false
			        }]
			
		    ,autowidth:true
		    ,width:"100%"
			});
			
			if(currentUser){
				utils.ajax("systemManagerService","queryStaffNoticesPaging",currentUser.staffId,1,20).done(function(pages){
					var notices = pages?pages.rows:[];
					
					me.$("#com-portal-notice-grid").grid("reloadData",notices); 
	
					
				});
				
				
				
				if(!this.watchMainMessage("publicNotice",function(e,n){
					
					if(n.data){
						if(n.data.isTop){
							me.$("#com-portal-notice-grid").grid("addRowData", n.data, "first");
						}
						else{
							
							 var data = me.$("#com-portal-notice-grid").grid("getRowData");
							 var fistNoTop= _.findWhere(data,{isTop:false});
							 if(fistNoTop){
								 var dstrowid = me.$("#com-portal-notice-grid").grid("getRowid",fistNoTop);
								 me.$("#com-portal-notice-grid").grid("addRowData", n.data, "before", dstrowid);
							 }else{
								 me.$("#com-portal-notice-grid").grid("addRowData", n.data, "first");
							 }
						}	
					}
					console.log('publicNotice:  ',n) 
				})){
					me.thread(function(){
						utils.ajax("systemManagerService","queryStaffNoticesPaging",currentUser.staffId,1,20).done(function(pages){
							var notices = pages?pages.rows:[];
							if(me.$("#com-portal-notice-grid").is(":visible"))
								me.$("#com-portal-notice-grid").grid("reloadData",notices); 
	
							
						});
						
					},1000*60);
					
				}
			}
			this.resize();
			setTimeout($.proxy(this.resize(),this),500);
			setTimeout($.proxy(this.resize(),this),1000);
			setTimeout($.proxy(this.resize(),this),3000);
		},addNotice:function(){
			var me =this;
			this.noticePopupView = fish.popupView({url: 'modules/common/portal/widgets/notice/views/NoticeInfoView',
				width: "60%",
				viewOption:{
					
				},
				callback:function(popup,view){
					
					popup.result.then(function (e) {
						
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
			
		},
		viewNoticeHis:function(){
			var me =this;
			this.noticePopupView = fish.popupView({url: 'modules/common/portal/widgets/notice/views/NoticeHisView',
				width: "80%"
			});
			
		},
		resize:function(){
			
			
			this.$('#com-portal-notice-grid').grid("setGridHeight",((this.$('.widget-body').height()-this.$('.widget-tabs').outerHeight(true))+"px"));
			
			this.$('#com-portal-notice-grid').grid("resize",true);
		}
	});
});