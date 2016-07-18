define([
	'text!modules/common/oaas/orgs/orgmgr/templates/OrgMgrView.html',
	'i18n!modules/common/oaas/orgs/orgmgr/i18n/Org.i18n',
	'modules/common/cloud-utils'
], function(viewTpl, i18n,utils) {
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		events: {
			//"click #com-orgmgr-org-details":
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.css({"height":"100%"});
			this.$el.html(this.template(this.i18nData));
			return this;
		},
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
			
			this.$('#com-orgmgr-org-searchform').form();
			this.orgTree=this.$("#com-orgmgr-org-grid").jqGrid({
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
                onRowExpand:$.proxy(this.expandOrgRow,this),
                treeReader:{parentid :"parentId"},
                pagebar: true,
                onSelectRow:$.proxy(this.orgSelected,this)
                //onChangeRow: this.onChangeRow.bind(this)
            });
			this.$("#com-orgmgr-org-grid-search").searchbar({
				target: this.orgTree
			});
			this.orgTree.jqGrid("navButtonAdd",[{
				   title:"刷新",
                   buttonicon:"glyphicon glyphicon-refresh",
                   // cssprop:{"float":"right"},
                   onClick:$.proxy(this.loadOrgs,this)
               },{
			   title:"添加",
               buttonicon:"glyphicon glyphicon-plus",
               // cssprop:{"float":"right"},
               onClick:$.proxy(this.addOrg,this)
           },{
			   title:"删除",
               buttonicon:"glyphicon glyphicon-minus",
               // cssprop:{"float":"right"},
               onClick:$.proxy(this.loadOrgs,this)
           },{
			   title:"修改",
               buttonicon:"glyphicon glyphicon-pencil",
               // cssprop:{"float":"right"},
               onClick:$.proxy(this.loadOrgs,this)
           }]);
			
			this.jobgrid=this.$("#com-orgmgr-job-grid").grid({
                //datatype: "json",
                
                //onSelectAll:$.proxy(this._mgrbuttons,this),findByOrg
                //onSelectChange:$.proxy(this._mgrbuttons,this),
                //height: 400,
                colModel: [{
                    name: 'jobId',
                    key: true,
                    hidden: true
                }, {
                    name: 'jobName',
                    label: "职位名称",
                    width: "40%",
                    sortable: false,
                    search: true
                }, {
                    name: "postName",
                    label: "职位模板",
                    width: "30%",
                    sortable: false,
                    search: true
                }, {
                    name: "orgPathName",
                    label: this.i18nData.ORG_PATH,
                    width: "30%",
                    sortable: false
                    /*formatter: function(cellValue, rowId, rowData) {
                        return this.staffStates[cellValue];
                    }.bind(this)*/
                }],
                //rowNum: 10,
                //pager: true,
                //server: true,
                //multiselect: true,
                onSelectRow:$.proxy(this.jobSelected,this),
                pageData: $.proxy(this.loadJobs ,this)
            });
			
			 this.resize();
			
			 this.loadOrgs();
			
		},
		expandOrgRow:function(e, rowData){
			 
		},
		orgSelected:function(){
			
			this.loadJobs();
			//this.$("#com-orgmgr-org-details").removeAttr("disabled");
			//this.$("#com-orgmgr-org-add").removeAttr("disabled");
			//this.$("#com-orgmgr-org-delete").removeAttr("disabled");
			
		},
		jobSelected:function(e){
			console.log(e);
			this.$("#com-orgmgr-org-details").removeAttr("disabled");
			
			this.$("#com-orgmgr-org-delete").removeAttr("disabled");
		},
		loadOrgs:function(){
			var me =this;
			
			me.orgTree.blockUI({message: '加载中'}).data('blockui-content', true);
			return utils.ajax("orgService","findAllOrgs").done(function(orgs){
			
				me.orgTree.jqGrid("reloadData", orgs);
			}).always(function(){
				me.orgTree.unblockUI().data('blockui-content', false);
			}).done(function(orgs){
				 var data = me.orgTree.grid("getRowData");
				 if(data&&data.length>0){
					 me.orgTree.grid("setSelection", data[0]);
					 me.loadJobs();
				 }
			 });;
			
			
		},
		loadJobs:function(page, rowNum, sortname, sortorder){
			var me =this;
			//page = page || this.jobgrid.grid("getGridParam", "page");
			//rowNum = rowNum || this.jobgrid.grid("getGridParam", "rowNum");
			var orgId=this.orgTree.grid("getSelection").orgId;
			me.jobgrid.blockUI({message: '加载中'}).data('blockui-content', true);
			
			utils.ajax("jobService","findByOrg",orgId).done(function(jobs){
				console.log(jobs);
				me.jobgrid.grid("reloadData", jobs);
			}).always(function(){
				me.jobgrid.unblockUI().data('blockui-content', false);
			});
			
			
		},
		addOrg:function(){
			
			var org=this.orgTree.grid("getSelection");
			
			utils.ajax("orgTmplateService","canCreateOrg",org.orgTmpId).done(function(ret){
				if(ret){
					fish.popupView({url: 'modules/common/oaas/orgs/orgmgr/views/OrgInfoView',
						width: "60%",
						viewOption:{
							parentOrg:org
						},
						callback:function(popup,view){
							popup.result.then(function (e) {
								//searchStaffs();
								console.log(e);
							},function (e) {
								console.log('关闭了',e);
							});
						}
					});
				}else{
					fish.info("该组织没有具有相应的模板，不能增加子组织！");
				}
				
			});
			
		},
		resize:function(){
			this.orgTree.grid("setGridHeight",((this.$('#com-orgmgr-org-container').height()-40-35-this.$('.org-grid-search-bar').outerHeight(true))+"px"));
			
			this.jobgrid.grid("setGridHeight",((this.$('#com-orgmgr-job-container').height()-this.$('#com-orgmgr-job-search-row').outerHeight(true)-40)+"px"));
			
			
			this.orgTree.grid("resize",true);
			this.jobgrid.grid("resize",true);
			
		}
	});
});