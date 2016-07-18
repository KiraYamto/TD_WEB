define([
	'text!modules/isa/tache/templates/tacheManage.html',
	'i18n!modules/isa/tache/i18n/tacheManage.i18n',
	'modules/common/cloud-utils',
	'css!modules/isa/tache/styles/tachemanagement.css'
], function(tacheManageViewTpl, i18nTache,utils,css) {
	var init=new Object();
	init.cataLogId="";
	init.tabNum=-1;
	init.tacheId=-1;
	//var currentJob= currentJob;
	var currentUser = currentUser;
	return fish.View.extend({
		template: fish.compile(tacheManageViewTpl),
		i18nData: fish.extend({}, i18nTache),
		events: {
			"click #tache-tabs-function-link": "operationTabsPendingClick1",
			"click #tache-tabs-executor-link": "operationTabsPendingClick2",
			"click #tache-tabs-copyTo-link": "operationTabsPendingClick3",
			"click #isa-tacheAddbtn": "tacheAddbtnFunc",
			"click #isa-tacheModbtn": "tacheModbtnFunc",
			"click #isa-tacheDelbtn": "tacheDelbtnFunc",
			"click #isa-tacheMainHande": "tacheMainHandleFunc",
			"click #org-search-btn": "qryTacheName",
			"click #isa-tacheCataModbtn": "tacheCataModbtn",
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
		
			return this;
		},
		


		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.loadTacheCatalogData();
			this.loadMyTacheConfRender();
			this.loadMyTacheFunctionConfRender();
			this.loadMyExeAreaConfRender();
			this.loadMyCcAreaConfRender();
			this.operationTabsPendingClick1();
			this.getTacheData();
			this.tacheFunctionConf();
			this.exeAreaLoadData();
			this.ccAreaLoadData();
		},
		
		/* 加载环节目录信息 */
		loadTacheCatalogData : function(){
			var map = new Object();
			map.actionStr = "queryTacheCatalog";
			var getTacheData=$.proxy(this.getTacheData,this);
			utils.ajax('isaOaTacheService','queryTacheCatalog',map).done(function(ret){
				ret=JSON.parse(ret);
				var obj=ret.QUERY_RESULT;
				var options = {
						fNodes : JSON.parse(obj),
						data : {key: {children: "children", name: "text"}},
						callback: {
							onClick: function(e,treeNode, clickFlag) {
								init.tacheCatalog=treeNode.id;
								//$.proxy(getTacheData,this);
								getTacheData();
							}
						}
				};
				$('#tacheTree').tree(options);
			});
			utils.ajax('isaMainLoginService','qryRouteList',map).done(function(ret){
				var obj=ret.rows;
			});
			
		},
		
		//环节列表
		loadMyTacheConfRender: function() {
			this.$("#tacheGrid").grid({
				datatype: "json",
				height: 200,
				colModel: [{
					name: 'tacheName',
					label: '环节名称',
					width: 200
				},{
					name: 'tacheTypeName',
					label: '环节类型名称',
					width: 200
				},{
					name: 'tacheCode',
					label: '环节编码',
					width: 200
				},{
					name: 'stateName',
					label: '环节状态',
					width: 200
				},{
					name: 'effDate',
					label: '生效时间',
					width: 200
				},{
					name: 'expDate',
					label: '失效时间',
					width: 200
				},{
				name: 'id',
				label: '环节ID',
				key:true,
				width: 100,
				hidden:true
			}],
				onSelectRow:$.proxy(function(rowid,id,state){
					var getRowDataTemp = this.$("#tacheGrid").grid("getSelection");//返回所有被选中的行
					init.tacheId=getRowDataTemp.id;
					var tacheFunctionConf=$.proxy(this.tacheFunctionConf,this);
					tacheFunctionConf();
					var exeAreaLoadData=$.proxy(this.exeAreaLoadData,this);
					exeAreaLoadData();
					var ccAreaLoadData=$.proxy(this.ccAreaLoadData,this);
					ccAreaLoadData();
				},this),
		        gridview:false,
				server: true
			});
		},
		
		getTacheData: function(){
			var map = new Object();
			map.actionStr = "getTacheData";
			map.tacheCatalog=init.tacheCatalog;
			map.tacheName= document.getElementById("tacheName").value;
			utils.ajax('isaOaTacheService','qryTathesByCatalog',map).done(function(ret){
				var result = {
						"rows": ret.rows,
						"total": ret.total
				};
				$("#tacheGrid").grid("reloadData", result);
			});
		},
		//环节适用功能列表
		loadMyTacheFunctionConfRender: function() {
			this.$("#tacheFunctionGrid").grid({
				datatype: "json",
				height: 176,
				colModel: [{
					name: 'displayName',
					label: '显示名称',
					width: 200
				},{
					name: 'pathName',
					label: '路径',
					width: 200
				},{
					name: 'name',
					label: '功能名称',
					width: 200
				},{
					name: 'displayIndex',
					label: '显示顺序',
					width: 200
				},{
					name: 'objSql',
					label: 'SQL组件',
					width: 200
				},{
					name: 'workOrderStateName',
					label: '工单状态',
					width: 200
				},{
					name: 'partyRoleName',
					label: '工单执行人角色',
					width: 200
				},{
				name: 'tacheId',
				label: '环节ID',
				width: 100,
				hidden:true
			}],
		        gridview:false,
				server: true
			});
		},
		tacheFunctionConf:function(){
			var map = new Object();
			map.actionStr = "getTacheData";
			map.tacheId=init.tacheId;
			utils.ajax('isaOaTacheService','qryButtonByTache',map).done(function(ret){
				var result = {
						"rows": ret.rows
				};
				$("#tacheFunctionGrid").grid("reloadData", result);
			});
		},
		//执行人范围列表
		loadMyExeAreaConfRender: function() {
			this.$("#tacheExecutorGrid").grid({
				datatype: "json",
				height: 176,
				colModel: [{
					name: 'partyType',
					label: '执行人类型',
					width: 200
				},{
					name: 'partyName',
					label: '执行人名称',
					width: 200
				},{
					name: 'partyOrgName',
					label: '执行人部门名称',
					width: 200
				},{
					name: 'partyRole',
					label: '执行人角色',
					width: 200
				},{
				name: 'tacheId',
				label: '环节ID',
				width: 100,
				hidden:true
				},{
				name: 'partyScopeId',
				label: 'partyScopeId',
				key:true,
				width: 100,
				hidden:true
			}],
			    /*multiselect: true,*/
		        gridview:false,
				server: true
			});
		},
		exeAreaLoadData:function(){
			var map = new Object();
			map.actionStr = "exeAreaLoadData";
			map.tacheId=init.tacheId;
			utils.ajax('isaOaTacheService','qryScopeByTache',map).done(function(ret){
				var result = {
						"rows": ret.rows
				};
				$("#tacheExecutorGrid").grid("reloadData", result);
			});
		},
		//抄送人范围列表
		loadMyCcAreaConfRender: function() {
			this.$("#tacheCopyGrid").grid({
				datatype: "json",
				height: 176,
				colModel: [{
					name: 'partyType',
					label: '抄送人类型',
					width: 200
				},{
					name: 'partyName',
					label: '抄送人名称',
					width: 200
				},{
					name: 'partyOrgName',
					label: '抄送人部门名称',
					width: 200
				},{
				name: 'tacheId',
				label: '环节ID',
				width: 100,
				hidden:true
				},{
				name: 'tacheCopyPartyId',
				label: 'tacheCopyPartyId',
				key:true,
				width: 100,
				hidden:true
			}],
			    /*multiselect: true,*/
		        gridview:false,
				server: true
			});
		},
		
		ccAreaLoadData:function(){
			var map = new Object();
			map.actionStr = "ccAreaLoadData";
			map.tacheId=init.tacheId;
			utils.ajax('isaOaTacheService','qryPartyByTache',map).done(function(ret){
				var result = {
						"rows": ret.rows
				};
				$("#tacheCopyGrid").grid("reloadData", result);
			});
		},
		
		
		
		operationTabsPendingClick1:function(){
			this.$('#tache-tabs-function-li-gird').show();
			this.$('#tache-tabs-executor-li-gird').hide();
			this.$('#tache-tabs-copyTo-li-gird').hide();
			this.$('#tache-tabs-function-li').addClass('ui-tabs-active');
			this.$('#tache-tabs-executor-li').removeClass('ui-tabs-active');
			this.$('#operation-tabs-copyTo-li').removeClass('ui-tabs-active');
			this.$('#isa-tacheAddbtn').show();
			this.$('#isa-tacheModbtn').hide();
			this.$('#isa-tacheDelbtn').show();
			this.$('#isa-tacheMainHande').hide();
			/*this.$('#operation-tabs').tabs('option', 'active',0);*/
			init.tabNum=1;
			$(window).resize();
		},
		operationTabsPendingClick2:function(){
			this.$('#tache-tabs-function-li-gird').hide();
			this.$('#tache-tabs-executor-li-gird').show();
			this.$('#tache-tabs-copyTo-li-gird').hide();
			this.$('#tache-tabs-function-li').removeClass('ui-tabs-active');
			this.$('#tache-tabs-executor-li').addClass('ui-tabs-active');
			this.$('#operation-tabs-copyTo-li').removeClass('ui-tabs-active');
			this.$('#isa-tacheAddbtn').show();
			this.$('#isa-tacheModbtn').hide();
			this.$('#isa-tacheDelbtn').show();
			this.$('#isa-tacheMainHande').show();
			/*this.$('#operation-tabs').tabs('option', 'active',0);*/
			init.tabNum=2;
			$(window).resize();
		},
		operationTabsPendingClick3:function(){
			this.$('#tache-tabs-function-li-gird').hide();
			this.$('#tache-tabs-executor-li-gird').hide();
			this.$('#tache-tabs-copyTo-li-gird').show();
			this.$('#tache-tabs-function-li').removeClass('ui-tabs-active');
			this.$('#tache-tabs-executor-li').removeClass('ui-tabs-active');
			this.$('#operation-tabs-copyTo-li').addClass('ui-tabs-active');
			this.$('#isa-tacheAddbtn').show();
			this.$('#isa-tacheModbtn').hide();
			this.$('#isa-tacheDelbtn').show();
			this.$('#isa-tacheMainHande').hide();
			/*this.$('#operation-tabs').tabs('option', 'active',0);*/
			init.tabNum=3;
			$(window).resize();
		},
		tacheAddbtnFunc:function(){
			if(init.tacheId==-1){
				fish.info("请选中环节");
				return;
			}
			if(init.tabNum==1){
				var tacheFunctionConf=$.proxy(this.tacheFunctionConf,this);
				var pop =fish.popupView({url: 'modules/isa/tache/views/tacheAddButton',
					viewOption:{tacheId:init.tacheId},
					width: "800px",
					callback:function(popup,view){
						popup.result.then(function (e) {
							console.log(e);
							tacheFunctionConf();
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}else if(init.tabNum==2){
				var pop =fish.popupView({url: 'modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrg',
					viewOption:{title:'选择处理人',orgId:'4265',},
					height: 400,
					width: 500,
					callback:function(popup,view,de){
						popup.result.then(function (e) {
							var result=new Object();
							result.partyId=e.id;
							result.partyName=e.text;
							if(e.type==0){
								result.partyType="ORG";
								result.partyId=e.orgId;
							}else if(e.type==1){
								 result.partyType="JOb";
								 var str= new Array();  
								 str=e.id.split("_");
								 result.partyId=str[1]+"";
							}else if(e.type==2){
								result.partyType="STA";
								result.partyId=e.id+"";
							}
							result.orgId=e.orgId;
							if(currentUser!=undefined){
								result.createStaffName=currentUser.staffName;
								result.createStaffId=currentUser.staffId;
							}else{
								result.createStaffName="";
								result.createStaffId=1;
							}
							if(currentJob!=undefined){
								result.createOrgName=currentJob.OrgName;
								//result.createOrgId=currentJob.OrgId; 获取SESSION 值为空
								result.createOrgId=1;
							}else{
								result.createOrgName="";
								result.createOrgId=1;
							}
							
							result.orgId=e.orgId;
							result.tabNum=init.tabNum;
							result.tacheId=init.tacheId;
							utils.ajax('isaOaTacheService','addTacheTabData',result).done(function(ret){
								  var flag=ret.res;
								  var result = {
											"rows": ret.rows
								  };
								  if(flag=="success"){
									  fish.info('添加成功');
								  }else{
									  fish.info('添加失败');
								  }
								  $("#tacheExecutorGrid").grid("reloadData", result);
							});
							console.log(e);
						},function (e) {
							console.log('关闭了',e);
						});
						
						
					}
				});
			}else if(init.tabNum==3){
				var pop =fish.popupView({url: 'modules/common/popeditviews/stafforg/views/OrgJobStaffsByOrg',
					viewOption:{title:'选择处理人',orgId:'4265',},
					height: 400,
					width: 500,
					callback:function(popup,view,de){
						popup.result.then(function (e) {
							var result=new Object();
							result.partyId=e.id;
							result.partyName=e.text;
							if(e.type==0){
								result.partyType="ORG";
								result.partyId=e.orgId;
							}else if(e.type==1){
								 result.partyType="JOb";
								 var str= new Array();  
								 str=e.id.split("_");
								 result.partyId=str[1]+"";
							}else if(e.type==2){
								result.partyType="STA";
								result.partyId=e.id+"";
							}
							result.orgId=e.orgId;
							if(currentUser!=undefined){
								result.createStaffName=currentUser.staffName;
								result.createStaffId=currentUser.staffId;
							}else{
								result.createStaffName="";
								result.createStaffId=1;
							}
							if(currentJob!=undefined){
								result.createOrgName=currentJob.OrgName;
								//result.createOrgId=currentJob.OrgId; 获取SESSION 值为空
								result.createOrgId=1;
							}else{
								result.createOrgName="";
								result.createOrgId=1;
							}
							result.orgId=e.orgId;
							result.tabNum=init.tabNum;
							result.tacheId=init.tacheId;
							utils.ajax('isaOaTacheService','addTacheTabData',result).done(function(ret){
								  var flag=ret.res;
								  var result = {
											"rows": ret.rows
								  };
								  if(flag=="success"){
									  fish.info('添加成功');
								  }else{
									  fish.info('添加失败');
								  }
								  $("#tacheCopyGrid").grid("reloadData", result);
							});
							console.log(e);
						},function (e) {
							console.log('关闭了',e);
						});
						
						
					}
				});
			
			}else{
				alert("没有TAB页");
			}
		},
		tacheModbtnFunc:function(){
			if(init.tacheId==-1){
				fish.info("请选中环节");
				return;
			}
			if(init.tabNum==1){
				
			}else if(init.tabNum==2){
				//Don't everything
			}else if(init.tabNum==3){
				//Don't everything
			}else{
				alert("没有TAB页");
			}
		},
		tacheDelbtnFunc:function(){
			if(init.tacheId==-1){
				fish.info("请选中环节");
				return;
			}
			if(init.tabNum==1){
				var getRowDataTemp = this.$("#tacheFunctionGrid").grid("getSelection");//返回所有被选中的行
				if(getRowDataTemp.tacheId==undefined){
					fish.info("请选择相应的行");
					return;
				}
				fish.confirm('你确定要做该操作吗？').result.then(function() {
					var map=new Object();
					map.tabNum=init.tabNum;
					map.tacheId=getRowDataTemp.tacheId;
					map.buttonId=getRowDataTemp.buttonId;
					map.partyRole=getRowDataTemp.partyRole;
					map.workOrderState=getRowDataTemp.workOrderState;
					map.workOrderType=getRowDataTemp.workOrderType;
					utils.ajax('isaOaTacheService','delTacheTabData',map).done(function(ret){
						var result = {
								"rows": ret.rows
						};
						$("#tacheFunctionGrid").grid("reloadData", result);
					});
				});
			}else if(init.tabNum==2){
				var getRowDataTemp = this.$("#tacheExecutorGrid").grid("getSelection");//返回所有被选中的行
				if(getRowDataTemp.partyScopeId==undefined){
					fish.info("请选择相应的行");
					return;
				}
				fish.confirm('你确定要做该操作吗？').result.then(function() {
					var map=new Object();
					map.tacheId=getRowDataTemp.tacheId;
					map.tabNum=init.tabNum;
					map.partyScopeId=getRowDataTemp.partyScopeId;
					utils.ajax('isaOaTacheService','delTacheTabData',map).done(function(ret){
						var result = {
								"rows": ret.rows
						};
						$("#tacheExecutorGrid").grid("reloadData", result);
					});
					fish.success('成功删除');
				});
				
			}else if(init.tabNum==3){
				var getRowDataTemp = this.$("#tacheCopyGrid").grid("getSelection");//返回所有被选中的行
				if(getRowDataTemp.tacheCopyPartyId==undefined){
					fish.info("请选择相应的行");
					return;
				}
				fish.confirm('你确定要做该操作吗？').result.then(function() {
					var map=new Object();
					map.tacheId=getRowDataTemp.tacheId;
					map.tabNum=init.tabNum;
					map.tacheCopyPartyId=getRowDataTemp.tacheCopyPartyId;
					utils.ajax('isaOaTacheService','delTacheTabData',map).done(function(ret){
						var result = {
								"rows": ret.rows
						};
						$("#tacheCopyGrid").grid("reloadData", result);
						fish.success('成功删除');
					});
				});
				
			}else{
				alert("没有TAB页");
			}
		},
		tacheMainHandleFunc:function(){
			if(init.tabNum==1){
				//Don't everything
			}else if(init.tabNum==2){
				var getRowDataTemp = this.$("#tacheExecutorGrid").grid("getSelection");//返回所有被选中的行
				if(getRowDataTemp.partyScopeId==undefined){
					fish.info("请选择相应的行");
					return;
				}
				fish.confirm('你确定要做该操作吗？').result.then(function() {
					var map=new Object();
					map.tacheId=getRowDataTemp.tacheId;
					map.tabNum=init.tabNum;
					map.partyScopeId=getRowDataTemp.partyScopeId;
					utils.ajax('isaOaTacheService','setMainHandle',map).done(function(ret){
						var result = {
								"rows": ret.rows
						};
						$("#tacheExecutorGrid").grid("reloadData", result);
					});
					fish.success('设置主办成功');
				});
				
			}else if(init.tabNum==3){
				//Don't everything
			}else{
				alert("没有TAB页");
			}
		},
		qryTacheName:function(){
			var getTacheData=$.proxy(this.getTacheData,this);
			getTacheData();
		},
		tacheCataModbtn:function(){
			if(init.tacheId==-1){
				fish.info("请选择环节列表");
				return;
			}
			var getRowDataTemp = this.$("#tacheGrid").grid("getSelection");//返回所有被选中的行
			var pop =fish.popupView({url: 'modules/isa/tache/views/tacheExetend',
				viewOption:{tacheId:init.tacheId},
				width: "500px",
				height: "400px",
				callback:function(popup,view){
					popup.result.then(function (e) {
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
			/*utils.ajax('isaOaTacheService','setMainHandle',map).done(function(ret){
				var result = {
						"rows": ret.rows
				};
				$("#tacheExecutorGrid").grid("reloadData", result);
			});*/
		}
	});	
});