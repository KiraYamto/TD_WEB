define([
	'text!modules/common/portal/widgets/notice/templates/NoticeInfoView.html',
	'i18n!modules/common/portal/widgets/notice/i18n/Notice.i18n',
	'modules/common/cloud-utils'
], function(viewTpl, i18n,utils) {
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		events: {
			"click #com-portal-noticeinfo-save":"publicNotice"
		},
		_render: function() {
			
			this.$el.html(this.template(this.i18nData));
			
			
			return this;
		},
		_afterRender: function() {
			var me =this;
			this.$("#com-portal-noticeinfo-istop").switchbutton();
			me.$('.panel-body').blockUI({message: '加载中'}).data('blockui-content', true);
			
			utils.ajax("systemManagerService","findNoticeTypes").done(function(types){
				me.$("#com-portal-noticeinfo-noticeType").combobox({
			        placeholder: '选择类型',
			        dataTextField: 'noticeTypeName',
			        dataValueField: 'noticeTypeId',
			        dataSource: types
			    });
				me.$('.panel-body').unblockUI().data('blockui-content', false);
				me.$('#com-portal-noticeinfo-form').form({
			        validate: 1
			    });
				
			});
			
		},
		publicNotice:function(){
			if(this.$('#com-portal-noticeinfo-form').isValid()){
				var notice=this.$('#com-portal-noticeinfo-form').form('value');
				var popup=this.popup,me=this;
				var isTop = $("#com-portal-noticeinfo-istop").data("uiSwitchbutton").options.state?true:false;
				notice = _.extend(notice,{
					publicStaffId:currentUser.staffId,
					isTop:isTop
				});
				//ws.send("public",notice);
				utils.ajax("systemManagerService","createNotice",notice).done(function(){
						fish.info("发布成功").result.always(function(){
							popup.close(true);
						});
						
						
						
					}).fail(function(){
						fish.info("发布失败").result.always(function(){
							popup.close(false);
						});
						
						
					});
				
				
			}
		}
	
	});
});