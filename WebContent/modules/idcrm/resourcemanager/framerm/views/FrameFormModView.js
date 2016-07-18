define([
    'text!modules/idcrm/resourcemanager/framerm/templates/FrameFormModView.html',
    'i18n!modules/idcrm/resourcemanager/framerm/i18n/framerm.i18n',
    'css!modules/idcrm/resourcemanager/framerm/styles/framerm.css',
    'modules/idcrm/common/moduleForm/views/ModuleForm',
    'modules/common/cloud-utils'
], function(frameFormModViewTpl, i18nFramerm, css, moduleForm, utils) {
    return fish.View.extend({
        template: fish.compile(frameFormModViewTpl),
        i18nData: fish.extend({}, i18nFramerm),
        events: {
            "click #framerm-frameFormModView-confirm": "frameFormModViewConfirmBtnClick"
        },

        //这里用来进行dom操作
        _render: function() {
            this.$el.html(this.template(this.i18nData));
            return this;
        },

        //这里用来初始化页面上要用到的fish组件
        _afterRender: function() {

            // 加载页面控件
            moduleForm.init(this.$('#framerm-frameFormModView-form'),'framerm-frameFormModView','CABINET_RS',this.options.actionType);

		    // 锁定页面
            this.lockPage();
	    
            // 加载机柜数据
            fish.delay($.proxy(this.initFormDetail, this), 3000);

        },

        initFormDetail: function() {
            var me = this;

            // 加载模板下拉框
            var params = {
                conditions: [{name:"rsTypeId", op: "EQUALS", value: "110001"}],
                pageIdx: 1,
                pageSize: 10000
            };
            utils.ajax('templateService', 'qryTemplateListByCond', params).done(function(ret){

                var tmplData = new Array();
                $.each(ret.rows, function(i,n){
                    var tmpl = {"name": n.tmplName, "value": n.id};
                    tmplData.push(tmpl);
                });

                $('#framerm-frameFormModView-templetId').combobox("option","dataSource", tmplData);
                $('#framerm-frameFormModView-templetId').combobox('value', tmplData.templetId);

            });

            // 加载机柜详情
            utils.ajax('equiprmService', 'findFrameDetail', me.options.frameId).done(function (ret) {

                if(!fish.isEmpty(ret.installDate)) {
                    ret.installDate = ret.installDate.substr(0,19); // 从数据库取出多了.X，需要去掉，否则时间控件认不了
                }
                $('#framerm-frameFormModView-form').form("value", ret);
                me.options.frameDtoFromDb = ret;

                // 解锁页面
                me.unlockPage();
            });
        },
        frameFormModViewConfirmBtnClick: function() {
            var validFlag = $("#framerm-frameFormModView-form").isValid();
            if(!validFlag) {
                return;
            }

            var me = this;
            var frameObj = $("#framerm-frameFormModView-form").form("value")||{};
            frameObj = fish.extend(me.options.frameDtoFromDb, frameObj);

            utils.ajax('equiprmService',"updateFrame",frameObj).done(function(){
                fish.info('保存成功');
                // 解锁页面
                me.unlockPage();
            }).fail(function(e){
                    fish.error(e);
                });
        },

        // 锁定页面
        lockPage: function() {
            if ($('#framerm-frameFormModView-form').data('blockui-content')) {
                $('#framerm-frameFormModView-form').unblockUI().data('blockui-content', false);
            } else {
                $('#framerm-frameFormModView-form').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }
        },

        // 解锁页面
        unlockPage: function() {
            $('#framerm-frameFormModView-form').unblockUI().data('blockui-content', false);
        }
    });
});