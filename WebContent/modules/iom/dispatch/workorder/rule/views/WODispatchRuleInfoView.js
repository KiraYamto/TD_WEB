define([
	'text!modules/iom/dispatch/workorder/rule/templates/WODispatchRuleInfoView.html',
	'i18n!modules/iom/dispatch/i18n/dispatch.i18n',
	'modules/common/cloud-utils'
], function(viewTpl, i18n,utils) {
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		events: {
			
		},
		//这里用来进行dom操作
		_render: function() {
			
			this.$el.html(this.template(this.i18nData));
			
			return this;
		},
		_afterRender: function() {
			
			this.$('#dispatch-workorder-rulesinfo-tache').popedit({
				dataTextField :'text',
				dataValueField :'id',
				dialogOption: {
					height: 400,
					width: 500,
					viewOptions:{
						orgId:101,
						orgPathName:'啦啦啦'
					}
				},
				url:"js!modules/common/popeditviews/areas/views/SelectAreaByAreaIdView",//'js!modules/common/popeditviews/stafforg/views/JobStaffsbyOrgView',//'js!modules/common/popeditviews/stafforg/views/JobStaffsbyParentOrgView',
				showClearIcon:false
			});
			
			this.$('#dispatch-workorder-rulesinfo-prod').popedit({
				dataTextField :'name',
				dataValueField :'id',
				dialogOption: {
					height: 400,
					width: 500,
					viewOptions:{
						orgId:101,
						orgPathName:'啦啦啦'
					}
				},
				url:"js!modules/iom/product/views/productSelectView",//'js!modules/common/popeditviews/stafforg/views/JobStaffsbyOrgView',//'js!modules/common/popeditviews/stafforg/views/JobStaffsbyParentOrgView',
				showClearIcon:false
			});
		},
		resize:function(){
			
			
		}
		
	});
});