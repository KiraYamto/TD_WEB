define([
        'text!modules/idcrm/spacerm/datacenterrm/templates/DataCenterFormView.html'+codeVerP,
        'i18n!modules/idcrm/spacerm/datacenterrm/i18n/DataCenterForm.i18n.zh.js'+codeVerP,
        'modules/common/cloud-utils.js'+codeVerP
    ], function(dataCenterViewTpl, i18nDataCenter,utils) {
        return fish.View.extend({
            template: fish.compile(dataCenterViewTpl),
            i18nData: fish.extend({}, i18nDataCenter),
            events: {//事件对象的书写格式为 {"event selector": "callback"}。 省略 selector 则事件被绑定到视图的根元素（this.el),可以用this.$el.trigger触发。
               "click #save-button":"okBtn",
               "init.create.spacerm-dc":"createInit",
               "init.update.spacerm-dc":"updateInit",
               "init.detail.spacerm-dc":"detailInit",
               "submit.create.spacerm-dc":"createDc",
               "submit.update.spacerm-dc":"updateDc"
            },
            //这里用来进行dom操作
            _render: function() {
                this.$el.html(this.template(this.i18nData));        
                return this;
            },
            //这里用来初始化页面上要用到的fish组件
            _afterRender: function() {      

               //根据不同动作（事件）触发不同动作（事件）
                if(this.options && this.options.action){
                    this.$el.trigger('init.'+this.options.action); // this.options为打开view传入的参数
                }
             
            },
            createInit:function(){//新增初始化
               this._initForm();
            },
            updateInit:function(){//修改初始化
               this._initForm();
               this._loadDCByDcId();
               //数据中心名称和编码不可以修改 
                $("#spacerm-dc-dcname").attr("readonly","readonly");
                $("#spacerm-dc-dccode").attr("readonly","readonly");
            },
            detailInit:function(){//查看详情初始化
               this._initForm();
               this._loadDCByDcId();
               //设置表单为只读
               this.$('#spacerm-dc-form').form('disable');
            },
            _initForm:function(){ //初始化表单
                utils.ajax('commonService','getDLCVByTypeCode',"DC_TYPE").done(function(datas){                
                    //数据中心类型
                     $('#spacerm-dc-dctype').combobox({
                         placeholder: '请选择',
                         dataTextField: 'value',
                         dataValueField: 'code',
                         dataSource: datas
                     });
                });
                
                //虚数据中心
                 //  this._initVDC();
	          //河南不展示虚数据中心，给默认值
	           $("#spacerm-dc-vcdId").attr("value", 10001);
               $("#spacerm-dc-vcdName").attr("value", '河南虚数据中心');
		       $("#spacerm-dc-vcdName").attr("readonly","readonly");
                //区域
                var areaEditable = (this.options.action == 'create.spacerm-dc' || this.options.action == 'update.spacerm-dc')? true:false;
                this._initArea(areaEditable);
                
            },
            okBtn:function(){//点击确定按钮后，验证返回填写的数据

                //验证
                if(!this.$('#spacerm-dc-form').isValid()){
                    return ;
                }

                //拼接数据
                var dcInfo = {};
                dcInfo.dataCenter =  this.$('#spacerm-dc-form').form('value')||{};
                if(this.options.dcId){
                   dcInfo.dataCenter.dcId = this.options.dcId;
                }
                var virDcs = [];
                var vids = dcInfo.dataCenter.vcdId;
                vids = vids.split(',');
                for (var i = vids.length - 1; i >= 0; i--) {
                    virDcs.push({dcId:vids[i]});
                };
                dcInfo.virDcs = virDcs;
                
                //触发提交后台
                this.$el.trigger('submit.'+this.options.action,dcInfo); // this.options为打开view传入的参数

            },
            _loadDCByDcId: function(){
               var me = this;
                if(this.options && this.options.dcId){
                    utils.ajax('spaceResourceService','queryDCByDcId',this.options.dcId).done(function(ret){  
                       me.originalFormValues = ret;                       
                       me.$('#spacerm-dc-form').form('value',ret.dataCenter);
                       var areaTreeDataLoadedFn = function(e){
                           this._setAreaCmb(me.originalFormValues.dataCenter.areaId);
                       }
                       me.$("#spacerm-dc-area-tree").on("treeDataloaded",$.proxy(areaTreeDataLoadedFn,me));

                       var virDcTreeDataLoadedFn = function(e){
                            this._setVDCCmb(me.originalFormValues.virDcs);
                       }
                       me.$("#spacerm-dc-vdc-tree").on("treeDataloaded",$.proxy(virDcTreeDataLoadedFn,me));
                    });
                }
            },
            _initArea:function(editable){
                var me = this;
                var options = {
                    view: {
                        dblClickExpand: false,
                        selectedMulti:false
                    },
                    data: {
                        simpleData: {
                            enable: true
                        }
                    },
                    callback: {
                        onClick: onClick
                    }
                };
                me.$("#spacerm-dc-area-tree").tree(options);
                utils.ajax('commonService','getAllAreas').done(function(nodeDatas){                
                        me.$("#spacerm-dc-area-tree").tree('reloadData',nodeDatas || []);
                        me.$("#spacerm-dc-area-tree").trigger("treeDataloaded");
               });

                $("#spacerm-dc-areaName").click(function(){
                        showMenu();
                 });
                $("#spacerm-dc-area-tree-html").position({   
                    of: $("#spacerm-dc-areaName"),
                    my: "left bottom",
                    at: "left top"
                }).hide();
                $("#spacerm-dc-area-menuBtn").click(function(event) {
                    showMenu();
                    return false;
                });
                 
                function onClick(e, treeNode) {
                    var nodes = $("#spacerm-dc-area-tree").tree("getSelectedNodes");
                    if (nodes.length > 0 ) {
		                $("#spacerm-dc-areaId").val(nodes[0].id);
                        $("#spacerm-dc-areaName").val(nodes[0].name);
                        hideMenu();
                    }
                }

                function showMenu() {
                    $("#spacerm-dc-area-tree-html").slideDown("fast");
                    $("body").on("mousedown", onBodyDown);
                }
                function hideMenu() {
                    $("#spacerm-dc-area-tree-html").fadeOut("fast");
                }
                function onBodyDown(event) {
                    if (!(event.target.id == "spacerm-dc-area-menuBtn" || event.target.id == "spacerm-dc-area-tree-html" 
                          || $(event.target).parents("#spacerm-dc-area-tree-html").length>0)) {
                        hideMenu();
                    }
                }
                if(!editable){
                   $("#spacerm-dc-area-menuBtn").unbind('click');
                }              
            },
            _initVDC:function(editable){
                var me = this;
                //虚数据中心
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
                            onClick: onClick
                        }
                 };
                 me.$("#spacerm-dc-vdc-tree").tree(options);

                utils.ajax('spaceResourceService','getAllVdcsTree').done(function(nodeDatas){                                    
                    me.$("#spacerm-dc-vdc-tree").tree('reloadData',nodeDatas || []);
                    me.$("#spacerm-dc-vdc-tree").trigger("treeDataloaded");
                });
            
               
                $("#spacerm-dc-vcdName").click(function(){
                        showMenu();
                 });

                $("#spacerm-dc-vdc-tree-html").position({   
                    of: $( "#spacerm-dc-vcdName" ),
                    my: "left bottom",
                    at: "left top"
                }).hide();

                $("#spacerm-dc-vdc-menuBtn").click(function(event) {
                    showMenu();
                    return false;
                });
                
                function onClick(e, treeNode) {
                    var nodes = $("#spacerm-dc-vdc-tree").tree("getSelectedNodes"),
                        vid = "",vname="";
                    nodes.sort(function compare(a,b){return a.id-b.id;});
                    for (var i=0, l=nodes.length; i<l; i++) {
                        vid += nodes[i].id + ",";
                        vname += nodes[i].name + ",";
                    }
                    if (vid.length > 0 ) {
                        vid = vid.substring(0, vid.length-1);
                        $("#spacerm-dc-vcdId").attr("value", vid);
                        $("#spacerm-dc-vcdName").attr("value", vname);
                        hideMenu();
                    }
                }

                function showMenu() {
                    $("#spacerm-dc-vdc-tree-html").slideDown("fast");
                    $("body").on("mousedown", onBodyDown);
                }
                function hideMenu() {
                    $("#spacerm-dc-vdc-tree-html").fadeOut("fast");
                }
                function onBodyDown(event) {
                    if (!(event.target.id == "spacerm-dc-vdc-menuBtn" || event.target.id == "spacerm-dc-vdc-tree-html" || $(event.target).parents("#spacerm-dc-vdc-tree-html").length>0)) {
                        hideMenu();
                    }
                }
                if(!editable){
                   $("#spacerm-dc-vdc-menuBtn").unbind('click');
                }
            },
            
            _setAreaCmb:function(value){//区域
                if(!value || ''.value){
                   return;
                }
                var node = $("#spacerm-dc-area-tree").tree("getNodeByParam","id",value);
                if(node){
                   $("#spacerm-dc-areaId").val(node.id);
                   $("#spacerm-dc-areaName").val(node.name);
                }
                
            },
            _setVDCCmb:function(vdcls){//虚数据中心
                 if(vdcls || vdcls.length > 0){
                     var vid = '', vname = '';
                     for (var i = 0, j = vdcls.length ; i < j; i++) {
                        var node = $("#spacerm-dc-vdc-tree").tree("getNodeByParam","id",vdcls[i].dcId);
                        if(node){
                           vid = vid + node.id +',';
                           vname = vname +node.name +',';
                        }
                     }
                     if (vid.length > 0 ) {
                         vid = vid.substring(0, vid.length-1);
                         $("#spacerm-dc-vcdId").attr("value", vid);
                         $("#spacerm-dc-vcdName").attr("value", vname);
                    }
                 }
                
            },
            createDc:function(event,dcData){//新增
               var me = this;
               me.$el.blockUI({message:'提交中...'});
               me.$('#save-button').attr('disabled',true);
               utils.ajax('spaceResourceService','createDC',dcData)
                    .always(function(){
                        me.$el.unblockUI();
                        me.$('#save-button').attr('disabled',false);
                     })
                    .done(function(ret){
                      if(ret && ret.code == 'SUCCESS'){
                         var dataCenter = {areaId:dcData.dataCenter.areaId};
                         fish.info('新增成功',function(){ me.popup.close({isSuccess:true,data:dataCenter});});
                      }else{
                         fish.error(ret ? ret.msg:'新增失败');  
                      }
                        
                    })
                    .fail(function(e){
                        fish.error("新增失败，"+e);                  
                    });
            },
            updateDc:function(event,dcData){//修改
                var me = this;
                me.$el.blockUI({message:'提交中...'});
                me.$('#save-button').attr('disabled',true);
                utils.ajax('spaceResourceService','updateDC',dcData)
                     .always(function(){
                        me.$el.unblockUI();
                         me.$('#save-button').attr('disabled',false);
                     })
                     .done(function(ret){
                         if(ret && ret.code == 'SUCCESS'){
                             var dataCenter = {areaId:dcData.dataCenter.areaId};
                             fish.info('修改成功',function(){ me.popup.close({isSuccess:true,data:dataCenter});});
                          }else{
                             fish.error(ret ? ret.msg:'修改失败');
                          }
                     })
                     .fail(function(e){
                         fish.error("修改失败，"+e);
                     }); 
            }

        });
    });