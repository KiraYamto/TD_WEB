define([
	'text!modules/isa/duty/templates/DutyModuleMana.html',
	'i18n!modules/isa/duty/i18n/dutyModuleMana.i18n',
	'modules/common/cloud-utils',
	'css!modules/isa/duty/style/dutyModuleMana.css'
], function(DutyModuleManaViewTpl, i18nDuty,utils,css) {
	return fish.View.extend({
		rowMap:{},
		template: fish.compile(DutyModuleManaViewTpl),
		i18nData: fish.extend({}, i18nDuty),
		events: {
			"click #operation-add-btn": "addDutyModule",
			"click #operation-update-btn": "updateDutyModule",
			"click #operation-delete-btn": "deleteDutyModule"
		},

		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},
		


		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.rowMap.orgId = currentJob.orgId;
			this.rowMap.orgName = currentJob.orgName;
			this.loadOrgData();
			this.loadMydutyModuleRender();
			this.getMydutyModuleData(currentJob.orgId);
			this.loadMydutyPeriodRenderProcessed();
		},
		
		/* 加载组织信息 */
		loadOrgData : function(){	
			var me=this;
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
								me.rowMap.orgName = treeNode.orgName;
								me.getMydutyModuleData(me.rowMap.orgId);
							}
						}
				};
				$('#orgTree').tree(options);
			});
		},
		
		//值班模板列表
		loadMydutyModuleRender: function() {
			this.$("#operation-dutymodule-grid-pending").grid({
				datatype: "json",
				height: $(window).height()*0.48,
				colModel: [{
					name: 'dutyModuleName',
					label: '模板名称',
					width: 200
				}, {
					name: 'createDate',
					width: 100,
					label: '创建时间'
				}, {
					name: 'createStaffName',
					label: '创建人',
					width: 100
				},{
				name: 'dutyModuleId',
				label: '值班模板ID',
				key:true,
				width: 100,
				hidden:true
			}],
				rowNum: 10,
				recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
		        pgtext: "第 {0} 页 / 共 {1} 页",
		        emptyrecords: "没有记录",
		        gridview:false,
		        onPaging: function (pgButton){ //检查用户输入的页数
		            var currentPage = $('#operation-dutymodule-grid-pending').jqGrid('getGridParam','page');
		            var lastPage = $('#operation-dutymodule-grid-pending').jqGrid('getGridParam','lastpage');
		            var input = Math.floor($(".ui-pg-input").val());
		            if (pgButton == 'first' && currentPage==1){
		                return 'stop';
		            }
		            else if (pgButton == 'prev' && currentPage==1){
		                return 'stop';
		            }
		            else if (pgButton == 'next' && currentPage==lastPage){
		                return 'stop';
		            }
		            else if (pgButton == 'last' && currentPage==lastPage){
		                return 'stop';
		            }
		            else if (pgButton == 'user' && (!$.isNumeric(input) || input<1 || input>lastPage)){
		                fish.showWarn("无效页数，请输入正确的页数。");
		                return 'stop';
		            }
		        },
				pager: true,
				server: true,
				multiselect: false,
				pageData: this.getMydutyModulePerData,//同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
				onSelectRow:$.proxy(function(e, rowid, state, checked){
					var c = e;
					//this.showSaPolicy(e, rowid, state, checked);
				},this),
				onCellSelect: $.proxy(function (e, rowid, iCol, cellcontent) {//选中单元格的事件
					var c = e;
					$("#operation-dutymodule-grid-pending").jqGrid("setSelection",rowid,false);
					this.getMydutyPeriodPerData(rowid);
			    },this)
			});
		},
		
		//根据组织id查询值班模板 首页
		getMydutyModuleData: function(curOrgId) { //请求服务器获取数据的方法
			var rowNum = 10;
			var page = 1;
			var map = new Object();
			map.actionStr = "queryDutyModuleByOrgId";
			map.orgId = curOrgId+"";
			map.pageIndex = 1+"";
			map.pageSize = 10+"";
			utils.ajax('isaDutyService','queryDutyModuleByOrgId',map).done(function(ret){
				if(ret!=null){
					var records = ret.total;
					var total =Math.ceil(ret.rows.length/10);					
					var result = {
							"rows": ret.rows,
							"page": page,
							"total":total,
							"records":records
						};
					$("#operation-dutymodule-grid-pending").grid("reloadData", result);
				}
			});
		},
		
		//根据组织id查询值班模板 分页
		getMydutyModulePerData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法
			rowNum = rowNum || this.$("#operation-dutymodule-grid-pending").grid("getGridParam", "rowNum");
			var map = new Object();
			map.actionStr = "queryDutyModuleByOrgId";
			if(this.rowMap.orgId=null){
				 map.orgId = currentJob.orgId+"";
			}else{
				map.orgId = this.rowMap.orgId+"";
			}
			map.pageIndex = (page-1)*10+1+"";
			map.pageSize = 10+"";
			var me =this;
			utils.ajax('isaDutyService','queryDutyModuleByOrgId',map).done(function(ret){
				if(ret!=null){
					var records = ret.total;
					var total =Math.ceil(ret.rows.length/10);					
					var result = {
							"rows": ret.rows,
							"page": page,
							"total":total,
							"records":records
						};
					$("#operation-dutymodule-grid-pending").grid("reloadData", result);
				}
			});
		},
		
		//班次列表
		loadMydutyPeriodRenderProcessed: function() {
			this.$("#operation-dutyperiod-grid-pending").grid({
				datatype: "json",
				height: $(window).height()*0.35,
				colModel: [{
					name: 'moduleSeqId',
					label: '班次',
					width: 60
				}, {
					name: 'dutyPeriodModuleName',
					width: 60,
					label: '班次名称'
				}, {
					name: 'beginTime',
					label: '开始时间',
					width: 80
				},  {
					name: 'endTime',
					label: '结束时间',
					width: 80
				},  {
					name: 'turnbeginTime',
					label: '交班开始时间',
					hidden:true,
					width: 80
				},  {
					name: 'turnEndTime',
					label: '交班结束时间',
					hidden:true,
					width: 80
				},  {
					name: 'targetSeqId',
					label: '交办班次',
					width: 80
				}],
				server: true
			});
		},
		//根据值班模板查找班次信息
		getMydutyPeriodPerData: function(id) { //请求服务器获取数据的方法
			var me = this;
			var map = new Object();
			map.actionStr = "getModuleInfoByDutyModuleId";
			map.dutyModuleId= id;
			utils.ajax('isaDutyService','getModuleInfoByDutyModuleId',map).done(function(ret){
				var result = {
						"rows": ret
				};
				me.rowMap.result = ret;
				$("#operation-dutyperiod-grid-pending").grid("reloadData", result);
			});
		},
		
		//新增值班模板
		addDutyModule:function(){
			var me = this;
			var pop =fish.popupView({url: 'modules/isa/duty/views/AddDutyModule',
				width: "70%",height:"50%",
				viewOption:{
					orgId : me.rowMap.orgId,
					orgName : me.rowMap.orgName
				},
				callback:function(popup,view){
					popup.result.then(function (e) {
						fish.info('新增成功');
						me.getMydutyModuleData(me.rowMap.orgId);
						},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		
		//修改值班模板
		updateDutyModule:function(){
			var getRowDataTemp = this.$("#operation-dutymodule-grid-pending").grid("getSelection");
			var me = this;
			var pop =fish.popupView({url: 'modules/isa/duty/views/EditDutyModule',
				width: "70%",height:"50%",
				viewOption:{
					dutyModuleId:getRowDataTemp.dutyModuleId,
					dutyModuleName : getRowDataTemp.dutyModuleName,
					result : me.rowMap.result
				},
				callback:function(popup,view){
					popup.result.then(function (e) {
						fish.info('修改成功');
						me.getMydutyModuleData(me.rowMap.orgId);
						},function (e) {
						console.log('关闭了',e);
					});
				}
			});
		},
		
		//删除值班模板
		deleteDutyModule:function(){
			var getRowDataTemp = this.$("#operation-dutymodule-grid-pending").grid("getSelection");
			if(undefined ==getRowDataTemp||null == getRowDataTemp||getRowDataTemp.length==0||undefined==getRowDataTemp.dutyModuleId){
				fish.warn('请选择行！');
				return;
			}
			var map = new Object();
			map.dutyModuleId = getRowDataTemp.dutyModuleId;
			var me =this;
			fish.confirm('你确定要删除吗？').result.then(function() {
	            utils.ajax('isaDutyService', 'deleteDutyModule', map).done(function(ret){
	            	if(ret){
	            		if(ret == "SUCCESS"){
	            			me.getMydutyModuleData(me.rowMap.orgId);
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