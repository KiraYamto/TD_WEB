define([
	'text!modules/iom/flow/templates/tacheReturnReasonSelectView.html'+codeVerP,
	'i18n!modules/iom/flow/i18n/tacheManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/flow/styles/tacheManage.css'+codeVerP
], function(flowtacheReturnReasonSelectViewTpl, i18nflowTacheManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(flowtacheReturnReasonSelectViewTpl),
		i18nData: fish.extend({}, i18nflowTacheManage),
		catalogId:null,
		tacheId:null,
		gridData :[],
		events: {
			'click #iom-flowtachereasonSel-save-button':'reasonDataSave',
			'click #iom-flowTache-detail-btn': 'openTacheDetails'
			
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() { 
			this.tacheId = this.options.tacheId; 
			this.getFlowTacheCatalogList();
			this.loadGridRender();
			this.loadAuditFlagComb();
		},
		//根据目录id查询环节信息
		getFlowTacheCatalogList: function() { //请求服务器获取数据的方法
			var me=this; 
			$("#iom-flowTacheReason-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb','qryReasonCatalog').done(function(ret){
				ret = JSON.parse(ret);
				if(ret!=null){
					if(ret.length == 0){
						ret = "";
					} 
					if(ret.length > 0){
						for(var i = 0 ;i<ret.length;i++){ 
							ret[i].children = [];
						}
					}
					me.gridData = ret;
					$("#iom-flowTacheReason-grid").grid("reloadData", ret);
					if(ret.length > 0){
						var getRowData = $("#iom-flowTacheReason-grid").grid("getRowData", ret[0].ID,true);
						$("#iom-flowTacheReason-grid").grid("expandNode", getRowData,true);
					}
				}
			}).fail(function(ret){
    			fish.error({title:'错误',message:'环节异常原因查询异常'});
    		});
			$("#iom-flowTacheReason-grid").unblockUI().data('blockui-content', false);
		},
		loadGridRender: function() {
			var me=this;
			this.$("#iom-flowTacheReason-grid").grid({
				datatype: "json",
				height: $(window).height()*0.5,
				colModel: [{
					name: 'REASON_CATALOG_NAME',
					label: '异常原因名称',
					width: 220
				},{
					name: 'REASON_TYPE_NAME',
					width: 120,
					label: '异常原因类别'
				},{
					name: 'ID',
					label: 'ID',
					width: 100,
					key:true,
					hidden:true
				}],
				rowNum: 10,  
				shrinkToFit:false,
				multiselect:true,
				datatype: "local",
				data: null,
				expandColumn:"REASON_CATALOG_NAME",
				treeGrid:true,
				treeIcons: {
	                plus: 'glyphicon glyphicon-triangle-right',
	                minus: 'glyphicon glyphicon-triangle-bottom',
	                leaf: '',
	                folderClosed: '', //支持全局配置,展开列的close状态的节点图标，默认为空
	                folderOpen: '' //支持全局配置,展开列的open状态的节点图标，默认为空
	            },  
	            onSelectRow:function(e, rowid, state, checked){ 
					var rowData =  $("#iom-flowTacheReason-grid").grid("getRowData", rowid,true);;
					var children =  me.$("#iom-flowTacheReason-grid").grid("getNodeChildren", rowData);
					var selarrrow = [];
					for(var i =0 ;i<children.length ;i++){
						selarrrow[i]=children[i].ID;
					}
					$("#iom-flowTacheReason-grid").grid("setCheckRows",selarrrow,true,true);
				},
				onRowExpand:function(e, rowData){//展开父节点rowData
			        console.log(rowData);
			        $("#iom-flowTacheReason-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			        var children = $("#iom-flowTacheReason-grid").grid("getNodeChildren", rowData);
			        var map = new Object();
			        map.catalogId=rowData.ID+"";
			        if(children.length==0){
				        utils.ajax('cloudIomServiceForWeb','qryReason',map).done(function(ret){
							ret = JSON.parse(ret);
							if(ret!=null){
								if(ret.length == 0){
									ret = [];
								}
								if(ret.length > 0){
									for(var i = 0 ;i<ret.length;i++){
										ret[i].ID=ret[i].id;
										ret[i].REASON_CATALOG_NAME=ret[i].RETURN_REASON_NAME;
										ret[i].tacheName=ret[i].REASON_TYPE_NAME;
									}
									$("#iom-flowTacheReason-grid").grid('addChildNodes', ret, rowData);
								}
							}
						}).fail(function(ret){
			    			fish.error({title:'错误',message:'异常原因查询异常'});
			    		});
				        
			        }
			        $("#iom-flowTacheReason-grid").unblockUI().data('iom-flowTacheReason-grid', false);
			    },
			    onRowCollapse:function(e, rowData){
			        console.log(rowData);
			    }
			});
		},
		loadAuditFlagComb : function(){
			$('#iom-flow-reason-auditFlag-add').combobox();
			var me=this;
			var $combobox1 = $('#iom-flow-reason-auditFlag-add').combobox({
		        dataTextField: 'name',
		        dataValueField: 'value',
		        dataSource: [{"name":"是","value":"1"},{"name":"否","value":"0"}]
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
		reasonDataSave : function(){	
			var me=this;
			var reasonIds = [];
			var result = $("#iom-flowtachereasonSel-form").isValid();
			if(false==result){
				return;
			}
	        console.log(result);
	        //获取表单信息
			var formValue = $('#iom-flowtachereasonSel-form').form("value");
			var selections = me.$("#iom-flowTacheReason-grid").grid("getCheckRows");//返回所有被选中的行
			var n = 0;
			for(var i = 0 ;i<selections.length;i++){
				var rowData = selections[i];
				if(rowData.isLeaf){
					//选择的是叶子节点
					reasonIds[n] = rowData.ID;
					n++;
				}else{
					var children =  me.$("#iom-flowTacheReason-grid").grid("getNodeChildren", rowData);
					for(var j = 0 ;j<children.length;j++){
						reasonIds[n] = children[n].ID;
						n++;
					}
				}
				
			}
			if(reasonIds.length==0){
				fish.info({title:'提示',message:'请选择异常原因'});
				return;
			}
			
			var map = new Object();
			map.tacheId = me.tacheId+"";
			map.reasonIds = reasonIds;
			map.autitFlag = formValue["iom-flow-reason-auditFlag-add"]+"";;
			console.log(formValue);
			console.log(map);
			utils.ajax('cloudIomServiceForWeb','addReason',map)
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