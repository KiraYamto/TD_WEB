define([
	'text!modules/common/oaas/user/usercenter/templates/UserCenterView.html',
	'i18n!modules/common/oaas/user/usercenter/i18n/UserCenter.i18n',
	'modules/common/cloud-utils',
	'css!modules/common/oaas/user/usercenter/styles/usercenter.css'
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
			
			
		}
	
	});
});