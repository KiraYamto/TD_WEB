define([
	'text!modules/iom/product/templates/productDetailView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/productManage.css'+codeVerP
], function(productDetailViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(productDetailViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		productData:null,
		events: {
			"click #iom-product-tabs-a-link": "productTabsAClick",
			"click #iom-product-tabs-b-link": "productTabsBClick",
			'click #iom-product-tabs-c-link':'productTabsCClick',
			'click #iom-product-tabs-f-link':'productTabsFClick',
			'click #iom-product-save-button':'productAdd'
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
			$("#iom-product-tabs").tabs();
			this.$('#iom-product-tabs-a').show();
			this.$('#iom-product-tabs-b').hide();  
			this.loadDetailInfo();
			this.loadProductBgridRender(this.productData.ID);
			if('1'==this.productData.CATALOG_ID){
				$("#iom-endtoend-detail-div").show();
				$("#iom-dependProdType-detail-div").hide();
			}else{
				$("#iom-dependProdType-detail-div").show();
				$("#iom-endtoend-detail-div").hide();
			}
		}, 
		productTabsAClick:function(){
			this.$('#iom-product-tabs-a').show();
			this.$('#iom-product-tabs-b').hide(); 
			this.$('#iom-product-tabs-a').addClass('ui-tabs-active');
			this.$('#iom-product-tabs-b').removeClass('ui-tabs-active'); 
			//$(window).resize();
		},
		productTabsBClick:function(){
			this.loadProductBgridRender(); 
			this.$('#iom-product-tabs-b').show();
			this.$('#iom-product-tabs-a').hide();
			this.$('#iom-product-tabs-b').addClass('ui-tabs-active');
			this.$('#iom-product-tabs-a').removeClass('ui-tabs-active');
			//$(window).resize();
		}, 
		loadProductBgridRender: function() {
			var dcGridPerData = $.proxy(this.getProductCharacterListByproductId,this); //函数作用域改变
			this.$("#iom-product-tabs-b-grid").grid({
				datatype: "json",
				height: 200,
				width: "80%", 
				colModel: [{
					name: 'NAME',
					label: '特征描述',
					width: 150
				}, {
					name: 'CODE',
					width: 100,
					label: '标准编码'
				}, {
					name: 'DEFAULT_VALUE',
					label: '缺省值',
					width: 200
				}, {
					name: 'ISNULL',
					width: 200,
					label: '是否可空' 
				}, {
					name: 'PPCVVALUE',
					width: 200,
					label: '产品取值' 

				}, {
					name: 'CRM_PROD_ATTR_ID',
					width: 200,
					label: 'CRM特征标识' 
				}],
				rowNum: 10, 
				datatype: "json",
				pager: true,
				server: true,
				multiselect:false,
				shrinkToFit:true,
				pageData: dcGridPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
			dcGridPerData();
		},  
		getProductCharacterListByproductId: function(productId) {
			var me=this;
			var map = new Object();
			var rowNum = this.$("#iom-product-tabs-b-grid").grid("getGridParam", "rowNum");
			var page = this.$("#iom-product-tabs-b-grid").grid("getGridParam", "page"); 
			if('' == productId || undefined == productId || null == productId){
				map.productId = me.productData.ID+"";
			}else{
				map.productId = me.productId.ID+"";
			}
			map.pageIndex = (page-1);
			map.pageSize = 10;
			$("#iom-product-tabs-b-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb','getProductCharacterList',map).done(function(ret){
				ret = JSON.parse(ret);
				if(ret!=null){
					if(ret.length == 0){
						ret = "";
					} 
					$("#iom-product-tabs-b-grid").grid("reloadData", ret);
				}
			});
			$("#iom-product-tabs-b-grid").unblockUI().data('blockui-content', false);
		},
		 
		loadDetailInfo : function(){	
			var me=this;
			var productData = me.productData;
			var typeId = productData.TYPE_ID;
			$('#iom-productName-detail').val(productData.NAME);
			$('#iom-productCode-detail').val(productData.CODE);
			$('#iom-CrmProductCode-detail').val(productData.CRM_PROD_ID); 
			
			var typeData = [{"value":productData.TYPE_ID,"name":productData.TYPE_NAME}];
			$('#iom-productType-detail').combobox({
		        placeholder: '',
		        dataTextField: 'name',
		        dataValueField: 'value',
		        dataSource:  typeData
		    });
			$('#iom-productType-detail').combobox('value', typeId)
			$('#iom-product-remark-detail').val(productData.COMMENTS); 
			$('#iom-productType-detail').combobox('disable');  
			$('#iom-operatorType-detail').combobox('disable');
			
		}
		
		
		
	});
});