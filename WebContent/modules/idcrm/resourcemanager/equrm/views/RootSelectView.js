define([
	'text!modules/idcrm/resourcemanager/equrm/templates/RoomSelectView.html',
	'i18n!modules/idcrm/resourcemanager/equrm/i18n/equip.i18n',
	'modules/common/cloud-utils',
    'css!modules/idcrm/resourcemanager/equrm/styles/netEquipment.css'
], function(frameViewTpl, i18nEquip,utils, css) {
	return fish.View.extend({
		template: fish.compile(frameViewTpl),
		i18nData: fish.extend({}, i18nEquip),
		events: {            
		},
		
		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},

		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {			
            this.loadTreeRender();	
            var popup = this.popup;
            this.$el.on('click', '#save-button', function(e) {				
            	var nodes =  $("#equip_room_tree").tree("getSelectedNodes");
                if (nodes.length == 0 || nodes.length > 1 ) {
                    fish.info("请先选择一个节点!");
                    return;
                }
                var node = nodes[0];
                if(node.tag !='dcRoom'){
                	fish.info("请选择一个机房!");
                    return;
                }
				popup.close(node);
			});
		},
        // 加载导航树
        loadTreeRender: function() {
            utils.ajax('equiprmService', 'findFrameTree', true, false).done(function(ret){
                var options = {
                    view: {
                        showLine: false
                    },
                    data: {
                        simpleData: {
                            enable: true
                        }
                    },
                    fNodes: ret,
                    callback: {                        
                    }
                };
                $("#equip_room_tree").tree(options);
                $("ul.ztree","#equip_room_tree").css("height","400px");
            });
        }
	});
});