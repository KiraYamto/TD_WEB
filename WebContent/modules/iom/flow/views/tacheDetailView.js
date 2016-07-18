define([
	'text!modules/iom/flow/templates/tacheDetailView.html'+codeVerP,
	'i18n!modules/iom/flow/i18n/flowDefManager.i18n',
	'modules/common/cloud-utils',
	'css!modules/iom/flow/styles/flowDefManager.css'+codeVerP
], function(tacheDetailViewTpl, i18nflowManage,utils,css) {
	return fish.View.extend({
		order_task_grid_last_select_id:-1,
		template: fish.compile(tacheDetailViewTpl),
		i18nData: fish.extend({}, i18nflowManage),
		tacheData:null,
		events: {
			"click #iom-flow-tabs-a-link": "flowTabsAClick",
			"click #iom-flow-tabs-b-link": "flowTabsBClick",
			'click #iom-flowTache-addReason-btn':'addReason',
			'click #iom-flow-tabs-f-link':'flowTabsFClick',
			'click #iom-flow-save-button':'flowAdd',
			'click #iom-flowTache-delReason-btn':'deleteReason',
			'click #iom-flowTache-buttonSelAdd-btn':'buttonSel'
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			var html=$(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.tacheData = this.options.tacheData;
			this.loadflowAgridRender(); 	
			$("#iom-flow-tabs").tabs();
			this.$('#iom-flow-tabs-a').show();
			this.$('#iom-flow-tabs-b').hide();  
		}, 
		flowTabsAClick:function(){
			this.$('#iom-flow-tabs-a').show();
			this.$('#iom-flow-tabs-b').hide(); 
			this.$('#iom-flow-tabs-a').addClass('ui-tabs-active');
			this.$('#iom-flow-tabs-b').removeClass('ui-tabs-active'); 
			//$(window).resize();
		},
		flowTabsBClick:function(){
			this.loadflowBgridRender(); 	 
			this.$('#iom-flow-tabs-b').show();
			this.$('#iom-flow-tabs-a').hide();
			this.$('#iom-flow-tabs-b').addClass('ui-tabs-active');
			this.$('#iom-flow-tabs-a').removeClass('ui-tabs-active');
			//$(window).resize();
		}, 
		getFlowTacheReturnResonList: function(tacheId) { //请求服务器获取数据的方法
			var me=this;
			var map = new Object();
			var rowNum = this.$("#iom-flow-tabs-a-grid").grid("getGridParam", "rowNum");
			var page = this.$("#iom-flow-tabs-a-grid").grid("getGridParam", "page"); 
			map.tacheId = me.tacheData.id+"";
			map.pageIndex = (page-1);
			map.pageSize = 10;
			$("#iom-flow-tabs-a-grid").blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax('cloudIomServiceForWeb','getFlowTacheReturnReasonList',map).done(function(ret){
				ret = JSON.parse(ret);
				if(ret!=null){
					if(ret.length == 0){
						ret = "";
					} 
					if(ret.total > 0){
						 
					}
					$("#iom-flow-tabs-a-grid").grid("reloadData", ret);
				}
			}).fail(function(ret){
    			fish.error({title:'错误',message:'环节异常原因查询异常'});
    		});
			$("#iom-flow-tabs-a-grid").unblockUI().data('blockui-content', false);
		},
		loadflowAgridRender: function() {
			var dcGridPerData = $.proxy(this.getFlowTacheReturnResonList,this); //函数作用域改变
			this.$("#iom-flow-tabs-a-grid").grid({
				datatype: "json",
				height: 200, 
				colModel: [{
					name: 'RETURN_REASON_NAME',
					label: '异常原因名称',
					width: 100
				},{
					name: 'REASON_TYPE_NAME',
					label: '异常原因类别',
					width: 100
				},{
					name: 'RETURN_REASON_ID',
					label: 'RETURN_REASON_ID',
					width: 100,
					hidden : true
				}],
				rowNum: 10, 
				datatype: "json",
				pager: true,
				server: true,
				shrinkToFit:true,
				multiselect:true, 
				pageData: dcGridPerData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
			dcGridPerData();
		},  
		
		loadflowBgridRender: function() {
			//var dcGridPerData = $.proxy(this.getflowCharacterListByflowId,this); //函数作用域改变
			this.$("#iom-flow-tabs-b-grid").grid({
				datatype: "json",
				height: 200, 
				colModel: [{
					name: 'NAME',
					label: '显示名称',
					width: 300
				}, {
					name: 'CODE',
					width: 300,
					label: '路径'
				}, {
					name: 'DEFAULT_VALUE',
					label: '功能名称',
					width: 300
				}],
				rowNum: 10, 
				datatype: "json",
				pager: true,
				server: true,
				shrinkToFit:true,
				multiselect:true, 
				pageData: null //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
			});
			//dcGridPerData();
		},
		addReason:function(){
			var me=this; 
			var pop =fish.popupView({
				url: 'modules/iom/flow/views/tacheReturnReasonSelectView',
				width: "30%",
				viewOption : {
					'tacheId':me.tacheData.id
				},
				callback:function(popup,view){
					popup.result.then(function (e) {
						me.getFlowTacheReturnResonList(me.tacheData.id);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		deleteReason:function(){
			var me=this;
			var reasonIds = [];
			var map = new Object();
			var selections = this.$("#iom-flow-tabs-a-grid").grid("getCheckRows");//返回所有被选中的行
			if(selections.length > 0){
				var length=selections.length; 
				for(var i=0;i<length;i++){
					reasonIds[i] = selections[i].RETURN_REASON_ID;
				}
				map.reasonIds = reasonIds;
				fish.confirm('确认删除？').result.done(function() {
					utils.ajax('cloudIomServiceForWeb','delReason',map).done(function(ret){
						me.getFlowTacheReturnResonList(me.tacheData.id);
					});
		        }).fail(function(){
		        	fish.error({title:'错误',message:'删除失败'});
		        });
				
			}else{
				fish.info({title:'提示',message:'请勾选一条记录！'});
			}
		},
		buttonSel:function(){
			var me=this; 
			var pop =fish.popupView({
				url: 'modules/iom/flow/views/tacheButtonSelView',
				width: "60%",
				height: "100%",
				viewOption : {
					'tacheId':me.tacheData.id
				},
				callback:function(popup,view){
					popup.result.then(function (e) {
						me.getFlowTacheReturnResonList(me.tacheData.id);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		}
	});
});