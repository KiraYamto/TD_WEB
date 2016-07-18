define([
        'text!modules/idcrm/spacerm/roomrm/templates/RoomFormView.html'+codeVerP,
        'i18n!modules/idcrm/spacerm/roomrm/i18n/RoomForm.i18n.zh.js'+codeVerP,
        'css!modules/idcrm/spacerm/roomrm/styles/RoomForm.css'+codeVerP,
        'modules/common/cloud-utils.js'+codeVerP
    ], function(roomFormViewTpl, i18nRoom,css,utils) {
        return fish.View.extend({
            template: fish.compile(roomFormViewTpl),
            i18nData: fish.extend({}, i18nRoom),
            events: {//事件对象的书写格式为 {"event selector": "callback"}。 省略 selector 则事件被绑定到视图的根元素（this.el),可以用this.$el.trigger触发。
               "click #save-button":"okBtn",
               "init.create.spacerm-room":"createInit",
               "init.update.spacerm-room":"updateInit",
               "init.detail.spacerm-room":"detailInit",
               "submit.create.spacerm-room":"createRoom",
               "submit.update.spacerm-room":"updateRoom"
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
            createInit:function(){ 
               this._initForm();
               //选中数据中心时设置机房名称
              $("#spacerm-room-dcId").on('combobox:change', function (e) {
                 $("#spacerm-room-roomname").val($("#spacerm-room-dcId").combobox('text'));
              });
            },
            updateInit:function(){
               this._initForm();
               this._loadRoomByRoomId();
               //修改不可以修改所属数据中心
               $("#spacerm-room-dcId").combobox('disable');
            },
            detailInit:function(){
               this._initForm();
               this._loadRoomByRoomId();
               //设置表单为只读
               this.$('#spacerm-room-form').form('disable');
            },
            _initForm:function(){ //初始化表单
              
                //所有数据中心
                utils.ajax('spaceResourceService','getIDNameOfAllDc').done(function(datas){                
                    
                     var $dcIdCmp = $('#spacerm-room-dcId').combobox({
                         placeholder: '请选择',
                         dataTextField: 'dcName',
                         dataValueField: 'dcId',
                         dataSource: datas
                     });
                     
                });

                 //机房性质
                utils.ajax('commonService','getDLCVByTypeCode',"ROOM_OWNER").done(function(datas){                
                   
                     $('#spacerm-room-ownership').combobox({
                         placeholder: '请选择',
                         dataTextField: 'value',
                         dataValueField: 'code',
                         dataSource: datas
                     });
                });

                //机房等级
                utils.ajax('commonService','getDLCVByTypeCode',"ROOM_LEVEL").done(function(datas){                
                    
                     $('#spacerm-room-roomLevel').combobox({
                         placeholder: '请选择',
                         dataTextField: 'value',
                         dataValueField: 'code',
                         dataSource: datas
                     });
                });
                
              //机房走向
                utils.ajax('commonService','getDLCVByTypeCode',"ROOM_DIRECTION").done(function(datas){                
                    
                     $('#spacerm-room-roomDirection').combobox({
                         placeholder: '请选择',
                         dataTextField: 'value',
                         dataValueField: 'code',
                         dataSource: datas
                     });
                });

                //投产日期
                $("#spacerm-room-startDate").datetimepicker();

            },
            okBtn:function(){//点击确定按钮后，验证返回填写的数据

                //验证
                if(!this.$('#spacerm-room-form').isValid()){
                    return ;
                }

                //获取数据             
                var formValues =  this.$('#spacerm-room-form').form('value')||{};
                
                //基础信息
                var basicInfo = {};
                if(this.options.roomId){
                   basicInfo.roomId = this.options.roomId;
                }
                //地址信息
                var addressInfo = {};
                //实体特征
                var entityProsInfo = {};

                for(var key in formValues){
                    if(key.match('^basicInfo-.+')){
                        var name = key.substring(10,key.length);
                        basicInfo[name] = fish.isEmpty(formValues[key])? null:formValues[key];
                    }else if(key.match('^addressInfo-.+')){
                        var name = key.substring(12,key.length);
                        addressInfo[name] = fish.isEmpty(formValues[key])? null:formValues[key];
                        
                    }else if(key.match('^entityProsInfo-.+')){
                       var name = key.substring(15,key.length);
                        entityProsInfo[name] = fish.isEmpty(formValues[key])? null:formValues[key];
                    }
                }

                var roomInfo = {};
                if(this.orignalValues && this.orignalValues.basicInfo){
                   roomInfo.basicInfo = fish.extend(this.orignalValues.basicInfo,basicInfo);
                }else{
                   roomInfo.basicInfo = basicInfo;
                }

                if(this.orignalValues && this.orignalValues.addressInfo){
                   roomInfo.addressInfo = fish.extend(this.orignalValues.addressInfo,addressInfo);
                }else{
                   roomInfo.addressInfo = addressInfo;
                }

                if(this.orignalValues && this.orignalValues.entityProsInfo){
                   roomInfo.entityProsInfo = fish.extend(this.orignalValues.entityProsInfo,entityProsInfo);
                }else{
                   roomInfo.entityProsInfo = entityProsInfo;
                }
                
                //触发提交后台
                this.$el.trigger('submit.'+this.options.action,roomInfo); // this.options为打开view传入的参数

            },
            _loadRoomByRoomId: function(){
               var me = this;
                if(this.options && this.options.roomId){
                    utils.ajax('spaceResourceService','queryRoomById',this.options.roomId).done(function(ret){   
                       
                       for(var objkey in ret){
                         var orignalObj = ret[objkey];
                         var transObj = {};
                         for (var key in orignalObj) {
                             transObj[objkey+'-'+key] = orignalObj[key];
                         };
                         me.$('#spacerm-room-form').form('value',transObj);
                         if(objkey =="basicInfo" && transObj["basicInfo-dcId"]){
                             $('#spacerm-room-dcId').combobox('value',transObj["basicInfo-dcId"]);
                         }
			                   $("#spacerm-room-startDate").datetimepicker("value", transObj['basicInfo-startDate']);
                         
                       }
                       me.orignalValues = ret;
                    });
                }
            },
            createRoom:function(event,roomInfo){
               var me = this;
               me.$el.blockUI({message:'提交中...'});
	             me.$('#save-button').attr('disabled',true);
               utils.ajax('spaceResourceService','createRoom',roomInfo)
                     .always(function(){
                         me.$el.unblockUI();
                         me.$('#save-button').attr('disabled',false);
                     })
                    .done(function(ret){
                        if(ret && ret.code == 'SUCCESS'){
                           fish.info('新增成功',function(){ me.popup.close({isSuccess:true,data:ret.data});});
                        }else{
                           fish.error(ret ? ret.msg:'新增失败');   
                        }
                    })
                    .fail(function(e){
                        fish.error("新增失败，"+e);                      
                    });
            },
            updateRoom:function(event,roomInfo){
                var me = this;
                me.$el.blockUI({message:'提交中...'});
		           me.$('#save-button').attr('disabled',true);

                utils.ajax('spaceResourceService','updateRoom',roomInfo)
                     .always(function(){
                         me.$el.unblockUI();
                         me.$('#save-button').attr('disabled',false);
                     })
                     .done(function(ret){
                          if(ret && ret.code == 'SUCCESS'){
                             fish.info('修改成功',function(){ me.popup.close({isSuccess:true,data:ret.data});});
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