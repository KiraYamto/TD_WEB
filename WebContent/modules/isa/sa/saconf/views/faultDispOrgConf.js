define([
	'text!modules/isa/sa/saconf/templates/faultDispOrgConf.html',
	'i18n!modules/isa/sa/saconf/i18n/faultDispOrgConf.i18n',
	'modules/common/cloud-utils',
	'css!modules/isa/sa/saconf/styles/saconfmanagement.css'
], function(faultDispOrgConfViewTpl, i18nSa,utils,css) {
	return fish.View.extend({
		rowMap:{},
		template: fish.compile(faultDispOrgConfViewTpl),
		i18nData: fish.extend({}, i18nSa),
		events: {
			'click #insert': 'addDispOrgConf',
			'click #delete': 'deleteDispOrgConf'
		},

		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},
		


		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.rowMap.orgId = currentJob.orgId
			this.loadOrgData();
			this.loadMyDispOrgConfRender();
			this.getMyDispOrgConfData(currentJob.orgId);
		},
		
		/* 加载组织信息 */
		loadOrgData : function(){
			var me = this;
			$("#divLeft-panel").height($(window).height()*0.85);
			$("#divRight-panel").height($(window).height()*0.85);
			var map = new Object();
			map.actionStr = "queryOrganizationById";
			map.orgId = currentJob.orgId+"";//选择本组织及下属组织
			utils.ajax('isaDutyService','queryOrganizationById',map).done(function(ret){
				var options = {
						fNodes : JSON.parse(ret),
						data : {key: {children: "children", name: "orgName"}},
						callback: {
							onClick: function(e,treeNode, clickFlag) {
								me.rowMap.orgId = treeNode.orgId;
								me.getMyDispOrgConfData(me.rowMap.orgId);
							}
						}
				};
				$('#orgTree').tree(options);
			});
		},
		
		//转派目标列表
		loadMyDispOrgConfRender: function() {
			this.$("#dispOrgGrid").grid({
				datatype: "json",
				height: $(window).height()*0.8,
				colModel: [{
					name: 'dispName',
					label: '可转派部门',
					width: 1000
				},{
				name: 'performerId',
				label: '转派目标ID',
				key:true,
				width: 100,
				hidden:true
			}],
			    multiselect: true,
		        gridview:false,
				server: true,
				onSelectRow:$.proxy(function(rowid,id,state){
					 if (state==true){
			                $("#dispOrgGrid").jqGrid("resetSelection");
			                $("#dispOrgGrid").jqGrid("setSelection",rowid,false);
			            }
			            else{
			            	$("#dispOrgGrid").jqGrid("resetSelection");
			            }
				},this)
			});
		},
		
		//根据组织id查询转派目标
		getMyDispOrgConfData: function(curOrgId) { //请求服务器获取数据的方法
			var map = new Object();
			map.actionStr = "queryDispPartyConfig";
			map.orgId = curOrgId+"";
			utils.ajax('isaDispPartyConfigService','queryDispPartyConfig',map).done(function(ret){
				if(ret!=null){
					var result = {
							"rows": ret
					};
					$("#dispOrgGrid").grid("reloadData", result);
				}
			});
		},
		
		//新增转派目标配置
		addDispOrgConf:function(){
			var me=this;
			var pop =fish.popupView({url: 'modules/isa/sa/saconf/views/addDispOrgConf',
				width: "50%",height:"60%",
				viewOption:{
					org : me.rowMap.orgId,
				},
				callback:function(popup,view){
					popup.result.then(function (e) {
						fish.info('成功');
						me.getMyDispOrgConfData(me.rowMap.orgId);
						},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		
		//删除转派目标配置
		deleteDispOrgConf:function(){	
			var getRowDataTemp = this.$("#dispOrgGrid").grid("getCheckRows");//返回所有被选中的行
			if(null == getRowDataTemp||getRowDataTemp.length==0){
				fish.warn('请选择行！');
				return;
			}
			var map = new Object();
			if(getRowDataTemp!=null&&getRowDataTemp.length>0){
				map.performerId = getRowDataTemp[0].performerId+"";
				for(var i=1;i<getRowDataTemp.length;i++){
					map.performerId+=","+getRowDataTemp[i].performerId
				}
			}
			var me =this;
			fish.confirm('你确定要删除吗？').result.then(function() {
	            utils.ajax('isaDispPartyConfigService', 'deleteDispPartyConfig', map).done(function(ret){
	            	if(ret){
	            		if(ret == "SUCCESS"){
	            			me.getMyDispOrgConfData(me.rowMap.orgId);
	            			fish.success('删除成功');
	            		}else{
	            			fish.error('删除失败');
	            		}
	            	}else{
	        			fish.info('消息未返回');
	        		}
	            });
            });
		},	
	});	
});