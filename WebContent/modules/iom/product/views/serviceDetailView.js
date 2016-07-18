define([
	'text!modules/iom/product/templates/serviceDetailView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/productManage.css'+codeVerP
], function(serviceDetailViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(serviceDetailViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		serviceData:null,
		events: {
			'click #iom-service-save-button':'eventAdd',
			"click #iom-service-detail-tabs-a-link": "serviceTabsAClick",
			"click #iom-service-detail-tabs-b-link": "serviceTabsBClick"	
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			this.popeditControl= this.$('#iom-serviceProduct-add').popedit({
				dataTextField :'NAME',
				dataValueField :'ID',
				dialogOption: {
					height: 400,
					width: 500,
					viewOptions:{
					}
				}, 
				url:'js!modules/iom/product/views/productSelectView',  
				showClearIcon:false
			});
			this.popeditControl= this.$('#iom-serviceEvent-add').popedit({
				dataTextField :'NAME',
				dataValueField :'ID',
				dialogOption: {
					height: 400,
					width: 500,
					viewOptions:{
					}
				}, 
				url:'js!modules/iom/product/views/eventSelectView',  
				showClearIcon:false
			});
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			$("#iom-service-effDate-add").datetimepicker({});
			$("#iom-service-expDate-add").datetimepicker({});
			$("#iom-service-detail-tabs").tabs();
			this.serviceData = this.options.serviceData;
			this.loadDetailInfo();	
			this.loadServiceBgridRender();	 
			this.getSerApplyRuleDataBySerId(this.serviceData.ID);
		}, 
		loadServiceBgridRender: function() {
			var dcGridPerData = $.proxy(this.getSerApplyRuleDataBySerId,this); //函数作用域改变
			this.$("#iom-service-detail-tabs-b-grid").grid({
				datatype: "json", 
				width: "80%",
				colModel: [{
					name: 'PACKAGE_APPLY_RULE_NAME',
					label: '流程名称',
					width: 300
				}],
				rowNum: 10,
				pager: true,
				server: true,
				pageData: dcGridPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		serviceTabsAClick:function(){
			this.$('#iom-service-tabs-a').show();
			this.$('#iom-service-tabs-b').hide(); 
			$(window).resize();
		},
		serviceTabsBClick:function(){
			this.$('#iom-service-tabs-b').show();
			this.$('#iom-service-tabs-a').hide(); 
			$(window).resize();
		}, 
		loadDetailInfo : function(){	
			var me=this;
			var data = me.serviceData;
			var typeId = data.TYPE_ID;
			$('#iom-serviceProduct-detail').val(data.PRODUCTNAME);
			$('#iom-serviceEvent-detail').val(data.EVENTNAMES);
			$('#iom-serviceName-detail').val(data.NAME);
			$('#iom-serviceCode-detail').val(data.CODE);
			$('#iom-serviceBelong-detail').val(data.ATTACH);
			$('#iom-service-vesion-detail').val(data.EDITION);
			$('#iom-service-effDate-detail').val(data.EFF_DATE);
			$('#iom-service-expDate-detail').val(data.EXP_DATE);
			$('#iom-event-remark-detail').val(data.COMMENTS); 
			$('#iom-serviceBelong-detail').combobox({
		        dataTextField: 'NAME',
		        dataValueField: 'ID',
		        dataSource: [{"NAME":"云公司","ID":"001"},{"NAME":"云公司","ID":"002"}]
		    });
			$('#iom-serviceBelong-detail').combobox('disable');  
		},
		getSerApplyRuleDataBySerId: function(serviceId) { //请求服务器获取数据的方法
			var map = new Object();
			var rowNum = this.$("#iom-service-detail-tabs-b-grid").grid("getGridParam", "rowNum");
			var page =   this.$("#iom-service-detail-tabs-b-grid").grid("getGridParam", "page"); 
			map.serviceId = this.serviceData.ID+"";
			map.pageIndex = (page-1);
			map.pageSize = 10;
			$("#iom-service-detail-tabs-b-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb','getServiceApplyRuleList',map).done(function(ret){
				ret = JSON.parse(ret);
				if(ret!=null){
					if(ret.length == 0){
						ret = "";
					} 
					$("#iom-service-detail-tabs-b-grid").grid("reloadData", ret);
				}
			});
			$("#iom-service-detail-tabs-b-grid").unblockUI().data('blockui-content', false);
		}
	});
});