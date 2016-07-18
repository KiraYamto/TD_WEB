define([
	'text!modules/iom/product/templates/eventAddView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/productManage.css'+codeVerP
], function(eventAddViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(eventAddViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		catalogId:null,
		events: {
			'click #iom-event-save-button':'eventAdd'
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			$("#iom-event-effDate-add").datetimepicker({
				startDate : fish.dateutil.format(fish.dateutil.addDays(new Date(),-1),"yyyy-mm-dd HH:ii:ss")
			});
			$("#iom-event-expDate-add").datetimepicker({
				startDate : fish.dateutil.format(fish.dateutil.addDays(new Date(),-1),"yyyy-mm-dd HH:ii:ss")
			});
			this.catalogId = this.options.catalogId; 
			this.loadEventType();
			this.loadEventSort();
		}, 
		productTabsAClick:function(){
			this.$('#iom-event-tabs-a').show();
			$(window).resize();
		}, 
		/* 新增 */
		eventAdd : function(){	
			var me=this;
			var result = $("#iom-event-form").isValid();
			if(false==result){
				return;
			}
	        console.log(result);
	        //获取表单信息
			var formValue = $('#iom-event-form').form("value");
			var map = new Object();
			map.NAME = formValue["iom-eventName-add"];
			map.CATALOG_ID = me.catalogId+"";
			map.CODE = formValue["iom-eventCode-add"]+"";
			var effDate = $("#iom-event-effDate-add").datetimepicker("value");
			var expDate = $("#iom-event-expDate-add").datetimepicker("value");
			if(effDate>=expDate || effDate>expDate){
				fish.info({title:'提示',message:"生效时间要大于当前时间 小于失效时间"});
				return;
			}
			map.EFF_DATE = effDate;
			map.EXP_DATE = expDate;
			return;
			map.TYPE_ID = formValue["iom-eventType-add"]+"";
			map.CRM_ID = formValue["iom-event-crmEventCode-add"]+""; 
			map.SortId = "1"; 
			map.Comments = formValue["iom-event-remark-add"]; 
			console.log(formValue);
			utils.ajax('cloudIomServiceForWeb','addEvent',map)
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
	        
		},
		/* 加载类型 */
		loadEventType : function(){	
			$('#iom-eventType-add').combobox();
			var me=this;
			utils.ajax('cloudIomServiceForWeb','qryEventType').done(function(ret){
				var data = JSON.parse(ret);
				var $combobox1 = $('#iom-eventType-add').combobox({
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
		}
		
		
	});
});