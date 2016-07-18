define([
	'text!modules/common/oaas/staffs/staffmgr/templates/StaffMgrView.html',
	'i18n!modules/common/oaas/staffs/staffmgr/i18n/Staff.i18n',
	'modules/common/cloud-utils'
], function(viewTpl, i18n,utils) {
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		events: {
			"click #com-staffmgr-staff-search":"searchStaffs",
			"click #com-staffmgr-staff-expand":"_expand",
			"click #com-staffmgr-staff-collapse":"_collapse",
			"click #com-staffmgr-staff-details":"_editStaff",
			"click #com-staffmgr-staff-add":"_addStaff",
			"click #com-staffmgr-staff-remove":"_removeStaff",
			"click #com-staffmgr-staff-jobs":"_assignJobs"
			
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.css({"height":"100%"});
			this.$el.html(this.template(this.i18nData));
			
			return this;
		},
		_removeStaff:function(){
			var me=this, staff = $('#com-staffmgr-staff-grid').grid("getSelection");
			var searchStaffs=$.proxy(this.searchStaffs,this);
			if(staff){
				fish.confirm("是否删除用户").result.done(function(){
					
					utils.ajax("staffService","delete",staff.staffId).done(function(){
						searchStaffs();
						
					});
				});
			}
		},
		_assignJobs:function(){
			var crs = this.staffTree.jqGrid("getCheckRows");
			var org = this.$('#com-staffmgr-org-grid').grid("getSelection");
			var searchStaffs=$.proxy(this.searchStaffs,this);
			if(crs&&crs.length>0){
				fish.popupView({url: 'modules/common/oaas/staffs/staffmgr/views/StaffJobOrgMgrView',
					width: "60%",
					viewOption:{
						staff:crs[0],
						org:org
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							searchStaffs();
							console.log(e);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}
			
		},
		_staffSearch:function(){
			this.loadStaffs();
		},
		_editStaff:function(){
			var crs = this.staffTree.jqGrid("getCheckRows");
			var org = this.$('#com-staffmgr-org-grid').grid("getSelection");
			var searchStaffs=$.proxy(this.searchStaffs,this);
			if(crs&&crs.length>0){
				fish.popupView({url: 'modules/common/oaas/staffs/staffmgr/views/StaffInfoView',
					width: "60%",
					
					viewOption:{
						staff:crs[0],
						org:org
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							searchStaffs();
							console.log(e);
						},function (e) {
							console.log('关闭了',e);
						});
					}
				});
			}
		},
		_addStaff:function(){
			var org = this.$('#com-staffmgr-org-grid').grid("getSelection");
			var searchStaffs=this.searchStaffs;
			if(org){
				fish.popupView({url: 'modules/common/oaas/staffs/staffmgr/views/StaffInfoView',
					width: "60%",
					viewOption:{
						
						org:org
					},
					callback:function(popup,view){
						popup.result.then(function (e) {
							searchStaffs();
							console.log(e);
						},function (e) {
							//searchStaffs();
							console.log('关闭了',e);
						});
					}
				});
			}
		},
		_expand:function(){
			this.$("#com-staffmgr-staff-collapse").show();
			this.$("#com-staffmgr-staff-search-moreopt").show();
			this.$("#com-staffmgr-staff-expand").hide();
			$(window).resize();
			setTimeout(function(){$(window).resize();},400);
		},
		_collapse:function(){
			this.$("#com-staffmgr-staff-collapse").hide();
			this.$("#com-staffmgr-staff-search-moreopt").hide();
			this.$("#com-staffmgr-staff-expand").show();
			$(window).resize();
			setTimeout(function(){$(window).resize();},400);
		},
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			this.$("#com-staffmgr-staff-collapse").hide();
			this.$("#com-staffmgr-staff-search-moreopt").hide();
			/*this.orgTypes = this.$('input[name="orgType"]');
			this.orgTypes.icheck();*/
			this.$('#com-staffmgr-staff-searchform').form();
			this.orgTree=this.$("#com-staffmgr-org-grid").jqGrid({
                // height:320,
                colModel: [{
                    name: 'orgId',
                    key: true,
                    hidden: true
                }, {
                    name: 'orgName',
                    label: this.i18nData.STAFFORG_ORG_NAME,
                    sortable: false,
                    search: true,
                    width: "65%",
                }, {
                    name: "orgCode",
                    label: this.i18nData.STAFFORG_ORG_CODE,
                    sortable: false,
                    search: true,
                    width: "35%",
                }, {
                    name: "areaId",
                    label: this.i18nData.STAFFORG_ORG_AREA,
                    exportable: true,
                    hidden: true
                }/*, {
                    name: "LEADER_STAFF_NAME",
                    label: this.i18nData.STAFFORG_ORG_LEADER,
                    hidden: true,
                    exportable: true
                }*/],
                treeGrid: true,
                autowidth:true,
                width:"100%",
                fixWidth:true,
                /*exportFeature: function(){
                    return {
                        serviceName:"QryStaffMasterOrgList"
                    }
                }.bind(this),*/
                treeIcons: {
                    plus: 'glyphicon glyphicon-folder-close',
                    minus: 'glyphicon glyphicon-folder-open',
                    leaf: 'glyphicon glyphicon-file'
                },
                expandColumn: "orgName",
                //onRowExpand:$.proxy(this.expandOrgRow,this),
                treeReader:{parentid :"parentId"},
                pagebar: true,
                onSelectRow:$.proxy(this.orgSelected,this)
                //onChangeRow: this.onChangeRow.bind(this)
            });
			this.$("#com-staffmgr-org-grid-search").searchbar({
				target: this.orgTree
			});
			this.orgTree.jqGrid("navButtonAdd",[{
				   title:"刷新",
                   buttonicon:"glyphicon glyphicon-refresh",
                   // cssprop:{"float":"right"},
                   onClick:$.proxy(this.loadOrgs,this)
               }]);
			this.staffTree=this.$("#com-staffmgr-staff-grid").jqGrid({
	                datatype: "json",
	                
	                onSelectAll:$.proxy(this._mgrbuttons,this),
	                onSelectChange:$.proxy(this._mgrbuttons,this),
	                //height: 400,
	                colModel: [{
	                    name: 'staffId',
	                    key: true,
	                    hidden: true
	                }, {
	                    name: 'staffName',
	                    label: this.i18nData.STAFFORG_STAFF_NAME,
	                    width: "15%",
	                    sortable: false,
	                    search: true
	                }, {
	                    name: "userName",
	                    label: this.i18nData.STAFFORG_USER_ACCOUNT,
	                    width: "15%",
	                    sortable: false,
	                    search: true
	                }, {
	                    name: "officeTel",
	                    label: this.i18nData.STAFFORG_OFF_PHONE,
	                    width: "15%",
	                    sortable: false,
	                    search: true
	                }, 
	                {
	                    name: "mobileTel",
	                    label: this.i18nData.STAFFORG_TEL_PHONE,
	                    width: "15%",
	                    sortable: false,
	                    search: true
	                },
	                
	                {
	                    name: "email",
	                    label: this.i18nData.STAFFORG_STAFF_EMAIL,
	                    width: "20%",
	                    sortable: false,
	                    search: true
	                }, {
	                    name: "orgPathName",
	                    label: this.i18nData.ORG_PATH,
	                    width: "10%",
	                    sortable: false
	                    /*formatter: function(cellValue, rowId, rowData) {
	                        return this.staffStates[cellValue];
	                    }.bind(this)*/
	                }],
	                rowNum: 10,
	                pager: true,
	                server: true,
	                multiselect: true,
	                pageData: $.proxy(this.loadStaffs ,this)
	            });
			 this.resize();
			 var me =this;
			 var loadStaffs = $.proxy(this.loadStaffs,this);
			 this.loadOrgs();
			 this.disableButton();
		},
		expandOrgRow:function(e, rowData){
			 var children = this.orgTree.grid("getNodeChildren", rowData),me=this;
			 if(children.length==0){
				 utils.ajax("orgService","findByParent",rowData.orgId).done(function(orgs){
						$.each(orgs,function(org){
							org.isLeaf=false;
						});	
						//console.log("子组织",rowData.orgId+":",orgs);
						me.orgTree.grid('addChildNodes', orgs, rowData);
					})
				 
		        }
		},
		
		loadOrgs:function(){
			var me =this;
			this.disableButton();
			
			me.orgTree.blockUI({message: '加载中'}).data('blockui-content', true);
			return utils.ajax("orgService","findAllOrgs").done(function(orgs){
			//return utils.ajax("orgService","findTopOrg").done(function(org){//查询顶层
				
				//org.isLeaf=false;
				
			 
				me.orgTree.jqGrid("reloadData", orgs);//[org]);
			}).always(function(){
				me.orgTree.unblockUI().data('blockui-content', false);
			}).done(function(orgs){
				 var data = me.$('#com-staffmgr-org-grid').grid("getRowData");
				 if(data&&data.length>0){
					 me.$('#com-staffmgr-org-grid').grid("setSelection", data[0]);
					 me.loadStaffs();
				 }
			 });
			
			
		},
		loadStaffs:function(page, rowNum, sortname, sortorder){
			var me =this;
			page = page || this.staffTree.grid("getGridParam", "page");
			rowNum = rowNum || this.staffTree.grid("getGridParam", "rowNum");
			this.disableButton();
			
			var staffName=this.$('#com-staffmgr-staff-search-name').val(), 
			userName=this.$('#com-staffmgr-staff-search-username').val(), 
			officeTel=this.$('#com-staffmgr-staff-search-offpho').val(), 
			mobileTel=this.$('#com-staffmgr-staff-search-telpho').val();
			
			
			var orgType = this.$('#com-staffmgr-staff-searchform').form("value").orgType;
			if(orgType&&orgType=="2"){
				utils.ajax("staffService","queryStaffNoJob",staffName,userName,officeTel,mobileTel,page,rowNum).done(function(pages){
					console.log(pages);
					me.staffTree.jqGrid("reloadData", pages);
				}).always(function(){
					me.staffTree.unblockUI().data('blockui-content', false);
				});
			}
			else{
				if(this.$('#com-staffmgr-org-grid').grid("getSelection")==null)
					return fish.info("请选择职位");
				
				var orgId=this.$('#com-staffmgr-org-grid').grid("getSelection").orgId,
				orgPathCode=this.$('#com-staffmgr-org-grid').grid("getSelection").orgPathCode;
				
				
					me.staffTree.blockUI({message: '加载中'}).data('blockui-content', true);
					if(orgType&&orgType=="1"){
						utils.ajax("staffService","queryAllStaffs",staffName,userName,officeTel,mobileTel,orgPathCode,page,rowNum).done(function(pages){
							
							console.log(pages);
							me.staffTree.jqGrid("reloadData", pages);
						}).always(function(){
							me.staffTree.unblockUI().data('blockui-content', false);
						});
					}
					else{
						utils.ajax("staffService","queryDirectStaffsPaging",staffName,userName,officeTel,mobileTel,orgId,page,rowNum).done(function(pages){
							console.log(pages);
							me.staffTree.jqGrid("reloadData", pages);
						}).always(function(){
							me.staffTree.unblockUI().data('blockui-content', false);
						});
					}
				
			}
		},
		disableButton:function(){
			this.$("#com-staffmgr-staff-details").attr("disabled","");
			this.$("#com-staffmgr-staff-roles").attr("disabled","");
			this.$("#com-staffmgr-staff-jobs").attr("disabled","");
			this.$("#com-staffmgr-staff-auths").attr("disabled","");
			this.$("#com-staffmgr-staff-remove").attr("disabled","");
			
		},

		_mgrbuttons:function(){
			var selrows = this.staffTree.jqGrid("getCheckRows");
			if(selrows&&selrows.length==1){
				this.$("#com-staffmgr-staff-details").removeAttr("disabled");
				this.$("#com-staffmgr-staff-roles").removeAttr("disabled");
				this.$("#com-staffmgr-staff-jobs").removeAttr("disabled");
				this.$("#com-staffmgr-staff-auths").removeAttr("disabled");
				this.$("#com-staffmgr-staff-remove").removeAttr("disabled");
			}else{
				this.$("#com-staffmgr-staff-details").attr("disabled","");
				this.$("#com-staffmgr-staff-roles").attr("disabled","");
				this.$("#com-staffmgr-staff-jobs").attr("disabled","");
				this.$("#com-staffmgr-staff-auths").attr("disabled","");
				this.$("#com-staffmgr-staff-remove").attr("disabled","");
			}
			
			/*if(selrows&&selrows.length>0){
				this.$("#com-staffmgr-staff-remove").removeAttr("disabled");
			}else{
				this.$("#com-staffmgr-staff-remove").attr("disabled","");
			}*/
		},
		orgSelected:function(){
			//this.disableButton();
			this.loadStaffs();
		},
		searchStaffs:function(){
			//this.disableButton();
			this.loadStaffs();
		},
		
		resize:function(){
			
			this.$('#com-staffmgr-org-grid').grid("setGridHeight",((this.$('#com-staffmgr-org-container').height()-40-35-this.$('.org-grid-search-bar').outerHeight(true))+"px"));
			
			this.$('#com-staffmgr-staff-grid').grid("setGridHeight",((this.$('#com-staffmgr-staff-container').height()-this.$('#com-staffmgr-staff-search-row').outerHeight(true)-75)+"px"));
			
			this.$('#com-staffmgr-org-grid').grid("resize",true);
			
			this.staffTree.grid("resize",true);
			
		}
	});
});