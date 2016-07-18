define([
    	'text!modules/idcrm/resourcemanager/portrm/templates/PortModFormView.html',
    	'i18n!modules/idcrm/resourcemanager/portrm/i18n/port.i18n',
    	'modules/common/cloud-utils'
    ], function(PortFormViewTpl, i18n,utils) {
    	return fish.View.extend({
    		template: fish.compile(PortFormViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {

    		},
    		
    		//这里用来进行dom操作
    		_render: function() {
    			var html=$(this.template(this.i18nData));
    			
    			//html.find('#port_mod_form').form();
    			this.$el.html(html);
    			return this;
    		},
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			var popup = this.popup;
    			var me = this;

    			
    			
    			
    			//速率
    			utils.ajax('iRsPortService', 'findRate').done(function (ret) {
    				ret = JSON.parse(ret);
    				var $combobox1 = $('#port_mod_rateId').combobox({
    					placeholder: '请选择速率值',
    					dataValueField:'code',
    					dataTextField: 'value',
    					dataSource: ret
    				});
    			});
    			//共享方式
    			utils.ajax('iRsPortService', 'findShareType').done(function (ret) {
    				ret = JSON.parse(ret);
    				var $combobox1 = $('#port_mod_allocationType').combobox({
    					placeholder: '请选择共享方式',
    					dataValueField:'code',
    					dataTextField: 'value',
    					dataSource: ret
    				});
    			});
    			//所属模块
    			var equipId=this.options.portModNetEquipment.id;
    			
    			utils.ajax('netEquipBoardService', 'findBoardByEquipId',equipId).done(function (ret) {
    				ret = JSON.parse(ret);
    				var $combobox1 = $('#port_mod_form_boardId').combobox({
    					placeholder: '请选择可用槽位',
    					dataValueField:'value',
    					dataTextField: 'code',
    					dataSource: ret
    				});
    			});
    			
    			//业务状态
    			utils.ajax('iRsPortService', 'findBusinessState').done(function (ret) {
    				ret = JSON.parse(ret);
    				var $combobox1 = $('#port_mod_useState').combobox({
    			        placeholder: '请选择业务状态',
    			        dataValueField:'code',
    			        dataTextField: 'value',
    			        dataSource: ret
    			    });
    		    });
    			
    			var selectedPort = this.options.selectedPort;
    			$("#port_mod_form").form("value",selectedPort );
    			
    			
    			this.$el.on('click', '#save-button', function(e) {
    				var ret = me.$('#port_mod_form').form('value')||{};

    				if(ret.id==null || ret.id==""){
    					ret.id = -1;
    				}	
                    ret.creatorId = currentUser.staffId;
                    ret.updateId = currentUser.staffId;

                    utils.ajax('iRsPortService','insertOrUpdate',ret).done(function(){
                        fish.info('修改成功');

                    }).fail(function(e){
                            fish.error(e);
                        });

    				// ret.agent=me.$('#agent').data('uiPopedit').getValue();
    				popup.close(ret);
    			});
    			
    			
    		}
    		
    	});
    });

