define([
        'text!modules/idcrm/resourcemanager/equrm/templates/NetEquipmentBaseFormView.html',
        'i18n!modules/idcrm/resourcemanager/equrm/i18n/NetEquipmentBaseForm.i18n',
        'modules/idcrm/common/moduleForm/views/ModuleForm',
        'modules/common/cloud-utils'
    ], function(htmlTpl,i18nData,moduleForm,utils) {
        return fish.View.extend({
            template: fish.compile(htmlTpl),
            i18nData: fish.extend({}, i18nData),

            //事件对象的书写格式为 {'event selector': 'callback'}。 省略 selector 则事件被绑定到视图的根元素（this.el),可以用this.$el.trigger触发。             
            events: {
                'click #netequip-base-submitbtn':'submitBtn',
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
                    var templateCode = 'RS_PAGE_NET_EQ';
                    var moduleCode = 'netequip-base';
                    moduleForm.init(me.$('#netequip-base-form'),moduleCode,templateCode,me.options.action);                   
                    //延迟一秒取物理机数据，保证界面初始化好才设置值。
                    fish.delay(function() { 
                        //根据不同动作触发，执行对应的初始化函数
                        me.$el.trigger('init.'+me.options.action);
                    },1000);
               }
            },
            initInsert:function(){
            },
            initDetail:function(){
                this._loadServerEquipById();
            },
            _loadServerEquipById: function(){
               var me = this;
                if(this.options){
                	var data = this.options.netEquip;
                    //utils.ajax('serverEquipmentService','selectByServerEqId',this.options.id).done(function(data){      
                         me.$('#netequip-base-form').form('value',data);
                         me.$('#netequip-base-roomId').popedit('setValue',{roomId:data.roomId,roomName:data.roomName});  
                         //触发联动并赋值
                         me.$('#netequip-base-rsTypeId').trigger('combobox:change');
                         me.$('#netequip-base-vendor').trigger('combobox:change');
                         me.$('#netequip-base-projectCode').trigger('combobox:change');
                         fish.delay(function(){
                            me.$('#netequip-base-model').combobox('value',data.model);
                            me.$('#netequip-base-engineeringCode').combobox('value',data.engineeringCode);  
                            me.$('#netequip-base-chassisTypeId').combobox('value',data.chassisTypeId); 
                         },3000);
                         me.oringinValues = data;
                    //});
                }
            },
            //点击确定按钮后，验证返回填写的数据
            submitBtn:function(){
               //验证
                if(!this.$('#netequip-base-form').isValid()){
                    return ;
                }
               //获取数据             
                var formValues =  this.$('#netequip-base-form').form('value')||{};
                formValues = _.extend({},this.oringinValues,formValues);
               //触发提交后台
                this.$el.trigger('submit.'+this.options.action,formValues); 
            },
            createServerEquip:function(event,equipment){
               var me = this;
               me.$el.blockUI({message:'提交中...'});
               me.$('#netequip-base-submitbtn').attr('disabled',true);
               utils.ajax('netEquipService','addRsNetEquip',equipment)
                     .always(function(){
                         me.$el.unblockUI();
                         me.$('#netequip-base-submitbtn').attr('disabled',false);
                     }).done(function(ret){
                        if(ret && ret.code == '0'){
                           fish.info('新增成功',function(){ 

                             //调用父窗口的关闭方法
                             if(me.parentView && me.parentView.popup){
                                var returnData = {isSuccess:true,data:ret.data};
                                me.parentView.popup.close(returnData);
                             } 
                           }, function (e) {
                               console.log('关闭了', e);
                           });
                        }else{
                           fish.error(ret ? ret.msg:'新增失败');   
                        }
                    }).fail(function(e){
                        fish.error('新增失败，'+e);                      
                    });
            },
            updateServerEquip:function(event,equipment){
                var me = this;
                me.$el.blockUI({message:'提交中...'});
                me.$('#netequip-base-submitbtn').attr('disabled',true);
                //serverEquip.id = this.options.id;
                utils.ajax('netEquipService','updateRsNetEquip',equipment)
                     .always(function(){
                         me.$el.unblockUI();
                         me.$('#netequip-base-submitbtn').attr('disabled',false);
                     }).done(function(ret){
                          if(ret && ret.code == '0'){
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
    