define([
	'text!modules/common/oaas/staffs/staffmgr/templates/StaffJobOrgMgrView.html',
	'i18n!modules/common/oaas/staffs/staffmgr/i18n/Staff.i18n',
	'modules/common/cloud-utils',
	'css!modules/common/oaas/staffs/staffmgr/styles/staffmgr.css'
	
], function(viewTpl, i18n,utils) {
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		events: {
			"click .list-group-item":"chooseJob",
			"click .list-group-item .close":"removeJob",
			"click #com-staffmgr-staffjoborg-addjob":"addJob",
			"click #com-staffmgr-staffjoborg-save":"saveJob"
		},
		_render: function() {
			
			this.$el.html(this.template(this.i18nData));
			var options = {
					data : {
						key : {
							name : 'text',
							iconFontEnable: true
						},
						simpleData : {
							enable : true,
							pIdKey : 'parentId'
						},
						keep : {
							parent : true,
							leaf : true
						}
					},
					callback : {

						onCollapse : $.proxy(this.onCollapse, this),
						onExpand : $.proxy(this.onExpand, this)
					},check: {
		                enable: true,
		                chkStyle: "checkbox",
		                chkboxType:  { "Y" : "ps", "N" : "ps" } // Y 属性定义 checkbox 被勾选后的情况； N 属性定义 checkbox 取消勾选后的情况； "p" 表示操作会影响父级节点； "s" 表示操作会影响子级节点。
		            },heigth:"400px",
					fNodes : []
				};
				this.$tree = this.$("#com-staffmgr-staffjoborg-joborg-tree").tree(options);
				
			return this;
		},
		
		_afterRender: function() {
			this.loadJobOrgs();
			this.loadStaffJob();
				this.$(".ztree").css("height","400px");
				return this;
			},
			onCollapse : function(event, treeNode) {

			},
			onExpand : function(event, treeNode) {
				var me = this;
				
				if (!treeNode.isLoad) {
					treeNode.isLoad = true;
					if(treeNode.type == 0){
						utils.ajax('jobService', 'qryOrgJobTreeByParentId',
								treeNode.orgId).done(
								function(ret) {
									var treeInstance = me.$tree
											.tree("instance");
		
									if (ret)
										$.each(ret, function(i, n) {
											if (n.type == 2 ) {
												n.iconSkin="glyphicon glyphicon-user";
												n.isParent = false;
											} else if(n.type == 1){
												n.iconSkin="glyphicon glyphicon-hand-right";
												n.isParent = false;
											} else {
												n.iconSkin="glyphicon glyphicon-home";
												n.isParent = true;
											}
		
										});
									treeInstance.addNodes(treeNode, ret);
								});
						me.$(".ztree").css("height","400px");
					}
				}
			},
			addJob:function(e){
				var addingNodes = this.$tree.tree("getCheckedNodes", true),me=this;
				if(addingNodes.length>0){
					
					addingNodes= _.filter(addingNodes,function(node){ return node.isParent!=true;});
					$.each(addingNodes,function(i,job){
						var existJ = _.find(me.jobs,function(j){return j.jobId==job.jobId});
						if(existJ==null){
							me.jobs.push({
								orgId: job.orgId,
								orgPathName: job.orgPathName,
								jobId: job.jobId,
								jobName: job.jobName,
								isBasic:"0"
							});
						}
						
					});
					
					this._renderJobs(this.jobs);
				}
				
			},
			saveJob:function(){
				
				var jobIdStr =[],isBasic=[],popup=this.popup;
				
				$.each(this.jobs,function(i,job){
					jobIdStr.push(job.jobId);
					if(job.isBasic=="1"){
						
						isBasic.push("1");
					}
					else{
						isBasic.push("0");
					}
					
				});
				
				utils.ajax("staffService","updateJobs",this.options.staff.staffId,jobIdStr,isBasic).done(function(){
					fish.info("修改职位成功").result.always(function(){
						popup.close();
						
						
					});
					
					
				});
			},
			chooseJob:function(e){
				
				var jobId = $(e.currentTarget).data("jobid");
				
				$.each(this.jobs,function(i,job){
						if(job.jobId == jobId){
							
							job.isBasic="1";
						}
						else{
							job.isBasic="0";
						}
					});
				
				this._renderJobs(this.jobs);
				
			},
			
			removeJob:function(e){
				if(this.jobs==null||this.jobs.length<=1)return false;
				
				var jobId = $(e.currentTarget).data("jobid"),
				job = _.find(this.jobs, function(job){ return job.jobId == jobId; }); 
				if(job){
					this.jobs=_.without(this.jobs, job);
					
					this._renderJobs(this.jobs);
				}
				return false;
			},
			loadJobOrgs:function(){
				var me =this;
				me.$tree.blockUI({message: '加载中'}).data('blockui-content', true);
				return utils.ajax('jobService', 'qryOrgJobTreeByParentId', 0).done(
						function(ret) {
							if (ret)
								$.each(ret, function(i, n) {
									if (n.leaf == 2) {
										n.iconSkin="glyphicon glyphicon-user";
										n.isParent = false;
									} else {
										n.iconSkin="glyphicon glyphicon-home";
										n.isParent = true;
									}
								});
							me.$tree.unblockUI().data('blockui-content', false);
							me.$tree.tree('reloadData', ret);
							me.$(".ztree").css("height","400px");
						});
			},
			loadStaffJob:function(){
				var renderJobs = $.proxy(this._renderJobs,this),me=this; 
				if(this.options.staff){
					
					utils.ajax('jobService', 'findByStaff',this.options.staff.staffId,false).done(function(jobs){
						me.orginalJobs=jobs;
						me.jobs=_.union([],jobs);
						
						renderJobs(jobs);
					});
					
				}
			},
			_renderJobs:function(jobs){
				var me =this;
				me.$("#com-staffmgr-staffjoborg-joborg-joblist").empty();
				$.each(jobs,function(i,job){
					me.$("#com-staffmgr-staffjoborg-joborg-joblist")
					.append('<a class="list-group-item '+(job.isBasic=='1'?"active":"")+' " data-jobid="'+job.jobId+'"><span class="badge isdefault">默认</span><span class="close" data-jobid="'+job.jobId+'">x</span>'
								            	+'<h4 class="list-group-item-heading">'+job.jobName+'</h4><p class="list-group-item-text">'+job.orgPathName+'</p></a>');
					
				});
			}
	
	});
});