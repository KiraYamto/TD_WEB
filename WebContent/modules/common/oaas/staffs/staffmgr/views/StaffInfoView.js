define([
	'text!modules/common/oaas/staffs/staffmgr/templates/StaffInfoView.html',
	'i18n!modules/common/oaas/staffs/staffmgr/i18n/Staff.i18n',
	'modules/common/cloud-utils'
], function(viewTpl, i18n,utils) {
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		events: {
			"click #com-staffmgr-staffinfo-save":"_saveStaff"
		},
		_render: function() {
			
			this.$el.html(this.template(this.i18nData));
			if(this.options.staff){
				this.$('#com-staffmgr-staffinfo-password-col').remove();
				this.$('#com-staffmgr-staffinfo-comfirmpassword-col').remove();
				this.$("#com-staffmgr-staffinfo-job-col").remove();
				this.$("#com-staffmgr-staffinfo-job-isdefault-col").remove();
				
			}
			
			this.$('#com-staffmgr-staffinfo-valcommode').combobox();
			this.$('#com-staffmgr-staffinfo-nationId').combobox();
			
			
			
			return this;
		},
		_afterRender: function() {
			var me =this;
			this.$("#com-staffmgr-staffinfo-job-isdefault").switchbutton();
			if(me.options.staff){
				me.$('.panel-body').blockUI({message: '加载中'}).data('blockui-content', true);
				me.$('#com-staffmgr-staffinfo-save').attr('disabled','');
				utils.ajax("staffService","findByKeyNoPwd",me.options.staff.staffId).done(function(staff){
					me.staff=staff;
					me.$('#com-staffmgr-staffinfo-form').form('value', staff);
					console.log(staff);
					me.$('#com-staffmgr-staffinfo-save').removeAttr('disabled');
					me.$('.panel-body').unblockUI().data('blockui-content', false);
				});
				
			}
			
			if(this.options.org){
				this.$('#com-staffmgr-staffinfo-org').text( this.options.org.orgName);
				
				if(this.options.staff==null){
					me.$('.panel-body').blockUI({message: '加载中'}).data('blockui-content', true);
					utils.ajax("jobService","findByOrg",this.options.org.orgId).done(function(jobs){
						me.$("#com-staffmgr-staffinfo-job").combobox({
					        placeholder: '选择职位',
					        dataTextField: 'jobName',
					        dataValueField: 'jobId',
					        dataSource: jobs
					    });
						me.$('.panel-body').unblockUI().data('blockui-content', false);
						me.$('#com-staffmgr-staffinfo-form').form({
					        validate: 1
					    });
						
					});
				}
				else{
					this.$('#com-staffmgr-staffinfo-form').form({
				        validate: 1
				    });
				}
			}else{
				this.$('#com-staffmgr-staffinfo-form').form({
			        validate: 1
			    });
			}
		},
		_saveStaff:function(){
			if(this.$('#com-staffmgr-staffinfo-form').isValid()){
				var staff=this.$('#com-staffmgr-staffinfo-form').form('value');
				var popup=this.popup,me=this;
				if(this.staff){
					staff=_.extend(this.staff,staff);
					utils.ajax("staffService","updateNoPwd",staff).done(function(){
						fish.info("修改成功").result.always(function(){
							popup.close(true);
						});
						
					}).fail(function(){
						fish.info("修改失败").result.always(function(){
							popup.close(false);
						});
						
					});
				}
				else{
					staff=_.extend(staff,{
						effectDate:fish.dateutil.format(new Date(), 'yyyy-mm-dd hh:mm:ss'),
						expireDate:fish.dateutil.format(fish.dateutil.addYears(new Date(),30), 'yyyy-mm-dd hh:mm:ss'),
						updateDate:fish.dateutil.format(new Date(), 'yyyy-mm-dd hh:mm:ss'),
						workState: "1",
						state:"1"
					});
					
					var isde = $("#com-staffmgr-staffinfo-job-isdefault").data("uiSwitchbutton").options.state?"1":"0";
					utils.ajax("staffService","create",staff,this.options.org.orgId,me.$("#com-staffmgr-staffinfo-job").combobox('value'),isde).done(function(){
						fish.info("添加成功").result.always(function(){
							popup.close(true);
						});
						
						
						
					}).fail(function(){
						fish.info("添加失败").result.always(function(){
							popup.close(false);
						});
						
						
					});
				}
				
			}
		}
	
	});
});