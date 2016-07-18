define([
        'text!modules/idcrm/serverequipment/templates/ServerEquipBaseFormView.html',
        'i18n!modules/idcrm/serverequipment/i18n/ServerEquipBaseForm.i18n',
        'modules/idcrm/common/moduleForm/views/ModuleForm',
        'modules/common/cloud-utils'
    ], function(htmlTpl,i18nData,moduleForm,utils) {
        return fish.View.extend({
            template: fish.compile(htmlTpl),
            i18nData: fish.extend({}, i18nData),

            //事件对象的书写格式为 {'event selector': 'callback'}。 省略 selector 则事件被绑定到视图的根元素（this.el),可以用this.$el.trigger触发。             
            events: {
                'click #serverequip-base-submitbtn':'submitBtn',
                //"init."+动作,自定义不同动作的初始化事件，需要手动触发。
                'init.insert':'initInsert',
                'init.modify':'initDetail',
                'init.detail':'initDetail',
                'submit.insert':'createServerEquip',
                'submit.modify':'updateServerEquip'
            },

            //这里用来进行dom操作
            _render: function() {
               this.$el.html(this.template(this.i18nData));               
               return this;
            },
            _afterRender: function() { 
              var me = this;
               if(me.options && me.options.action){
                    var templateCode = 'PHY_SERVER_RS';
                    var moduleCode = 'serverequip-base';
                    moduleForm.init(me.$('#serverequip-base-form'),moduleCode,templateCode,me.options.action);                   
                    
                    //延迟2秒取物理机数据，保证界面初始化好才设置值。
                    fish.delay($.proxy(me._init,me),2000);
               }
               
            },
            _init:function(){
                var me = this;
                me.$('#serverequip-base-rsTypeId').on('combobox:change', function () {
                    var rsTypecode = me.$('#serverequip-base-rsTypeId').combobox('value'); 
                    var resTypeValueObj = fish.find(me.$('#serverequip-base-rsTypeId').combobox('option','dataSource'),
                                                     function(obj){ return obj.value == rsTypecode}
                                                   );
                    var params = {
                       conditions: [{name:'rsTypeId', op: 'EQUALS', value: resTypeValueObj.reTypeId}],
                       pageIdx: 1,
                       pageSize: 10000
                    };                         
                    utils.ajax('templateService','qryTemplateListByCond', params).done(function(retDatas){
                          me.$('#serverequip-base-templetId').combobox('option','dataSource',retDatas.rows); 
                    });
                });

                //根据不同动作触发，执行对应的初始化函数
                 me.$el.trigger('init.'+me.options.action);
            },
            initInsert:function(){
             
            },
            initDetail:function(){
                this._loadServerEquipById();
                if(this.options.action == 'detail'){
                  $('#serverequip-base-submitbtn').hide();
                  $('#serverequip-base-closebtn').hide();
                }
            },
            _loadServerEquipById: function(){
                var me = this;
                if(me.options && me.options.id){
                    me.$el.blockUI({message:'加载中...'});
                    utils.ajax('serverEquipmentService','selectByServerEqId',this.options.id)
                         .always(function(){
                             me.$el.unblockUI();
                         }).done(function(data){  
                              //cpu
                              if(data.serverCpuConfig){
                                  data.cpuId = data.serverCpuConfig.id;
                                  data.cpu = data.serverCpuConfig.cpu;
                                  data.cpuKernel = data.serverCpuConfig.cpuKernel;
                                  data.processorType = data.serverCpuConfig.processorType;
                                  data.cpuSocket = data.serverCpuConfig.cpuSocket;
                                  data.socketKernel = data.serverCpuConfig.socketKernel;
                                  data.logicalCpu = data.serverCpuConfig.logicalCpu;
                                  data.cpuFrequency = data.serverCpuConfig.cpuFrequency;
                              }
                                             
                              me.$('#serverequip-base-form').form('value',data);
                              me.$('#serverequip-base-roomId').popedit('setValue',{roomId:data.roomId,roomName:data.roomName,
                                                                      areaCode:data.areaCode,roomCode:data.roomCode});  
                              
                              //触发联动并赋值
                              me.$('#serverequip-base-vendor').trigger('combobox:change');
                              me.$('#serverequip-base-projectCode').trigger('combobox:change');
                              fish.delay(function(){
                                 me.$('#serverequip-base-model').combobox('value',data.model);
                                 me.$('#serverequip-base-engineeringCode').combobox('value',data.engineeringCode);                           
                              },500);
                              me.oringinValues = data;
                         });
                }
            },
           
            //点击确定按钮后，验证返回填写的数据
            submitBtn:function(){
               var me = this;              
               me.$el.blockUI({message:'提交中...'});
               var serverEquip =  me.$('#serverequip-base-form').form('value');    
               utils.ajax('serverEquipmentService','generaterEqCode',serverEquip).always(function(){
                        me.$el.unblockUI();
                    }).done(function(equipCode){
                        me.afterGenerateCode(equipCode);
                    }).fail(function(e){
                        fish.error('生成设备编码失败，'+e);                      
                    });
            },
            afterGenerateCode: function(equipCode){
               var me = this;
               fish.confirm('生成的设备编码为'+equipCode).result.then(function(){

                   me.$('#serverequip-base-eqCode').val(equipCode);
                   //验证
                   if(!me.$('#serverequip-base-form').isValid()){
                      return ;
                   }

                   //获取数据             
                   var formValues =  me.$('#serverequip-base-form').form('value')||{};
                   formValues = _.extend({},me.oringinValues,formValues);

                   //触发提交后台
                   me.$el.trigger('submit.'+me.options.action,formValues); 
              });
            },
            createServerEquip:function(event,serverEquip){
               var me = this;
               me.$el.blockUI({message:'提交中...'});
               me.$('#serverequip-base-submitbtn').attr('disabled',true);
               //cpu
                var serverCpuConfig = {};
                serverCpuConfig.cpu = serverEquip.cpu;
                serverCpuConfig.cpuKernel = serverEquip.cpuKernel;
                serverCpuConfig.processorType = serverEquip.processorType;
                serverCpuConfig.cpuSocket = serverEquip.cpuSocket;
                serverCpuConfig.socketKernel = serverEquip.socketKernel;
                serverCpuConfig.logicalCpu = serverEquip.logicalCpu;
                serverCpuConfig.cpuFrequency = serverEquip.cpuFrequency;
                serverEquip.serverCpuConfig = serverCpuConfig;

               utils.ajax('serverEquipmentService','create',serverEquip)
                     .always(function(){
                         me.$el.unblockUI();
                         me.$('#serverequip-base-submitbtn').attr('disabled',false);
                     }).done(function(ret){
                        if(ret && ret.code == 'SUCCESS'){
                           fish.info('新增成功',function(){ 

                             //调用父窗口的关闭方法
                             if(me.parentView && me.parentView.popup){
                                var returnData = {isSuccess:true,data:ret.data};
                                me.parentView.popup.close(returnData);
                             } 
                           });
                        }else{
                           fish.error(ret ? ret.msg:'新增失败');   
                        }
                    }).fail(function(e){
                        fish.error('新增失败，'+e);                      
                    });
            },
            updateServerEquip:function(event,serverEquip){
                var me = this;
                me.$el.blockUI({message:'提交中...'});
                me.$('#serverequip-base-submitbtn').attr('disabled',true);

                serverEquip.id = this.options.id;
                //cpu
                var serverCpuConfig = {};
                serverCpuConfig.id = serverEquip.cpuId;
                serverCpuConfig.cpu = serverEquip.cpu;
                serverCpuConfig.cpuKernel = serverEquip.cpuKernel;
                serverCpuConfig.processorType = serverEquip.processorType;
                serverCpuConfig.cpuSocket = serverEquip.cpuSocket;
                serverCpuConfig.socketKernel = serverEquip.socketKernel;
                serverCpuConfig.logicalCpu = serverEquip.logicalCpu;
                serverCpuConfig.cpuFrequency = serverEquip.cpuFrequency;
                serverEquip.serverCpuConfig = serverCpuConfig;

                utils.ajax('serverEquipmentService','update',serverEquip)
                     .always(function(){
                         me.$el.unblockUI();
                         me.$('#serverequip-base-submitbtn').attr('disabled',false);
                     }).done(function(ret){
                          if(ret && ret.code == 'SUCCESS'){
                             fish.info('修改成功');
                          }else{
                             fish.error(ret ? ret.msg:'修改失败'); 
                          }
                     }).fail(function(e){
                         fish.error('修改失败，'+e);
                     }); 
            }
        });
    });
    