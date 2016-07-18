define([
    'text!modules/idcrm/resourcemanager/framerm/templates/FrameFormMainView.html',
    'i18n!modules/idcrm/resourcemanager/framerm/i18n/framerm.i18n',
    'css!modules/idcrm/resourcemanager/framerm/styles/framerm.css',
    'modules/common/cloud-utils'
], function(frameFormMainViewTpl, i18nFramerm, css, utils) {
    return fish.View.extend({
        template: fish.compile(frameFormMainViewTpl),
        i18nData: fish.extend({}, i18nFramerm),
        events: {

        },

        //这里用来进行dom操作
        _render: function() {
            this.$el.html(this.template(this.i18nData));
            return this;
        },

        //这里用来初始化页面上要用到的fish组件
        _afterRender: function() {
            var me = this;
            me.$('#frameFormMainView-tabs').tabs({
                placement:'left',
                activateOnce: true,
                activate:$.proxy(me.requieTabContent,me)
            });

            if('insert' == me.options.actionType) {
                me.$('#frameFormMainView-title').text("新增机架");
            } else if('modify' == me.options.actionType) {
                me.$('#frameFormMainView-title').text("修改机架");
            } else {
                me.$('#frameFormMainView-title').text("机架信息");
            }

            this.addTabs();
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
                    viewOption: me.options,
                    url: tabData.url
                });
            }
        },
        addTabs:function(){
            var me = this;
            fish.each(me.getTabDatas(),function(item) {
                if(item.show == true){
                    me.$('#frameFormMainView-tabs').tabs('add', {
                        id : item.id,
                        label : item.name,
                        active: item.active
                    });
                }
            });

        },
        getTabDatas: function(){
            var me = this;
            var tabDatas = [];
            var frameFormAddView = {
                id:'frameFormAddView',
                name:'基本信息',
                url:'modules/idcrm/resourcemanager/framerm/views/FrameFormAddView',
                active:true,
                show:me.options.actionType == 'insert'?true:false
            };

            var frameFormModView = {
                id:'frameFormModView',
                name:'基本信息',
                url:'modules/idcrm/resourcemanager/framerm/views/FrameFormModView',
                active:false,
                show:me.options.actionType == 'modify'?true:false
            };

            var frameUnitFormView = {
                id:'frameUnitFormView',
                name:'机位',
                url:'modules/idcrm/resourcemanager/framerm/views/FrameUnitFormView',
                active:false,
                show:me.options.actionType == 'modify'?true:false
            };

            tabDatas.push(frameFormAddView);
            tabDatas.push(frameFormModView);
            tabDatas.push(frameUnitFormView);
            return tabDatas;
        }
    });
});