define([
        'text!modules/idcrm/serverequipment/templates/ServerEquipMainFormView.html',
        'i18n!modules/idcrm/serverequipment/i18n/ServerEquipMainFormView.i18n',
        'css!modules/idcrm/serverequipment/styles/ServerEquipMainForm',
        'modules/common/cloud-utils'
    ], function(serverEquipMainFormHtml, i18nServerEquip,css,utils) {
        return fish.View.extend({
            template: fish.compile(serverEquipMainFormHtml),
            i18nData: fish.extend({}, i18nServerEquip),
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
               me.$('#serverequip-main-tabs').tabs({
                  placement:'left',
                  //只触发一次activate方法
                  activateOnce: true,
                  activate:$.proxy(me.loadTabContent,me)
               });
               this.addTabs();
            },

            addTabs:function(){
                var me = this;
                fish.each(me.getTabDatas(),function(item) {
                   if(item.show == true){
                      me.$('#serverequip-main-tabs').tabs('add', {
                         id : item.id,
                         label : item.name,
                         active: item.active
                      });
                   }
                }); 
            },

            loadTabContent: function(e,ui){
               var me = this;
               var tabId = ui.newPanel.attr('id');
               var tabData = fish.find(me.getTabDatas(),function(item){
                  return item.id == tabId;
               });

              //加载tab选项卡内容
              if(tabData){
                   me.requireView({
                      selector: '#'+tabData.id,
                      viewOption: me.options,
                      url: tabData.url
                   });
              }
            },

            getTabDatas: function(){
              var me = this;
              var tabDatas = [];
              var serverEquipBaseTab = {
                 id:'serverEquipBase',
                 name:'基本信息',
                 url:'modules/idcrm/serverequipment/views/ServerEquipBaseFormView',
                 active:true,
                 show:true
              };

              tabDatas.push(serverEquipBaseTab);

              var networkCardTab = {
                 id:'networkCard',
                 name:'网卡/HBA',
                 url:'modules/idcrm/serverequipment/views/NetworkCardFormView',
                 active:false,
                 show:(me.options.action == 'modify' || me.options.action == 'detail')?true:false
              };
              tabDatas.push(networkCardTab);

              var relaStorageTab = {
                 id:'relaStorage',
                 name:'关联存储',
                 url:'modules/idcrm/serverequipment/views/RelaStorageFormView',
                 active:false,
                 show:(me.options.action == 'modify' || me.options.action == 'detail')?true:false
              };
              tabDatas.push(relaStorageTab);

              var ipaddressTab = {
                 id:'ipaddress',
                 name:'IP地址',
                 url:'modules/idcrm/serverequipment/views/IPAddressFormView',
                 active:false,
                 show:(me.options.action == 'modify' || me.options.action == 'detail')?true:false
              };
              tabDatas.push(ipaddressTab);

              var nettopologyTab = {
                 id:'nettopology',
                 name:'网络拓扑',
                 url:'modules/idcrm/serverequipment/views/NetTopologyFormView',
                 active:false,
                 show:(me.options.action == 'modify' || me.options.action == 'detail')?true:false
              };
              tabDatas.push(nettopologyTab);

              var virtualMachineTab = {
                 id:'virtualMachine',
                 name:'虚拟机',
                 url:'modules/idcrm/serverequipment/views/VirtualMachineFormView',
                 active:false,
                 show:(me.options.action == 'modify' || me.options.action == 'detail')?true:false
              };
              tabDatas.push(virtualMachineTab);
              return tabDatas;
            }
        });
    });
