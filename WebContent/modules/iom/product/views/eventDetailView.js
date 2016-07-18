define([
	'text!modules/iom/product/templates/eventDetailView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/productManage.css'+codeVerP
], function(eventDetailViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(eventDetailViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		productData:null,
		events: {
			"click #iom-event-tabs-a-link": "productTabsAClick" 
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.productData = this.options.productData;
			this.loadDetailInfo();	
			
		}, 
		productTabsAClick:function(){
			this.$('#iom-event-tabs-a').show();
			$(window).resize();
		},
		loadDetailInfo : function(){	
			var me=this;
			var data = me.productData;
			var typeId = data.TYPE_ID;
			$('#iom-eventName-detail').val(data.NAME);
			$('#iom-eventCode-detail').val(data.CODE);
			$('#iom-event-effDate-detail').val(data.EFF_DATE);
			$('#iom-event-expDate-detail').val(data.EXP_DATE);
			$('#iom-eventType-detail').val(data.TYPE_ID);
			$('#iom-eventSort-detail').val(data.SORT_ID);
			$('#iom-event-crmEventCode-detail').val(data.CRM_ID); 
			$('#iom-event-remark-detail').val(data.COMMENTS); 
			$('#iom-eventType-detail').combobox({
		        dataTextField: 'NAME',
		        dataValueField: 'ID',
		        dataSource: [{"NAME":data.TYPE_NAME,"ID":data.TYPE_ID}]
		    });
			$('#iom-eventSort-detail').combobox({
		        dataTextField: 'NAME',
		        dataValueField: 'ID',
		        dataSource: [{"NAME":data.SORT_NAME,"ID":data.SORT_ID}]
		    }); 
			$('#iom-eventType-detail').combobox('disable');
			$('#iom-dependProdType-detail').combobox('disable');
			$('#iom-endtoend-detail').combobox('disable');
			$('#iom-eventType-detail').combobox('disable'); 
			$('#iom-eventSort-detail').combobox('disable');
		}
	});
});