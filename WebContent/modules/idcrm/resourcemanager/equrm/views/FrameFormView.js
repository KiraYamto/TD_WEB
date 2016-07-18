define([
    	'text!modules/idcrm/resourcemanager/equrm/templates/FrameFormView.html',
    	'i18n!modules/idcrm/resourcemanager/equrm/i18n/equip.i18n',
    	'modules/common/cloud-utils'
    ], function(FrameFormViewTpl, i18n, utils) {
    	return fish.View.extend({
    		template: fish.compile(FrameFormViewTpl),
    		i18nData: fish.extend({}, i18n),
    		events: {

    		},
    		//这里用来进行dom操作
    		_render: function() {
    			var html=$(this.template(this.i18nData));
                html.find('#frameFormSelTemplet').combobox({
                    placeholder: '选择模板...',
                    dataTextField: 'name',
                    dataValueField: 'value',
                    dataSource: []
                });

                html.find('#frameFormSelTemplet').on('combobox:change', function () {
                    var tmplId = html.find('#frameFormSelTemplet').combobox('value');
                    if("-1" != tmplId) {
                        // 查询模板配置
                        var tmplDetail = new Object();
                        utils.ajax('templateService','qryTemplateVo', tmplId).done(function(ret){
                            var detaillist = ret.detailList;
                            $.each(detaillist, function(i, n){
                                tmplDetail[n.entityCode] = n.entityValue;
                            });
                            html.find('#frame-form').form('value',tmplDetail);

                        });
                    }
                });

    			html.find('#frame_productionDate').datetimepicker({
    				endDate: fish.dateutil.addDays(new Date(), 10)
    			});

    			html.find('#frame-form').form();
    			this.$el.html(html);

    			return this;
    		},
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
    			var popup = this.popup;
    			var me = this;
                var frameId = this.options.frameId;
                var actionType = this.options.actionType;

                var methodName = null;;
                if("add" == actionType) {
                    methodName = "insertFrame";
                    $("#frameFormView_col_frameName").hide();
                    $("#frameFormView_col_frameCode").hide();
                } else if("mod" == actionType) {
                    methodName = "updateFrame";
                    $("#frameFormSelTemplet").combobox('disable');
                    $("#frame_allocationStateId").combobox('disable');
                    $("#frame_unitNum").attr("disabled", "disabled");
                    $("#frameFormView_frameName").attr("disabled", "disabled");
                    $("#frameFormView_frameCode").attr("disabled", "disabled");
                }

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

                    $('#frameFormSelTemplet').combobox("option","dataSource", tmplData);
                });

                // 加载机柜信息
                if(null != frameId) {

                    // 如果传过来的id不为空，则为查看或编辑，加载机柜信息
                    utils.ajax('equiprmService', 'findFrameDetail', frameId).done(function (ret) {

                        $("#frameFormSelTemplet").combobox('value', ret.templetId+"");

                        $("#frame-form").form('value', ret);

                        $("#frame_startRowId").val(ret.rowId);
                        $("#frame_endRowId").val(ret.rowId);
                        $("#frame_startColumnId").val(ret.columnId);
                        $("#frame_endColumnId").val(ret.columnId);
                        $("#frame_productionDate").datetimepicker("value", ret.productionDate);

                        // 如果不是修改命令，则不可修改
                        if("mod" != actionType) {
                            $("#frame-form").form('disable');
                        }
                    });
                }

    			this.$el.on('click', '#save-button', function(e) {
                    if(null == methodName) {
                        popup.close(null);
                        return;
                    }

    				var ret = me.$('#frame-form').form('value')||{};
                    if(ret.startRowId > ret.endRowId) {
                        fish.warn("起始行号不能大于结束行号！");
                        return;
                    }
                    if(ret.startRowId > ret.endRowId) {
                        fish.warn("起始列号不能大于结束列号！");
                        return;
                    }

                    if(null != frameId) {
                        ret.id=frameId;
                    } else {
                        ret.state="101001"; // 新建
                        ret.allocationStateId = "417003"; // 分配状态，默认为未分配
                    }

                    ret.templetId = $("#frameFormSelTemplet").combobox('value');
                    ret.creatorId = currentUser.staffId;
                    ret.updateId = currentUser.staffId;

                    ret.userInfo = currentUser.staffName;
                    ret.orgInfo = currentJob.orgPathName;

                    utils.ajax('equiprmService',methodName,ret).done(function(){
                        fish.info('保存成功');
                        me.$('#frame-form').form('value', '');

                    }).fail(function(e){
                            fish.error(e);
                        });

//    				ret.agent=me.$('#agent').data('uiPopedit').getValue();
    				popup.close(ret);
    			});

                // 选择机房
                var dcRoomSel = $('#addframe_dcRoomSel').popedit({
                    modal: true,
                    dataTextField :'text',
                    dataValueField :'id',
                    dialogOption: {
                        height: 400,
                        width: 500
                    },
                    showClearIcon:false
                });

                // 选择所属机房的确定按钮
                this.$el.on('click','#addframe_dcRoomSelConfirm', function(e){
                    var treeInstance = me.$("#addframe_dcRoomTree").tree("instance");
                    var nodes = treeInstance.getSelectedNodes();
                    me.$('#addframe_dcRoomSel').val(nodes[0].name);
                    me.$("#addframe_dcRoom_dialog").dialog("close");
                });

                // 选择所属机房的关闭按钮
                this.$el.on('click','#addframe_dcRoomSelClose', function(e){
                    me.$("#addframe_dcRoom_dialog").dialog("close");
                });

                // 加载机房数据
                utils.ajax('equiprmService', 'findFrameTree', false, false).done(function(ret){
                    var options = {
                        view: {
                            dblClickExpand: false
                        },
                        data: {
                            simpleData: {
                                enable: true
                            }
                        },
                        callback: {
                            onClick: function(e, treeNode) {
                                if(treeNode.tag != "dcRoom") {
                                    fish.info("请选择机房");
                                    return;
                                }

                                $("#addframe_dcRoomId").val(treeNode.kId);
                                $("#addframe_dcId").val(treeNode.parentKId);
                            }
                        },
                        fNodes : ret
                    };

                    $("#addframe_dcRoomTree").tree(options);
                });
    			
    		}
    	});
    });