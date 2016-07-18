define([
	'text!modules/iom/flow/templates/tacheTestView.html'+codeVerP,
	'i18n!modules/iom/flow/i18n/tacheManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/flow/styles/tacheManage.css'+codeVerP
], function(tacheTestViewViewTpl, i18ntacheTestView,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(tacheTestViewViewTpl),
		i18nData: fish.extend({}, i18ntacheTestView),
		catalogId:null,
		tacheData:null,
		events: {
			'click #iom-flowTacheAdd-save-button':'saveData',
			'click #iom-testBssOrderInfo-trans-button':'transData'
			
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			 
		},  
		//转换报文
		transData : function(){	
			var me=this;
			var result = $("#iom-flowTestTransData-form").isValid();
			if(false==result){
				return;
			}
	        console.log(result);
	        //获取表单信息
			var formValue = $('#iom-flowTestTransData-form').form("value");
			var map = new Object();
			map.bssOrderInfo = formValue["iom-bssOrderInfo"];   
			console.log(formValue);
			console.log(map);
			utils.ajax('cloudIomServiceForWeb','transBssData',map)
			.done(function(ret){
				var data = JSON.parse(ret);
				var opreateResoult = data.opreateResoult;
				var opreateResoultMsg = data.opreateResoultMsg;
				if(false == opreateResoult){
					fish.info({title:'提示',message: opreateResoultMsg});
					return;
				}else{
					fish.info({title:'提示',message: opreateResoultMsg});
					var rukuJson = JSON.stringify(data.rukuJson);
					$('#iom-dataInfo').val(rukuJson); 
					//me.popup.close(ret);
				}
			}).fail(function(e){
				console.log(e);
				fish.error(e);
			});
	        
		},  
		saveData : function(){	
			var me=this;
			var result = $("#iom-flowTestSaveData-form").isValid();
			if(false==result){
				return;
			}
	        console.log(result);
	        //获取表单信息
			var formValue = $('#iom-flowTestSaveData-form').form("value");
			var map = new Object();
			map.orderInfo = formValue["iom-dataInfo"];   
			console.log(formValue);
			console.log(map);
			utils.ajax('cloudIomServiceForWeb','orderTest',map)
			.done(function(ret){
				var data = JSON.parse(ret);
				var opreateResoult = data.opreateResoult;
				var opreateResoultMsg = data.opreateResoultMsg;
				if(false == opreateResoult){
					fish.info({title:'提示',message: opreateResoultMsg});
					return;
				}else{
					fish.info({title:'提示',message: opreateResoultMsg});
					
					//me.popup.close(ret);
				}
			}).fail(function(e){
				console.log(e);
				fish.error(e);
			});
	        
		}
		 
		
		
	});
});