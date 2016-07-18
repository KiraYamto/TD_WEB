define([
	'text!modules/common/portal/widgets/notice/templates/NoticeHisView.html',
	'i18n!modules/common/portal/widgets/notice/i18n/Notice.i18n',
	'modules/common/cloud-utils'
], function(viewTpl, i18n,utils) {
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		events: {
			
		},
		_render: function() {
			
			this.$el.html(this.template(this.i18nData));
			
			
			return this;
		},
		_afterRender: function() {
			var me =this;
			
			this.$("#com-portal-notice-his-grid").grid({
				 datatype: "json",
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
		    ,width:"100%",
		    rowNum: 10,
            pager: true,
            server: true,
            pageData: $.proxy(this.loadNotices ,this)
			});
			this.loadNotices();
		},
		loadNotices:function(page, rowNum, sortname, sortorder){
			var me= this;
			page = page || me.$("#com-portal-notice-his-grid").grid("getGridParam", "page");
			rowNum = rowNum || me.$("#com-portal-notice-his-grid").grid("getGridParam", "rowNum");
			utils.ajax("systemManagerService","queryStaffNoticesPaging",currentUser.staffId,page,rowNum).done(function(pages){
				
				me.$("#com-portal-notice-his-grid").grid("reloadData",pages); 

				
			});
		},
		resize:function(){
			this.$("#com-portal-notice-his-grid").grid("resize",true);
		}
	
	});
});