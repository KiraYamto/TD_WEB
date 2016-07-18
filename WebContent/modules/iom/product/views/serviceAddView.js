define([
	'text!modules/iom/product/templates/serviceAddView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/productManage.css'+codeVerP
], function(serviceAddViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(serviceAddViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		catalogId:null,
		serviceData : null,
		productName :null,
		productCode :null,
		eventName :null,
		eventCode :null,
		events: {
			'click #iom-service-save-button':'ServiceAdd',
			"click #iom-service-tabs-a-link": "serviceTabsAClick",
			"click #iom-service-tabs-b-link": "serviceTabsBClick",
			"click #service-service-rule-add-btn": "serviceRuleAdd",
			"click #service-service-rule-add-btn2": "serviceTabsBClick",
			'click #service-service-rule-mod-btn': 'applyRuleUpdate',
			'click #service-service-rule-del-btn': 'applyRuleDelete'
			
		},
		//这里用来进行dom操作
		_render: function() {
			var me=this;
			this.$el.html(this.template(this.i18nData));
			this.popeditControl= this.$('#iom-serviceProduct-add').popedit({
				dataTextField :'name',
				dataValueField :'id',
				dialogOption: {
					height: 400,
					width: 500,
					viewOptions:{
					}
				}, 
				url:'js!modules/iom/product/views/productSelectView',  
				change:function(e, data){  
					me.productName = data.name;
					me.productCode = data.PROD_CODE; 
					$("#iom-serviceEvent-add").popedit('enable');
					var pid = me.$('#iom-serviceProduct-add').data('uiPopedit').getValue();
					if(undefined == pid){
						$("#iom-serviceEvent-add").popedit('disable');
					}else{
						$("#iom-serviceEvent-add").popedit('enable');
					}
		            console.log("change:"+data.value); 
		        },
				showClearIcon:false
			});
			  
            this.popeditControl= this.$('#iom-serviceEvent-add').popedit({
				dataTextField :'name',
				dataValueField :'id',
				dialogOption: {
					height: 400,
					width: 500,
					viewOptions:{
					}
				}, 
				url:'js!modules/iom/product/views/eventSelectView', 
				change:function(e, data){//可以绑定change事件改变初始值
					var pid = me.$('#iom-serviceProduct-add').data('uiPopedit').getValue();
					//var eid = me.$('#iom-serviceEvent-add').data('uiPopedit').getValue();
					me.eventName = data.name;
					me.eventCode = data.EVENT_CODE;
					$('#iom-serviceName-add').val(me.productName+'-'+me.eventName);
					$('#iom-serviceCode-add').val(me.productCode+'-'+me.eventCode);
		            console.log("change:"+data.value); 
		        },
				showClearIcon:false
			});
            
            
            
			//this.$('#iom-serviceEvent-add').attr('disable','');
			//this.$('#iom-serviceEvent-add').removeAttr('disable')
			return this;
		},
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			$("#iom-service-effDate-add").datetimepicker({});
			$("#iom-service-expDate-add").datetimepicker({});
			this.catalogId = this.options.catalogId; 
			if('1'==this.catalogId){
				$("#iom-selectProductDiv-add").show();
			}else{
				$("#iom-selectProductDiv-add").hide();
			}
			$("#iom-service-tabs").tabs();
			$("#iom-serviceEvent-add").popedit('disable');
			this.loadServiceBelong();
			this.loadServiceBgridRender();
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
		loadServiceBgridRender: function() {
			this.$("#iom-service-tabs-b-grid").grid({
				datatype: "json", 
				width: "80%",
				colModel: [{
					name: 'ruleName',
					label: '流程名称',
					width: 300
				}, {
					name: 'ruleCode',
					width: 300,
					label: '流程编码'
				}],
				rowNum: 10,
				pager: true,
				server: true,
				pageData: null //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
		},
		 
		/* 新增 */
		ServiceAdd : function(){	
			var me=this;
			var result = $("#iom-service-form").isValid();
			if(false==result){
				return;
			}
	        //获取表单信息
			var formValue = $('#iom-service-form').form("value");
			var map = new Object();
			map.EVT_ID = me.$('#iom-serviceEvent-add').data('uiPopedit').getValue().ID+"";
			map.NAME = formValue["iom-serviceName-add"]+"";
			map.CODE = formValue["iom-serviceCode-add"]+"";
			map.CATALOG_ID = me.catalogId+"";
			map.ATTACH = formValue["iom-serviceBelong-add"]+"";
			map.EDITION = formValue["iom-service-vesion-add"]+"";
			
			var effDate = $("#iom-service-effDate-add").datetimepicker("value");
			var expDate = $("#iom-service-expDate-add").datetimepicker("value");
			if(effDate>=expDate || effDate>expDate){
				fish.info({title:'提示',message:"生效时间要大于当前时间 小于失效时间"});
				return;
			}
			map.EFF_DATE = effDate;
			map.EXP_DATE = expDate;  
			map.Comments = formValue["iom-service-remark-add"]; 
			var method = "addServiceWithOutProduct" ;
			if('1'==me.catalogId){
				map.PRO_ID = me.$('#iom-serviceProduct-add').data('uiPopedit').getValue().ID+"";
				if('' == map.EVT_ID || undefined == map.EVT_ID){
					fish.info({title:'提示',message:"请选择事件"});
					return;
				}
				method = "addServiceWithProduct" ;
			}
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
					//fish.info({title:'提示',message:opreateResoultMsg});
					fish.confirm(opreateResoultMsg+'是否添加规则信息').result.done(function() {
						me.serviceTabsBClick();
			        }).fail(function(){
			        	me.popup.close(ret);
			        });
					
				}
				me.serviceData = data;
			}).fail(function(e){
				console.log(e);
				fish.error(e);
			});
	        
		},
		loadServiceBelong : function(){
			$('#iom-serviceBelong-add').combobox();
			var me=this;
			var $combobox1 = $('#iom-serviceBelong-add').combobox({
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
		},
		/* 加载类型 */
		loadEventSort : function(){	
			$('#iom-eventSort-add').combobox();
			var me=this;
			utils.ajax('cloudIomServiceForWeb','qryEventSort').done(function(ret){
				var data = JSON.parse(ret);
				var $combobox1 = $('#iom-eventSort-add').combobox({
			        dataTextField: 'NAME',
			        dataValueField: 'ID',
			        dataSource: data
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
			});
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
		//根据目录id查询服务信息
		getSerApplyRuleDataBySerId: function(serviceId) { //请求服务器获取数据的方法
			var map = new Object();
			var rowNum = this.$("#iom-service-tabs-b-grid").grid("getGridParam", "rowNum");
			var page =   this.$("#iom-service-tabs-b-grid").grid("getGridParam", "page"); 
			map.serviceId = serviceId+"";
			map.pageIndex = (page-1)*10;
			map.pageSize = 10;
			$("#iom-service-tabs-b-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb','getServiceApplyRuleList',map).done(function(ret){
				ret = JSON.parse(ret);
				if(ret!=null){
					if(ret.length == 0){
						ret = "";
					} 
					$("#iom-service-tabs-b-grid").grid("reloadData", ret);
				}
			});
			$("#iom-service-tabs-b-grid").unblockUI().data('blockui-content', false);
		},
		applyRuleUpdate:function(){
			var me=this;
			var selections = this.$("#iom-service-tabs-b-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length == 1){
				var serviceId = me.serviceData.ID;
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
		}, 
		applyRuleDelete:function(){
			var me=this;
			var selections = this.$("#iom-service-tabs-b-grid").grid("getCheckRows");//返回所有被选中的行
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
		}
		
		
	});
});