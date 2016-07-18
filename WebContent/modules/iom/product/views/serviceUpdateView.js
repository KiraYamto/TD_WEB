define([
	'text!modules/iom/product/templates/serviceUpdateView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/productManage.css'+codeVerP
], function(serviceUpdateViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(serviceUpdateViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		serviceData:null,
		events: {
				'click #iom-service-update-save-button':'serviceUpdate',
				"click #iom-service-update-tabs-a-link": "serviceTabsAClick",
				"click #iom-service-update-tabs-b-link": "serviceTabsBClick",
				"click #service-update-rule-add-btn": "serviceRuleAdd",
				'click #service-update-rule-mod-btn': 'applyRuleUpdate',
				'click #service-update-rule-del-btn': 'applyRuleDelete'
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			$("#iom-service-effDate-update").datetimepicker({});
			$("#iom-service-expDate-update").datetimepicker({});
			$("#iom-service-update-tabs").tabs();
			this.serviceData = this.options.serviceData; 
			this.loadServiceBelong();
			this.loadDetailInfo();
			this.loadServiceBgridRender();	
			this.getSerApplyRuleDataBySerId(this.serviceData.ID);
		}, 
		getSerApplyRuleDataBySerId: function(serviceId) { //请求服务器获取数据的方法
			var map = new Object();
			var rowNum = this.$("#iom-service-update-tabs-b-grid").grid("getGridParam", "rowNum");
			var page =   this.$("#iom-service-update-tabs-b-grid").grid("getGridParam", "page"); 
			map.serviceId = this.serviceData.ID+"";
			map.pageIndex = (page-1);
			map.pageSize = 10;
			$("#iom-service-update-tabs-b-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb','getServiceApplyRuleList',map).done(function(ret){
				ret = JSON.parse(ret);
				if(ret!=null){
					if(ret.length == 0){
						ret = "";
					} 
					$("#iom-service-update-tabs-b-grid").grid("reloadData", ret);
				}
			});
			$("#iom-service-update-tabs-b-grid").unblockUI().data('blockui-content', false);
		},
		loadServiceBgridRender: function() {
			var dcGridPerData = $.proxy(this.getSerApplyRuleDataBySerId,this); //函数作用域改变
			this.$("#iom-service-update-tabs-b-grid").grid({
				datatype: "json", 
				width: "80%",
				colModel: [{
					name: 'PACKAGE_APPLY_RULE_NAME',
					label: '流程名称',
					width: 300
				},{
					name: 'ID',
					label: 'ID',
					width: 300,
					hidden:true
				}],
				rowNum: 10,
				multiselect:true,
				pager: true,
				server: true,
				pageData: dcGridPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		serviceTabsAClick:function(){
			this.$('#iom-service-update-tabs-a').show();
			this.$('#iom-service-update-tabs-b').hide(); 
			$(window).resize();
		},
		serviceTabsBClick:function(){
			this.$('#iom-service-update-tabs-a').show();
			this.$('#iom-service-update-tabs-a').hide(); 
			$(window).resize();
		}, 
		productTabsAClick:function(){
			this.$('#iom-event-tabs-a').show();
			$(window).resize();
		},
		loadServiceBelong : function(){
			$('#iom-serviceBelong-update').combobox();
			var me=this;
			var $combobox1 = $('#iom-serviceBelong-update').combobox({
		        dataTextField: 'NAME',
		        dataValueField: 'ID',
		        dataSource: [{"NAME":"云公司","ID":"001"}]
		    });
			$combobox1.on('combobox:open', function (e) {
		       console.log('open event');
		    });
		    $combobox1.on('combobox:close', function (e) {
		       console.log('close event');
		    });
		    $combobox1.on('combobox:change', function () {
		       console.log('change event');
		    });
		} , 
		loadDetailInfo : function(){	
			var me=this;
			var data = me.serviceData;
			var typeId = data.TYPE_ID;
			var CATALOG_ID = me.serviceData.CATALOG_ID+"";
			if('1'==CATALOG_ID){
				$("#iom-selectProductDiv-update").show();
				$('#iom-serviceProduct-update').val(data.PRODUCTNAME);
				$('#iom-serviceEvent-update').val(data.EVENTNAMES);
			}else{
				$("#iom-selectProductDiv-update").hide();
				$('#iom-serviceEvent-update').val(data.EVENTNAME);
			}
			$('#iom-serviceName-update').val(data.NAME);
			$('#iom-serviceCode-update').val(data.CODE);
			$('#iom-service-vesion-update').val(data.EDITION);
			$("#iom-service-effDate-update").datetimepicker("value", data.EFF_DATE);
			$("#iom-service-expDate-update").datetimepicker("value", data.EXP_DATE);
			$('#iom-service-remark-update').val(data.COMMENTS); 
			$('#iom-serviceBelong-update').val(data.ATTACH);
			$('#iom-serviceBelong-update').combobox({
		        dataTextField: 'NAME',
		        dataValueField: 'ID',
		        dataSource: [{"NAME":"云公司","ID":"001"},{"NAME":"云公司","ID":"002"}]
		    });
			//$('#iom-serviceBelong-update').combobox('disable');  
		},
		serviceUpdate : function(){	
			var me=this;
			var result = $("#iom-service-form").isValid();
			if(false==result){
				return;
			}
	        //获取表单信息
			var formValue = $('#iom-service-update-form').form("value");
			var map = new Object();
			//map.PRO_ID = me.$('#iom-serviceProduct-update').data('uiPopedit').getValue().ID+"";
			map.ID = me.serviceData.ID;
			map.NAME = formValue["iom-serviceName-update"]+"";
			map.CODE = formValue["iom-serviceCode-update"]+"";
			map.CATALOG_ID = me.serviceData.CATALOG_ID+"";
			map.ATTACH = formValue["iom-serviceBelong-update"]+"";
			map.EDITION = formValue["iom-service-vesion-update"]+"";
			
			var effDate = $("#iom-service-effDate-update").datetimepicker("value");
			var expDate = $("#iom-service-expDate-update").datetimepicker("value");
			if(effDate>=expDate || effDate>expDate){
				fish.info({title:'提示',message:"生效时间要大于当前时间 小于失效时间"});
				return;
			}
			map.EFF_DATE = effDate;
			map.EXP_DATE = expDate;   
			map.Comments = formValue["iom-service-remark-update"]+""; 
			var method = "updateServiceWithProduct" ; 
			console.log(formValue);
			utils.ajax('cloudIomServiceForWeb',method,map)
			.done(function(ret){
				var data = JSON.parse(ret);
				var opreateResoult = data.opreateResoult;
				var opreateResoultMsg = data.opreateResoultMsg;
				if(false == opreateResoult){ 
					fish.info({title:'提示',message:opreateResoultMsg.errorMessage+","+opreateResoultMsg.errorResolve});
					return;
				}else{
					fish.info({title:'提示',message:opreateResoultMsg});
					me.popup.close(ret);
				}
			}).fail(function(e){
				console.log(e);
				fish.error(e);
			});
	        
		},
		applyRuleDelete:function(){
			var me=this;
			var selections = this.$("#iom-service-update-tabs-b-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length > 0){
				var length=selections.length;
				var arr = new Array(length);
				for(var i=0;i<length;i++){
					arr[i] = selections[i].ID;
				}
				utils.ajax('cloudIomServiceForWeb','deletePackageApplyRule',arr).done(function(ret){
					me.getSerApplyRuleDataBySerId(me.serviceData.ID);
				});
				
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		},
		serviceRuleAdd : function(){	 
			var me=this;
			var serviceId = null;
			if(''==me.serviceData || undefined == me.serviceData){
				fish.info({title:'提示',message:"请先新增服务再新增规则"});
				return;
			}else{
				serviceId = me.serviceData.ID;
			}
			var pop =fish.popupView({
				url: 'modules/iom/product/views/serviceApplyRuleAddView',
				width: "80%",
				viewOption : {"serviceData":me.serviceData},
				callback:function(popup,view){
					popup.result.then(function (e) {
						me.getSerApplyRuleDataBySerId(serviceId);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		applyRuleUpdate:function(){
			var me=this;
			var serviceId = me.serviceData.ID;
			var selections = this.$("#iom-service-update-tabs-b-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1){
				var selected = selections[0];
				var pop =fish.popupView({
					url: 'modules/iom/product/views/serviceApplyRuleUpdateView',
					width: "80%", 
					viewOption:{
						action:"detail.spacerm-dc",
						data:selected,
						"serviceId":serviceId
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							me.getSerApplyRuleDataBySerId(serviceId);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}else if(selections.length > 1){
				fish.info({title:'提示',message:'一次只能操作一条记录！'});
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		}
		
	});
});