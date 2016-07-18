define([
	'text!modules/iom/flow/templates/tacheAddView.html'+codeVerP,
	'i18n!modules/iom/flow/i18n/tacheManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/flow/styles/tacheManage.css'+codeVerP
], function(tacheAddViewViewTpl, i18ntacheAddView,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(tacheAddViewViewTpl),
		i18nData: fish.extend({}, i18ntacheAddView),
		events: {
			'click #iom-flowTacheAdd-save-button':'saveData'
			
		},
		initialize : function(){
			this.catalogId = this.options.catalogId; 
			this.selectRowData = this.options.selectRowData;
			this.parentRowData = this.options.parentRowData;
			this.operateType = this.options.operateType;
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() { 
			var $spinner1 = $('#iom-flowTacheEdition-add1').spinner({
				  min:0,
		          page:10 //默认步长是1,可以由键盘上下键控制;这里的page支持键盘pgup与pgdn键,每次步长10
		      });
			var $spinner2 = $('#iom-flowTacheEdition-add2').spinner({
				  min:0,
		          page:10 //默认步长是1,可以由键盘上下键控制;这里的page支持键盘pgup与pgdn键,每次步长10
		      });
			$("#iom-flowTacheEffDate-add").datetimepicker({});
			$("#iom-flowTacheExpDate-add").datetimepicker({}); 
			if("add" == this.operateType){
				$('#flowTacheAddTitle').html("增加环节版本");
			}else if("update" == this.operateType){
				$('#flowTacheAddTitle').html("修改环节版本");
				var vesion = this.selectRowData.tacheName;
				var vesion = vesion.replace("V","");
				vesion = vesion.split(".");
				$('#iom-flowTacheEdition-add1').val(vesion[0]);
				$('#iom-flowTacheEdition-add2').val(vesion[1]);
				$("#iom-flowTacheEffDate-add").datetimepicker("value",this.selectRowData.effDate);
				$("#iom-flowTacheExpDate-add").datetimepicker("value",this.selectRowData.expDate); 
			}else if("saveAs" == this.operateType){
				$('#flowTacheAddTitle').html("另存环节版本");
				var vesion = this.selectRowData.tacheName;
				var vesion = vesion.replace("V","");
				vesion = vesion.split(".");
				$('#iom-flowTacheEdition-add1').val(vesion[0]); 
				$('#iom-flowTacheEdition-add2').val((parseInt(vesion[1])+1));
				$("#iom-flowTacheEffDate-add").datetimepicker("value",this.selectRowData.effDate);
				$("#iom-flowTacheExpDate-add").datetimepicker("value",this.selectRowData.expDate); 
			}
			
		},  
		saveData : function(){	
			var me=this;
			var result = $("#iom-flowTacheAdd-form").isValid();
			if(false==result){
				return;
			}
	        console.log(result);
	        //获取表单信息
			var formValue = $('#iom-event-form').form("value");
			var map = new Object();
			var edition1 = $("#iom-flowTacheEdition-add1").spinner("value"); 
			var edition2 = $("#iom-flowTacheEdition-add2").spinner("value"); 
			map.effDate = $("#iom-flowTacheEffDate-add").datetimepicker("value");
			map.expDate = $("#iom-flowTacheExpDate-add").datetimepicker("value");
			map.edition = "V"+edition1+"."+edition2;
			console.log(formValue);
			console.log(map);
			var method  = "";
			if("add" == me.operateType){
				method  = "addFlowTacheEdition";
				map.tacheId = me.selectRowData.id+"";
				map.tacheName = me.selectRowData.tacheName+"";
				map.tacheCode = me.selectRowData.tacheCode+"";
			}else if("saveAs" == me.operateType ){
				method  = "addFlowTacheEdition";
				map.tacheId = me.parentRowData.id+"";
				map.tacheName = me.parentRowData.tacheName+"";
				map.tacheCode = me.parentRowData.tacheCode+"";
			}else if("update" == me.operateType ){
				method  = "updateFlowTacheEdition";
				map.id = me.selectRowData.id+"";
				map.tacheId = me.selectRowData.id+"";
				map.tacheName = me.selectRowData.tacheName+"";
				map.tacheCode = me.selectRowData.tacheCode+"";
			}
			utils.ajax('cloudIomServiceForWeb',method,map)
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