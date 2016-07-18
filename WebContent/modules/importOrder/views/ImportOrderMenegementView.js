define([
	'text!modules/importOrder/templates/ImportOrderMenegementView.html',
	'i18n!modules/importOrder/i18n/importOrder.i18n',
	'modules/common/cloud-utils',
	'css!modules/importOrder/styles/ImportOrdermanagement.css'
], function(ImportOrderMenegementViewTpl, i18nImportOrder,utils,css) {
	return fish.View.extend({
		template: fish.compile(ImportOrderMenegementViewTpl),
		i18nData: fish.extend({}, i18nImportOrder),
		events: {
			'click #importOrder-import-btn':'importOrder'
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			
			
			
			
		},
		importOrder: function () {
			var xml = $('#importOrder-xml').val();
			utils.ajax('iomService','importOrder',xml).done(function(msg){
				fish.info({title:'提示',message:msg});
			});
		}
	});
});