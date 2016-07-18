define([
	'text!modules/common/oaas/orgs/orgmgr/templates/OrgInfoView.html',
	'i18n!modules/common/oaas/orgs/orgmgr/i18n/Org.i18n',
	'modules/common/cloud-utils'
], function(viewTpl, i18n,utils) {
	return fish.View.extend({
		template: fish.compile(viewTpl),
		i18nData: fish.extend({}, i18n),
		events: {
			"click #com-orgmgr-orginfo-save":"saveOrg"
		},
		_render: function() {
			
			this.$el.html(this.template(this.i18nData));
			
			this.$('#com-orgmgr-orginfo-effectDate').datetimepicker({
			});
			
			this.$('#com-orgmgr-orginfo-expireDate').datetimepicker({
			});

			if(this.options.parentOrg){
				this.$('#com-orgmgr-orginfo-parentorg').text( this.options.parentOrg.orgName);
			}
			
			
			this.$('#com-orgmgr-orginfo-orgarea').popedit({
				dataTextField :'text',
				dataValueField :'id',
				dialogOption: {
					height: 400,
					width: 500,
					viewOptions:{
						orgId:101,
						orgPathName:'啦啦啦'
					}
				},
				url:'js!modules/common/popeditviews/areas/views/SelectAreaByAreaIdView',
				showClearIcon:false
			});
			
			return this;
		},
		_afterRender: function() {
			var me =this;
			me.$('.panel-body').blockUI({message: '加载中'}).data('blockui-content', true);
			this.renderOrgTmps().done(
				function(){
					me.$('#com-orgmgr-orginfo-form').form({
				        validate: 1
				    });
					
					if(me.options.org){
						me.$('#com-orgmgr-orginfo-form').form('value', me.options.org);
					}
					me.$('.panel-body').unblockUI().data('blockui-content', false);
					
				}		
			);
			
		},
		renderOrgTmps:function(){
			var me = this;
			if(this.options.parentOrg.orgTmpId==0){
				return utils.ajax("orgTmplateService","findTopOrgTmps").done(function(orgTmpls){
					
					me.$("#com-orgmgr-orginfo-orgTmp").combobox({
				        placeholder: '请选择职位模板',
				        dataTextField: 'orgTmpName',
				        dataValueField: 'orgTmpId',
				        dataSource: orgTmpls
				    });
					
				});
				
			}else{
				
				return utils.ajax("orgTmplateService","findByParent",this.options.parentOrg.orgTmpId).done(function(orgTmpls){
					me.$("#com-orgmgr-orginfo-orgTmp").combobox({
				        placeholder: '请选择职位模板',
				        dataTextField: 'orgTmpName',
				        dataValueField: 'orgTmpId',
				        dataSource: orgTmpls
				    });
					
					
				});
			}
			
		},
		
		saveOrg:function(){
			
		}
	
	});
});