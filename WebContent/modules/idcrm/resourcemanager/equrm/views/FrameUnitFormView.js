define([
    	'text!modules/idcrm/resourcemanager/equrm/templates/FrameUnitFormView.html',
    	'i18n!modules/idcrm/resourcemanager/equrm/i18n/equip.i18n',
    	'modules/common/cloud-utils'
    ], function(FrameUnitFormViewTpl, i18n,utils) {
    	return fish.View.extend({
    		template: fish.compile(FrameUnitFormViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {

    		},
    		
    		//这里用来进行dom操作
    		_render: function() {
    			var html=$(this.template(this.i18nData));

    			html.find('#frame-form').form();
    			this.$el.html(html);

    			return this;
    		},
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			var popup = this.popup;
    			var me = this;
                var frameUnitId = this.options.frameUnitId;
                var frameCode = this.options.frameCode;
                var actionType = this.options.actionType;

                // 不是新增或编辑，则是查看
                if("add" != actionType && "mod" != actionType) {
                    $('#frame-form').form('disable');
                    utils.ajax('equiprmService', 'findFrameUnitDetail', frameUnitId).done(function (frameUnitObj) {
                        if(frameCode) {
                            frameUnitObj.frameCode=frameCode;
                        }
                        $('#frame-form').form('value', frameUnitObj);
                    });
                }

    			this.$el.on('click', '#save-button', function(e) {

                    // 不是新增或编辑，则是查看
                    if("add" != actionType && "mod" != actionType) {
                        popup.close(ret);
                        return;
                    }

    				var ret = me.$('#frame-form').form('value')||{};

                    if(ret.id == null) {
                        ret.state="新建";
                    }

                    ret.templetId = $("#selTemplet").val();
                    ret.creatorId = currentUser.staffId;
                    ret.updateId = currentUser.staffId;

                    utils.ajax('equiprmService','insertOrUpdateFrameUnit', ret).done(function(){
                        fish.info('保存成功');

                    }).fail(function(e){
                            fish.error(e);
                        });

    				// ret.agent=me.$('#agent').data('uiPopedit').getValue();
    				popup.close(ret);
    			});
    			
    			
    		}
    	});
    });