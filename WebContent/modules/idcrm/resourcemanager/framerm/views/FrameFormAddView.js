define([
    'text!modules/idcrm/resourcemanager/framerm/templates/FrameFormAddView.html',
    'i18n!modules/idcrm/resourcemanager/framerm/i18n/framerm.i18n',
    'css!modules/idcrm/resourcemanager/framerm/styles/framerm.css',
    'modules/idcrm/common/moduleForm/views/ModuleForm',
    'modules/common/cloud-utils'
], function(frameFormAddViewTpl, i18nFramerm, css, moduleForm, utils) {
    return fish.View.extend({
        template: fish.compile(frameFormAddViewTpl),
        i18nData: fish.extend({}, i18nFramerm),
        events: {
            "click #framerm-frameFormAddView-confirm": "frameFormAddViewConfirmBtnClick" // 确定按钮
        },

        //这里用来进行dom操作
        _render: function() {
            var html=$(this.template(this.i18nData));
            var rowNums = new Array();
            for(var i=65; i<91; i++) {
                rowNums.push({"name": String.fromCharCode(i), "value": String.fromCharCode(i)});
            }
            html.find('#framerm-frameFormAddView-startRowId').combobox({
                placeholder: '选择起始行号...',
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: rowNums
            });
            html.find('#framerm-frameFormAddView-endRowId').combobox({
                placeholder: '选择终止行号...',
                dataTextField: 'name',
                dataValueField: 'value',
                dataSource: rowNums
            });
            this.$el.html(html);
            return this;
        },

        //这里用来初始化页面上要用到的fish组件
        _afterRender: function() {
            var me = this;
            moduleForm.init($('#framerm-frameFormAddView-form'),'framerm-frameFormAddView','RS_PAGE_FRAME_NEW',"insert");

            // 初始化表单中部分值
            fish.delay(me._init, 1000);
        },

        // 初始化
        _init: function() {
            $('#framerm-frameFormAddView-rsTypeId').combobox('disable');

            // 加载模板下拉框
            var params = {
                conditions: [{name:"rsTypeId", op: "EQUALS", value: "110001"}],
                pageIdx: 1,
                pageSize: 10000
            };
            utils.ajax('templateService', 'qryTemplateListByCond', params).done(function(ret){

                var tmplData = new Array();
                tmplData.push({"name": "选择模板...", "value": "-1"});
                $.each(ret.rows, function(i,n){
                    var tmpl = {"name": n.tmplName, "value": n.id};
                    tmplData.push(tmpl);
                });

                $('#framerm-frameFormAddView-templetId').combobox("option","dataSource", tmplData);

                $('#framerm-frameFormAddView-templetId').on('combobox:change', function () {
                    var tmplId = $('#framerm-frameFormAddView-templetId').combobox('value');

                    if("-1" != tmplId) {

                        // 查询模板配置
                        var tmplDetail = new Object();
                        utils.ajax('templateService','qryTemplateVo', tmplId).done(function(ret){
                            var detaillist = ret.detailList;
                            $.each(detaillist, function(i, n){
                                tmplDetail[n.entityCode] = n.entityValue;
                            });

                            // 剔除掉空值和templetId，模板里不允许配置templetId的值
                            tmplDetail = fish.omit(tmplDetail, function(value, key, object) {
                                return fish.isEmpty(value) && "templetId"!=key;
                            });
                            // 剔除掉模板templetId
                            tmplDetail=_.omit(tmplDetail, "templetId");

                            $('#framerm-frameFormAddView-form').form('value',tmplDetail);
                        });
                    }
                });

            });

        },
        // 确定按钮
        frameFormAddViewConfirmBtnClick: function() {
            var validFlag = $("#framerm-frameFormAddView-form").isValid();
            if(!validFlag) {
                return;
            }

            // 锁定页面
            if ($('#framerm-frameFormAddView-form').data('blockui-content')) {
                $('#framerm-frameFormAddView-form').unblockUI().data('blockui-content', false);
            } else {
                $('#framerm-frameFormAddView-form').blockUI({
                    message: '加载中......'
                }).data('blockui-content', true);
            }

            var popup = this.parentView.popup;

            var frameObj = $("#framerm-frameFormAddView-form").form("value")||{};

            frameObj.startRowId = frameObj.startRowId.charCodeAt();
            frameObj.endRowId = frameObj.endRowId.charCodeAt();
            if(frameObj.startRowId > frameObj.endRowId) {
                fish.warn("起始行号不能大于结束行号！");
                return;
            }
            if(frameObj.startRowId > frameObj.endRowId) {
                fish.warn("起始列号不能大于结束列号！");
                return;
            }

            frameObj.state="101001"; // 新建
            frameObj.useState="417003"; // 空闲
            frameObj.allocationStateId = "417001"; // 分配状态，默认为整柜分配
            frameObj.creatorId = currentUser.staffId;
            frameObj.updateId = currentUser.staffId;
            frameObj.userInfo = currentUser.staffName;
            frameObj.orgInfo = currentJob.orgPathName;

            utils.ajax('equiprmService',"insertFrame",frameObj).done(function(){
                fish.info('保存成功');
                // 解锁页面
                $('#framerm-frameFormAddView-form').unblockUI().data('blockui-content', false);
                popup.close(null);

            }).fail(function(e){
                    fish.error(e);
                });

        },
        resize: function() {
            var containerParentheight = $(".frame_mana_view_container").parent().parent().outerHeight();
            $("#framerm-frameFormAddView-form .panel-body").height($(window).height-230);

        }
    });
});