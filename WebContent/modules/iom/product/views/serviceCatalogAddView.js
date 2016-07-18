define([
	'text!modules/iom/product/templates/serviceCatalogAddView.html',
	'i18n!modules/iom/product/i18n/productManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/product/styles/serviceManage.css'+codeVerP
], function(serviceCatalogAddViewTpl, i18nserviceManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(serviceCatalogAddViewTpl),
		i18nData: fish.extend({}, i18nserviceManage),
		title : 'adadad',
		selectedNode:null,
		pnode : null,
		currentNode : null,
		operateType : null,
		events: { 
			'click #iom-serviceCatalog-save-button':'catalogSave'
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
	        		$("#iom_service_popTitle").html('增加服务目录');
				}else{
					$("#iom_service_popTitle").html('增加服务子目录');
		        	$('#iom-serviceParentCatalogtName').val(this.selectedNode.name);
				} 
	        }else if('update' == this.operateType){
	        	$("#iom_service_popTitle").html('修改服务目录');
	        	if(null != this.pnodes){
	        		$('#iom-serviceParentCatalogtName').val(this.pnodes.name);
	        		$('#iom-serviceCatalogName').val(this.currentNode.name);
	        	}
	        	if(null != this.currentNode){
	        		$('#iom-serviceCatalogName').val(this.currentNode.name);
	        		$('#iom-serviceCatalogName').val(this.currentNode.name);
	        	}
	        } 
		}, 
		     
		catalogSave : function(){	
			var me=this;
			var result = $("#iom-serviceCatalog-form").isValid();
			if(false==result){
				return;
			}
	        console.log(result);
	        var method = "";
	        
	        //获取表单信息
			var formValue = $('#iom-serviceCatalog-form').form("value");
			var map = new Object();
			map.NAME = formValue["iom-serviceCatalogName"];
			map.ID = me.selectedNode.id+"";
			if((null == this.pnodes)){
				map.PARENT_ID = null;
			}else{
				map.PARENT_ID = me.pnodes.id+"";
			} 
			console.log(formValue); 
			if('add' == this.operateType){
	        	method = "addServiceCatalog";
	        }else if('update' == this.operateType){
	        	method = "updateServiceCatalog";
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