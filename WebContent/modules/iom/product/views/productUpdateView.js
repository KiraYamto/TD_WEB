define([
	'text!modules/iom/product/templates/productUpdateView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/productManage.css'+codeVerP
], function(productUpdateViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(productUpdateViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		productData:null,
		events: {
			"click #iom-product-tabs-a-link": "productTabsAClick", 
			'click #iom-product-save-button':'productUpdate'
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
			this.loadProductBgridRender();
			this.loadProductCgridRender();
			this.loadProductType();
			this.loadDetailInfo();	
		}, 
		productTabsAClick:function(){
			this.$('#iom-product-tabs-a').show(); 
			this.$('#iom-product-tabs-a').addClass('ui-tabs-active'); 
			$(window).resize();
		}, 
		loadProductBgridRender: function() {
			this.$("#iom-product-tabs-b-grid").grid({
				datatype: "json",
				height: 200,
				colModel: [{
					name: 'agenedName',
					label: '特征描述',
					width: 100
				}, {
					name: 'startTime',
					width: 100,
					label: '标准编码'
				}, {
					name: 'endTime',
					label: '缺省值',
					width: 100
				}, {
					name: 'taskAgencyId',
					width: 100,
					label: '是否可空' 
				}, {
					name: 'agencyId',
					width: 100,
					label: '产品取值' 

				}, {
					name: 'agencyId',
					width: 100,
					label: 'CRM特征标识' 
				}],
				rowNum: 10,
				pager: true,
				server: true,
				pageData: null //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		loadProductCgridRender: function() {
			this.$("#iom-product-tabs-c-grid").grid({
				datatype: "json",
				height: 200,
				colModel: [{
					name: 'agenedName',
					label: '源产品名称',
					width: 100
				}, {
					name: 'startTime',
					width: 100,
					label: '关系'
				}, {
					name: 'endTime',
					label: '关联产品名称',
					width: 100
				}],
				rowNum: 10,
				pager: true,
				server: true,
				pageData: null //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},loadProductDgridRender: function() {
			this.$("#iom-product-tabs-d-grid").grid({
				datatype: "json",
				height: 200,
				colModel: [{
					name: 'agenedName',
					label: '资源类型名称',
					width: 100
				}, {
					name: 'startTime',
					width: 100,
					label: '资源数量'
				}, {
					name: 'endTime',
					label: '是否必须',
					width: 100
				}],
				rowNum: 10,
				pager: true,
				server: true,
				pageData: null //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},loadProductEgridRender: function() {
			this.$("#iom-product-tabs-e-grid").grid({
				datatype: "json",
				height: 200,
				colModel: [{
					name: 'agenedName',
					label: '资源服务名称',
					width: 100
				}, {
					name: 'startTime',
					width: 100,
					label: '资源服务数量'
				}, {
					name: 'endTime',
					label: '配置顺序',
					width: 100
				}],
				rowNum: 10,
				pager: true,
				server: true,
				pageData: null //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		 
		/* 加载产品类型 */
		loadProductType : function(){	
			$('#iom-productType-update').combobox();
			var me=this;
//			var $combobox1 ;
			utils.ajax('cloudIomServiceForWeb','qryProdType').done(function(ret){
				var data = JSON.parse(ret);
				var $combobox1 = $('#iom-productType-update').combobox({
			        dataTextField: 'NAME',
			        dataValueField: 'ID',
			        dataSource: data
			    });
				if(null != me.catalogId && ''!= me.catalogId && undefined != me.catalogId && me.catalogId==1){
					$combobox1.combobox("value","001");
					$combobox1.combobox('disable'); 
				}else if(null != me.catalogId && ''!= me.catalogId && undefined != me.catalogId && me.catalogId==2){
					$combobox1.combobox("value","002");
					$combobox1.combobox('disable'); 
				}else{
					$combobox1.combobox('enable');
				}
				
				$combobox1.on('combobox:open', function (e) {
			       console.log('open event');
			    });

			    $combobox1.on('combobox:close', function (e) {
			       console.log('close event');
			    });

			    $combobox1.on('combobox:change', function () {
			       console.log('change event');
			    });
			}); 
		}, 
		loadDetailInfo : function(){	
			var me=this;
			var productData = me.productData;
			var typeId = productData.TYPE_ID;
			$('#iom-productName-update').val(productData.NAME);
			$('#iom-productCode-update').val(productData.CODE);
			$('#iom-productType-update').val(typeId);
			$('#iom-CrmProductCode-update').val(productData.CRM_PROD_ID); 
			$('#iom-product-remark-update').val(productData.COMMENTS); 
			 
			
		},
		/*修改产品 */
		productUpdate : function(){	
			var me=this;
			var result = $("#iom-product-form").isValid();
			if(false==result){
				return;
			}
	        console.log(result);
	        //获取表单信息
			var formValue = $('#iom-product-form').form("value");
			var map = new Object();
			map.ID = me.productData.ID;
			map.productName = formValue["iom-productName-update"];
			map.catalogId = this.options.catalogId+"";
			map.productName = formValue["iom-productName-update"];
			map.productCode = formValue["iom-productCode-update"];
			map.productType = formValue["iom-productType-update"]+"";
			map.crmProductCode = formValue["iom-CrmProductCode-update"];
			map.remark = formValue["iom-product-remark-update"]; 
			console.log(formValue);
			utils.ajax('cloudIomServiceForWeb','updateProd',map)
			.done(function(ret){
				var data = JSON.parse(ret);
				var opreateResoult = data.opreateResoult;
				var opreateResoultMsg = data.opreateResoultMsg;
				if(false == opreateResoult){ 
					fish.info({title:'提示',message: opreateResoultMsg});
					return;
				}else{
					fish.info({title:'提示',message:opreateResoultMsg});
					me.popup.close(ret);
				}
			}).fail(function(e){
				console.log(e);
				fish.error(e);
			});
	        
		}
		
		
		
	});
});