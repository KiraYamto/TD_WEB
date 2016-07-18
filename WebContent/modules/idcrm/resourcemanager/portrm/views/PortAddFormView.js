define([
    	'text!modules/idcrm/resourcemanager/portrm/templates/PortAddFormView.html',
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

    			var eqName=this.options.portAddNetEquipment.eqName;
    			html.find("#port_add_equipmentId").val(eqName);

    			html.find('#port-form').form();
    			this.$el.html(html);

    			return this;
    		},
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			var popup = this.popup;
    			var me = this;
    			var equipmentId=this.options.portAddNetEquipment.id;
    			var roomId = this.options.portAddNetEquipment.roomId;
    			this.$el.on('click', '#save-button', function(e) {
    				var ret = me.$('#port-form').form('value')||{};

/*    				if(ret.id==null || ret.id==""){
    					ret.id = -1;
    				}	
    				
*/                  ret.creatorId = currentUser.staffId;
                    ret.updateId = currentUser.staffId;
                    ret.equipmentId = equipmentId;
                    ret.roomId = roomId;
                    utils.ajax('iRsPortService','batchInsert',ret).done(function(){
                        fish.info('保存成功');

                    }).fail(function(e){
                            fish.error(e);
                        });

    				// ret.agent=me.$('#agent').data('uiPopedit').getValue();
    				popup.close(ret);
    			});
    			
    			
    			//速率
    			utils.ajax('iRsPortService', 'findRate').done(function (ret) {
    				ret = JSON.parse(ret);
    				var $combobox1 = $('#port_add_rateId').combobox({
    					placeholder: '请选择速率值',
    					dataValueField:'code',
    					dataTextField: 'value',
    					dataSource: ret
    				});
    			});
    			//共享方式
    			utils.ajax('iRsPortService', 'findShareType').done(function (ret) {
    				ret = JSON.parse(ret);
    				var $combobox1 = $('#port_add_allocationType').combobox({
    					placeholder: '请选择共享方式',
    					dataValueField:'code',
    					dataTextField: 'value',
    					dataSource: ret
    				});
    			});
    			//所属模块
    			var equipId=this.options.portAddNetEquipment.id;
    			
    			utils.ajax('netEquipBoardService', 'findBoardByEquipId',equipId).done(function (ret) {
    				ret = JSON.parse(ret);
    				var $combobox1 = $('#port_add_form_boardId').combobox({
    					placeholder: '请选择可用槽位',
    					dataValueField:'value',
    					dataTextField: 'code',
    					dataSource: ret
    				});
    			});
    			
    			//业务状态
    			utils.ajax('iRsPortService', 'findBusinessState').done(function (ret) {
    				ret = JSON.parse(ret);
    				var $combobox1 = $('#port_add_useState').combobox({
    			        placeholder: '请选择业务状态',
    			        dataValueField:'code',
    			        dataTextField: 'value',
    			        dataSource: ret
    			    });
    		    });
    			
    		}
    		
    		
    		
    		
    	});
    });

