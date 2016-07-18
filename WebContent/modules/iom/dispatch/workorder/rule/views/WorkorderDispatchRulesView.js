define([
	'text!modules/iom/dispatch/workorder/rule/templates/WorkorderDispatchRulesView.html',
	'i18n!modules/iom/dispatch/i18n/dispatch.i18n',
	'modules/common/cloud-utils'
], function(viewTpl, i18n,utils) {
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		events: {
			
		},
		//这里用来进行dom操作
		_render: function() {
			this.$el.css({"height":"100%"});
			this.$el.html(this.template(this.i18nData));
			
			return this;
		},
		_afterRender: function() {
			this.tacheTree=this.$("#dispatch-workorder-rulesmgr-tachegrid").jqGrid({
                // height:320,
                colModel: [{
                    name: 'id',
                    key: true,
                    hidden: true
                }, {
                    name: 'text',
                    label: this.i18nData.TACHE_NAME,
                    sortable: false,
                    search: true,
                    width: "65%",
                }, {
                    name: "tacheCode",
                    label: this.i18nData.TACHE_CODE,
                    sortable: false,
                    search: true,
                    width: "35%",
                }],
                treeGrid: true,
                autowidth:true,
                width:"100%",
                multiselect:true,
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
                expandColumn: "text",
                checkChildren:true,
                checkParent:true,
                onRowCollapse:function(e, rowData){
                    console.log(rowData);
                },
                onRowExpand:$.proxy(this.expandTacheCatalogRow,this),
                treeReader:{parentid :"parentId"},
                pagebar: true/*,
                onSelectRow:$.proxy(function(){
                	this.loadRules()
                	},this)*/
                //onChangeRow: this.onChangeRow.bind(this)
            });
			this.$("#dispatch-workorder-rulesmgr-tachesearch").searchbar({
				target: this.tacheTree
			});
			
			this.tacheTree.jqGrid("navButtonAdd",[{
				   title:"刷新",
				   caption:"刷新",
	                buttonicon:"glyphicon glyphicon-refresh",
	                // cssprop:{"float":"right"},
	                //onClick:$.proxy(this.loadOrgs,this)
	            },{
					   title:"查询",
					   caption:"查询",
		                buttonicon:"glyphicon glyphicon-search",
		                 cssprop:{"float":"right"},
		                onClick:$.proxy(function(){
		                	this.loadRules()
	                	},this)
		            }]);
			
			
			
			this.ruleGrid = this.$("#dispatch-workorder-rulesmgr-rulesgrid").jqGrid({
                datatype: "json",
                
                //onSelectAll:$.proxy(this._mgrbuttons,this),
                //onSelectChange:$.proxy(this._mgrbuttons,this),
                //height: 400,
                colModel: [{
                    name: 'id',
                    key: true,
                    hidden: true
                }, {
                    name: 'tachePath',
                    label: "环节路径",
                    width: "15%",
                    sortable: false,
                    search: true
                }, {
                    name: "tachName",
                    label: "环节名称",
                    width: "15%",
                    sortable: false,
                    search: true
                }, {
                    name: "prodName",
                    label: "产品",
                    width: "15%",
                    sortable: false,
                    search: true
                },
                
                {
                    name: "dispatchElementTypeDesc",
                    label: "派发规则类型",
                    width: "15%",
                    sortable: false,
                    search: true
                },
                {
                    name: "rollBackTypeDesc",
                    label: "回退方式",
                    width: "15%",
                    sortable: false,
                    search: true
                },
                {
                    name: "businessObjDto.businessObjName",
                    label: "回退组件",
                    width: "10%",
                    sortable: false,
                    search: true
                },
                {
                    name: "priorGrade",
                    label: "优先级",
                    width: "10%",
                    sortable: false,
                    search: true
                },
                {
                    name: "operType",
                    label: "操作类型",
                    width: "10%",
                    sortable: false,
                    search: true
                },
                {
                    name: "operDate",
                    label: "操作日期",
                    width: "10%",
                    sortable: false,
                    search: true
                },
                {
                    name: "operStaffName",
                    label: "操作人",
                    width: "10%",
                    sortable: false,
                    search: true
                },
                {
                    name: "operOrgName",
                    label: "所属组织",
                    width: "10%",
                    sortable: false,
                    search: true
                }],
                rowNum: 10,
                pager: true,
                server: true,
                pageData: $.proxy(this.loadRules ,this),
                onSelectRow:$.proxy(function(){
                	this.loadRuleMaps();
                	},this)
            });
			
			this.ruleGrid.jqGrid("navButtonAdd",[{
				   title:"添加",
				   caption:"添加",
	                buttonicon:"glyphicon glyphicon-plus",
	                // cssprop:{"float":"right"},
	                onClick:$.proxy(this.addRule,this)
	            },{
					   title:"修改",
					   caption:"修改",
		                buttonicon:"glyphicon glyphicon-pencil",
		                // cssprop:{"float":"right"},
		                onClick:$.proxy(this.addRule,this)
		            },{
						   title:"删除",
						   caption:"删除",
			                buttonicon:"glyphicon glyphicon-remove",
			                // cssprop:{"float":"right"},
			                //onClick:$.proxy(this.loadOrgs,this)
			            },{
							   title:"扩展条件",
							   caption:"扩展条件",
				                buttonicon:"glyphicon glyphicon-object-align-right",
				                // cssprop:{"float":"right"},
				                //onClick:$.proxy(this.loadOrgs,this)
				            }]);
			
			this.ruleMapGrid = this.$("#dispatch-workorder-rulesmgr-mappinggrid").jqGrid({
                datatype: "json",
                
                //onSelectAll:$.proxy(this._mgrbuttons,this),
                //onSelectChange:$.proxy(this._mgrbuttons,this),
                //height: 400,
                colModel: [{
                    name: 'id',
                    key: true,
                    hidden: true
                }, {
                    name: "partyTypeName",
                    label: "执行人类型",
                    width: "15%",
                    sortable: false,
                    search: true
                }, {
                    name: "partyName",
                    label: "执行人名称",
                    width: "15%",
                    sortable: false,
                    search: true
                }, 
                {
                    name: "backupPartyTypeName",
                    label: "人工执行人类型",
                    width: "15%",
                    sortable: false,
                    search: true
                },
                {
                    name: "backupPartyName",
                    label: "人工执行人名称",
                    width: "15%",
                    sortable: false,
                    search: true
                },
                {
                    name: "orgPathName",
                    label: "组织路径",
                    width: "10%",
                    sortable: false,
                    search: true
                },
                {
                    name: "operTypeDesc",
                    label: "操作类型",
                    width: "10%",
                    sortable: false,
                    search: true
                },
                {
                    name: "operDateDesc",
                    label: "操作日期",
                    width: "10%",
                    sortable: false,
                    search: true
                },
                {
                    name: "operStaffName",
                    label: "操作人",
                    width: "10%",
                    sortable: false,
                    search: true
                },
                {
                    name: "operOrgName",
                    label: "所属组织",
                    width: "10%",
                    sortable: false,
                    search: true
                }],
                rowNum: 10,
                pager: true,
                server: true,
                multiselect: true,
                pageData: $.proxy(this.loadRuleMaps ,this)
            });
			
			this.ruleMapGrid.jqGrid("navButtonAdd",[{
				   title:"添加",
				   caption:"添加",
	                buttonicon:"glyphicon glyphicon-plus",
	                // cssprop:{"float":"right"},
	                //onClick:$.proxy(this.loadOrgs,this)
	            },{
					   title:"修改",
					   caption:"修改",
		                buttonicon:"glyphicon glyphicon-pencil",
		                // cssprop:{"float":"right"},
		                //onClick:$.proxy(this.loadOrgs,this)
		            },{
						   title:"删除",
						   caption:"删除",
			                buttonicon:"glyphicon glyphicon-remove",
			                // cssprop:{"float":"right"},
			                //onClick:$.proxy(this.loadOrgs,this)
			            }]);
			this.loadTacheCatalogs();
		},
		loadTacheCatalogs:function(){
			var me=this;
			me.tacheTree.blockUI({message: '加载中'}).data('blockui-content', true);
			utils.ajax("cloudIomServiceForWeb","getFlowTacheCatalog").done(function(tacheCatalogs){
				var tcs =JSON.parse(tacheCatalogs);
				$.each(tcs,function(index,tc){
					tc.isLeaf=false;
					tc.isParent=true;
					tc.loaded=false;
					tc.children=[];
				});
				me.tacheCatalogs=tcs;
				me.tacheTree.jqGrid("reloadData", tcs);
				me.tacheTree.jqGrid("setAllCheckDisabled",true);
			}).always(function(){
				me.tacheTree.unblockUI().data('blockui-content', false);
			});   
			
		},
		loadRules: function(page, rowNum, sortname, sortorder){
				var me =this;
				page = page || this.ruleGrid.grid("getGridParam", "page");
				rowNum = rowNum || this.ruleGrid.grid("getGridParam", "rowNum");
				var taches = this.tacheTree.grid("getCheckRows");
				if($.isArray(taches)){
					taches=_.filter(taches,function(o){
						return o.state=='10A';
					})
					if(taches){
						taches=_.pluck( taches,'id');
					}
				}else if(taches.state=='10A'){
					taches=[taches.id];
					
				}else{
					taches=null;
				}
				
				
				if(taches&&taches.length>0){
					me.ruleGrid.blockUI({message: '加载中'}).data('blockui-content', true);
					utils.ajax('cloudIomServiceForWeb','qryDispatchRulesPagging',taches,page,rowNum).done(function(pages){
						console.log(pages);
						me.ruleGrid.grid("reloadData", pages);
					}).always(function(){
						me.ruleGrid.unblockUI().data('blockui-content', false);
					});;
					
				}
				
				
			
		},
		loadRuleMaps: function(page, rowNum, sortname, sortorder){
			var me=this;
			
			page = page || this.ruleGrid.grid("getGridParam", "page");
			rowNum = rowNum || this.ruleGrid.grid("getGridParam", "rowNum");
			
			var rule =  me.ruleGrid.grid("getSelection");
			
			if(rule&&rule.id){
				me.ruleMapGrid.blockUI({message: '加载中'}).data('blockui-content', true);
				utils.ajax('cloudIomServiceForWeb','qryDispatchRuleMapsPagging',rule.id,page,rowNum).done(function(pages){
					
					me.ruleMapGrid.grid("reloadData", pages);
				}).always(function(){
					me.ruleMapGrid.unblockUI().data('blockui-content', false);
				});
			}
			
			
		},
		expandTacheCatalogRow:function(e,rowData){
			if(rowData.loaded){return;}
			//this.tacheTree.grid();
			console.log(rowData);
			var me=this,catalogId = rowData.id;
			me.tacheTree.blockUI({message: '加载中'}).data('blockui-content', true);
			
			utils.ajax('cloudIomServiceForWeb','getFlowTacheCatalogList',{catalogId:catalogId}).done(function(ret){
				ret = JSON.parse(ret);
				var taches = ret.rows;
				var validTaches = []
				$.each(taches, function(i, n) {
					if (n.state == '10A') {
						n.text = n.tacheName;
						n.isParent = false;
						n.isLeaf=true;
						validTaches.push(n);
					}
				});
				
				console.log(validTaches);
				if (validTaches.length > 0) {
					me.tacheTree.grid("addChildNodes", validTaches, rowData);
				}
			}).always(function(){
				me.tacheTree.unblockUI().data('blockui-content', false);
			});;
			rowData.loaded=true;
			
			this.tacheTree.grid('setCheckDisabled',[rowData.id],false);
		},
		addRule:function(){
			
			fish.popupView({url: 'modules/iom/dispatch/workorder/rule/views/WODispatchRuleInfoView',
				width: "60%",
				
				callback:function(popup,view){
					popup.result.then(function (e) {
						/*utils.ajax('isaService','addAgency',currentUser.staffId,e.agent.id,e.agent.text,e['agent-starttime'],e['agent-endtime'])
						.done(function(){
							fish.info('保存成功');
							getMyAgencyPerData();
							
						}).fail(function(e){
							console.log(e);
							fish.error(e);
						});*/
						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
			
		},
		editRule:function(){
			
			fish.popupView({url: 'modules/iom/dispatch/workorder/rule/views/WODispatchRuleInfoView',
				width: "60%",
				
				callback:function(popup,view){
					popup.result.then(function (e) {

						console.log(e);
					},function (e) {
						console.log('关闭了',e);
					});
				}
			});
			
		},
		deleteRule:function(){
			var me =this;
			var selected = me.ruleGrid.grid("getSelection");
			if(selected){
				fish.confirm("是否删除").result.done(function(){
					
					utils.ajax("cloudIomServiceForWeb","delete",selected.id).done(function(){
						me.loadRules();
						
					});
				});
			}
			
		},
		deleteRuleMap:function(){
			
			
		},
		resize:function(){
			
			this.tacheTree.grid("setGridHeight",((this.$('#dispatch-workorder-rulesmgr-tache-container').height()-40-35-this.$('#dispatch-workorder-rulesmgr-tachebar').outerHeight(true))+"px"));
			
			this.ruleGrid.grid("setGridHeight" ,(this.$('#dispatch-workorder-rulesmgr-rulesgrid-container').height()-80) +"px");
			
			this.ruleMapGrid.grid("setGridHeight" ,(this.$('#dispatch-workorder-rulesmgr-mappinggrid-container').height()-74) +"px");
			
			
			this.tacheTree.grid("resize",true);
			
			this.ruleGrid.grid("resize",true);
			
			this.ruleMapGrid.grid("resize",true);
			
		}
		
	});
});