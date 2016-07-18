define([
	'text!modules/iom/product/templates/eventUpdateView.html'+codeVerP,
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/productManage.css'+codeVerP
], function(eventUpdateViewTpl, i18nproductManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(eventUpdateViewTpl),
		i18nData: fish.extend({}, i18nproductManage),
		eventData:null,
		events: {
			'click #iom-event--update-save-button':'eventUpdate'
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			$("#iom-event-effDate-update").datetimepicker({});
			$("#iom-event-expDate-update").datetimepicker({});
			this.eventData = this.options.eventData; 
			this.loadEventType();
			this.loadEventSort();
			this.loadDetailInfo();	
		},
		loadDetailInfo : function(){	
			var me=this;
			var data = me.eventData;
			var typeId = data.TYPE_ID;
			$('#iom-eventName-update').val(data.NAME);
			$('#iom-eventCode-update').val(data.CODE);
			$("#iom-event-effDate-update").datetimepicker("value", data.EFF_DATE);
			$("#iom-event-expDate-update").datetimepicker("value", data.EXP_DATE);
			$('#iom-eventType-update').val(data.TYPE_ID);
			$('#iom-eventSort-update').val(data.SORT_ID);
			$('#iom-event-crmEventCode-update').val(data.CRM_ID); 
			$('#iom-event-remark-update').val(data.COMMENTS); 
			$('#iom-eventType-update').combobox({
		        dataTextField: 'NAME',
		        dataValueField: 'ID',
		        dataSource: [{"NAME":data.TYPE_NAME,"ID":data.TYPE_ID}]
		    });
			$('#iom-eventSort-update').combobox({
		        dataTextField: 'NAME',
		        dataValueField: 'ID',
		        dataSource: [{"NAME":data.SORT_NAME,"ID":data.SORT_ID}]
		    }); 
		},
		/*修改 */
		eventUpdate : function(){	
			var me=this;
			var result = $("#iom-event-form").isValid();
			if(false==result){
				return;
			}
	        console.log(result);
	        //获取表单信息
			var formValue = $('#iom-event-form').form("value");
			var map = new Object();
			map.NAME = formValue["iom-eventName-update"];
			map.ID = me.eventData.ID+"";
			map.CATALOG_ID = me.eventData.CATALOG_ID+"";
			map.CODE = formValue["iom-eventCode-update"];
			
			var effDate = $("#iom-event-effDate-update").datetimepicker("value");
			var expDate = $("#iom-event-expDate-update").datetimepicker("value");
			if(effDate>=expDate || effDate>expDate){
				fish.info({title:'提示',message:"生效时间要大于当前时间 小于失效时间"});
				return;
			}
			map.EFF_DATE = effDate;
			map.EXP_DATE = expDate; 
			map.TYPE_ID = formValue["iom-eventType-update"]+"";
			map.CRM_ID = formValue["iom-event-crmEventCode-update"]+""; 
			map.SortId = "1"; 
			map.Comments = formValue["iom-event-remark-update"]; 
			console.log(formValue);
			utils.ajax('cloudIomServiceForWeb','updateEvent',map)
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
			$('#iom-eventType-update').combobox();
			var me=this;
			utils.ajax('cloudIomServiceForWeb','qryEventType').done(function(ret){
				var data = JSON.parse(ret);
				var $combobox1 = $('#iom-eventType-update').combobox({
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
			$('#iom-eventSort-update').combobox();
			var me=this;
			utils.ajax('cloudIomServiceForWeb','qryEventSort').done(function(ret){
				var data = JSON.parse(ret);
				var $combobox1 = $('#iom-eventSort-update').combobox({
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