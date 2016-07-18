define([
	'text!modules/iom/product/templates/eventCatalogAddView.html',
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/eventManage.css'+codeVerP
], function(eventCatalogAddViewTpl, i18neventManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(eventCatalogAddViewTpl),
		i18nData: fish.extend({}, i18neventManage),
		title : 'adadad',
		selectedNode:null,
		pnode : null,
		currentNode : null,
		operateType : null,
		events: { 
			'click #iom-eventCatalog-save-button':'catalogSave'
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.selectedNode = this.options.selectedNode;
			this.pnodes = this.options.pnode;
			this.currentNode = this.options.currentNode;
			this.operateType = this.options.operateType;
			if('add' == this.operateType){
	        	if((null == this.pnodes)){
	        		$("#iom_event_popTitle").html('增加事件目录');
				}else{
					$("#iom_event_popTitle").html('增加事件子目录');
		        	$('#iom-eventParentCatalogtName').val(this.selectedNode.name);
				} 
	        }else if('update' == this.operateType){
	        	$("#iom_event_popTitle").html('修改事件目录');
	        	if(null != this.pnodes){
	        		$('#iom-eventParentCatalogtName').val(this.pnodes.name);
	        		$('#iom-eventCatalogName').val(this.currentNode.name);
	        		$('#iom-eventCatalogCode').val(this.currentNode.CODE);
	        	}
	        	if(null != this.currentNode){
	        		$('#iom-eventCatalogName').val(this.currentNode.name);
	        		$('#iom-eventCatalogName').val(this.currentNode.name);
	        		$('#iom-eventCatalogCode').val(this.currentNode.CODE);
	        	}
	        } 
		}, 
		     
		catalogSave : function(){	
			var me=this;
			var result = $("#iom-eventCatalog-form").isValid();
			if(false==result){
				return;
			}
	        console.log(result);
	        var method = "";
	        
	        //获取表单信息
			var formValue = $('#iom-eventCatalog-form').form("value");
			var map = new Object();
			map.NAME = formValue["iom-eventCatalogName"];
			map.CODE = formValue["iom-eventCatalogCode"];
			map.ID = me.selectedNode.id+"";
			if((null == this.pnodes)){
				map.PARENT_ID = null;
			}else{
				map.PARENT_ID = me.pnodes.id+"";
			} 
			console.log(formValue); 
			if('add' == this.operateType){
	        	method = "addEventCatalog";
	        }else if('update' == this.operateType){
	        	method = "updateEventCatalog";
	        	map.ID = me.selectedNode.id+"";
	        }
			utils.ajax('cloudIomServiceForWeb',method,map)
			.done(function(ret){
				var ret = JSON.parse(ret);
				var opreateResoult = ret.opreateResoult;
				var opreateResoultMsg = ret.opreateResoultMsg;
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