define([
    	'text!modules/idcrm/resourcemanager/equrm/templates/NetEquipmentDetailView.html',
    	'i18n!modules/idcrm/resourcemanager/equrm/i18n/equip.i18n',
    	'modules/common/cloud-utils'
    ], function(FrameFormViewTpl, i18n,utils) {
    	return fish.View.extend({
    		template: fish.compile(FrameFormViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {    			
    		},
    		
    		//这里用来进行dom操作
    		_render: function() {
    			var html=$(this.template(this.i18nData));    			
    			this.$el.html(html);
    			return this;
    		},
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			var netEquip = this.options.netEquip;
    			this.queryEquipholder(netEquip.id);
    			var popup = this.popup;
    			var me = this;   			
    			
    		},
    		queryEquipholder:function(id){
    			var param={};
    			param["id"]=id;
    			var self =this;
    			utils.ajax('netEquipService', 'queryEquipholderByRsNetEquip',param).done(function(ret){
    				self.$el.find("#net-equip-form-detail-2").form("value", ret);
                });
    		}
    	});
    });