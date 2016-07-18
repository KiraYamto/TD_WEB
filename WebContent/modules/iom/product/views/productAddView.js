define([
	'text!modules/iom/product/templates/productAddView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/productManage.css'+codeVerP
], function(productManageViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(productManageViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		catalogId:null,
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
			this.catalogId = this.options.catalogId;
			$("#iom-product-tabs").tabs();
			this.$('#iom-product-tabs-a').show();  
			this.loadProductBgridRender();
			this.loadProductCgridRender();
			this.loadProductType(); 
			if('1'==this.catalogId){
				$("#iom-endtoend-add-div").show();
				$("#iom-dependProdType-add-div").hide();
			}else{
				$("#iom-endtoend-add-div").hide();
				$("#iom-dependProdType-add-div").show();
			}
			
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
			$('#iom-productType').combobox();
			var me=this;
//			var $combobox1 ;
			utils.ajax('cloudIomServiceForWeb','qryProdType').done(function(ret){
				var data = JSON.parse(ret);
				var $combobox1 = $('#iom-productType').combobox({
			        dataTextField: 'NAME',
			        dataValueField: 'ID',
			        dataSource: data
			    });
				if(null != me.catalogId && ''!= me.catalogId && undefined != me.catalogId && me.catalogId==1){
					$combobox1.combobox("value","001");
					$combobox1.combobox('disable');
					$('#iom-dependProdType').combobox('disable');
					
				}else if(null != me.catalogId && ''!= me.catalogId && undefined != me.catalogId && me.catalogId==2){
					$combobox1.combobox("value","002");
					$combobox1.combobox('disable');
					$('#iom-endtoend').combobox('disable');
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
		/* 新增产品 */
		productAdd : function(){	
			var me=this;
			var result = $("#iom-product-form").isValid();
			if(false==result){
				return;
			}
	        console.log(result);
	        //获取表单信息
			var formValue = $('#iom-product-form').form("value");
			var map = new Object();
			map.productName = formValue["iom-productName"];
			map.catalogId = this.options.catalogId+"";
			map.productName = formValue["iom-productName"];
			map.productCode = formValue["iom-productCode"];
			map.productType = formValue["iom-productType"]+"";
			map.crmProductCode = formValue["iom-CrmProductCode"];
			map.productVesion = formValue["iom-productVesion"]+"";
			map.productAlias = formValue["iom-productAlias"];
			map.operatorType = formValue["iom-operatorType"]+"";
			map.remark = formValue["iom-product-remark"];  
			console.log(formValue);
			utils.ajax('cloudIomServiceForWeb','addProd',map)
			.done(function(ret){
				var data = JSON.parse(ret);
				var opreateResoult = data.opreateResoult;
				var opreateResoultMsg = data.opreateResoultMsg;
				if(false == opreateResoult){ 
					fish.info({title:'提示',message:opreateResoultMsg});
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