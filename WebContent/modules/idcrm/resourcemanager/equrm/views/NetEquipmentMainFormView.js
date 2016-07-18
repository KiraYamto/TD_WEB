define([
        'text!modules/idcrm/resourcemanager/equrm/templates/NetEquipmentMainFormView.html',
        'i18n!modules/idcrm/resourcemanager/equrm/i18n/NetEquipmentMain.i18n',
        'css!modules/idcrm/resourcemanager/equrm/styles/NetEquipmentMain',
        'modules/idcrm/common/moduleForm/views/ModuleForm',
        'modules/common/cloud-utils'
    ], function(netEquipMainHtml, i18nNetEquip,css,moduleForm,utils) {
        return fish.View.extend({
            template: fish.compile(netEquipMainHtml),
            i18nData: fish.extend({}, i18nNetEquip),
            events: {//事件对象的书写格式为 {'event selector': 'callback'}。 省略 selector 则事件被绑定到视图的根元素（this.el),可以用this.$el.trigger触发。
         
            },
            
            //这里用来进行dom操作
            _render: function() {
                this.$el.html(this.template(this.i18nData));        
                return this;
            },

            //这里用来初始化页面上要用到的fish组件
            _afterRender: function() {  
               var me = this;
               me.$('#netequip-main-tabs').tabs({
                  placement:'left',
                  activateOnce: true,
                  activate:$.proxy(me.requieTabContent,me)
               });
               this.addTabs();
            },

            addTabs:function(){
                var me = this;
                fish.each(me.getTabDatas(),function(item) {
                   if(item.show == true){
                      me.$('#netequip-main-tabs').tabs('add', {
                         id : item.id,
                         label : item.name,
                         active: item.active
                      });
                   }
                });
            },

            requieTabContent: function(e,ui){
               var me = this;
               var tabId = ui.newPanel.attr('id');
               var tabData = fish.find(me.getTabDatas(),function(item){
                  return item.id == tabId;
               });
               if(tabData){
                   me.requireView({
                           selector: '#'+tabData.id,
                           viewOption:tabData.viewOption,//tabData.viewOption,
                           url: tabData.url
                   });
                 }
            },

            getTabDatas: function(){
              var me = this;
              var tabDatas = [];
              var baseOpts = {action:me.options.action};
              if(this.options && this.options.selectedEquip){
            	  baseOpts.id = this.options.selectedEquip.id;
            	  baseOpts.resTypeId = this.options.selectedEquip.rsTypeId;
            	  baseOpts.netEquip = this.options.selectedEquip;
              }
              
              var baseInfoTab = {
                 id:'baseInfo',
                 name:'基本信息',
                 url:'modules/idcrm/resourcemanager/equrm/views/NetEquipmentBaseFormView',
                 viewOption:baseOpts,//me.options,
                 active:true,
                 show:true
              };
              tabDatas.push(baseInfoTab);

              var netEquipBoardTab = {
                 id:'netEquipBoard',
                 name:'槽位管理',
                 url:'modules/idcrm/resourcemanager/equrm/views/NetEquipmentBoardView',
                 viewOption:baseOpts,//{action:"detail.equipNetMod",netEquip:this.options.selectedEquip},
                 active:false,
                 show:(me.options.action == 'modify' || me.options.action == 'detail')?true:false
              };
              tabDatas.push(netEquipBoardTab);

              var netEquipPortTab = {
                 id:'netEquipPort',
                 name:'端口管理',
                 url:'modules/idcrm/resourcemanager/portrm/views/portView',
                 viewOption:baseOpts,//{action:"detail.equipNetPort",netEquipment:this.options.selectedEquip},
                 active:false,
                 show:(me.options.action == 'modify' || me.options.action == 'detail')?true:false
              };
              tabDatas.push(netEquipPortTab);
              
              var ipaddressTab = {
                      id:'ipaddress',
                      name:'IP地址',
                      url:'modules/idcrm/serverequipment/views/IPAddressFormView',
                      viewOption:baseOpts,//{action:"detail.equipNetPort",id:this.options.selectedEquip.id,resTypeId:this.options.selectedEquip.rsTypeId},
                      active:false,
                      show:(me.options.action == 'modify' || me.options.action == 'detail')?true:false
                   };
              tabDatas.push(ipaddressTab);

              return tabDatas;
            }
        });
    });
