define(['text!modules/idcrm/common/moduleForm/templates/ModuleForm.html',
        'css!modules/idcrm/common/moduleForm/styles/ModuleForm.css',
        'modules/common/cloud-utils'
],function(moduleFormHtml,moduleFormCss,utils) {
    
  return (function(){
    
	  var moduleFormProperty = {moduleFormHtml : moduleFormHtml};

    var tempObj = moduleFormProperty.sessionInfo = {}; //将当前会话相关的人员职位区域信息，放入sessionInfo对象中，为后面替换方便
    tempObj.area = (typeof area != 'undefined' && area != null )? area:{};
    tempObj.currentUser = (typeof currentUser != 'undefined' && currentUser != null)? currentUser:{};
    tempObj.currentJob = (typeof currentJob != 'undefined' && currentJob != null)? currentJob:{};
    tempObj.userMenus = (typeof userMenus != 'undefined' && userMenus != null)? userMenus:{};

    moduleFormProperty.templateSettings = {interpolate: /\<(.+?)\>/g};

    moduleFormProperty.init = function($compselector,moudleCode,templateCode,action,paramters) {
       var _this = this;
       _this.settings = {};
       _this.settings.$compselector= $compselector;
       _this.settings.moudleCode = moudleCode;
       _this.settings.templateCode= templateCode;
       _this.settings.action = action;
       _this.settings.paramters = paramters || {};

       _this.getConfig().then(function() {
          var html = _this.generatorHtml();
          _this.settings.$compselector.append(html);
          _this.initComp();
       });
    }

    moduleFormProperty.getConfig = function() {
       var _this = this;
       function successFn(entityParas) {
          _this.entityParas = entityParas;
          _.each(entityParas,function(obj,idx) {
            
             obj.moudlecode = _this.settings.moudleCode; 
             obj.uniCmpId = _this.settings.moudleCode+'-'+obj.code; //组件唯一ID
              
             //设置是否可编辑
             if (_this.settings.action =='insert' && obj.insertEdit == 1 ) {
                obj.editable = true;
             }else if (_this.settings.action =='modify' && obj.modifyEdit == 1 ) {
                obj.editable = true;
             } else {
                obj.editable = false;
             }
          });
       }
       return utils.ajax('templateService','qryEntityParamsByRsObjectCode',_this.settings.templateCode).then(successFn);
    }

    //html
    moduleFormProperty.generatorHtml = function() {
       var template = fish.compile(this.moduleFormHtml);

       //获取html
       var returnHtml = template({entityParas:this.entityParas});
       return returnHtml;
    }
    
    //JS初始化组件
    moduleFormProperty.initComp = function() {

      var _this = this;
      var valueObj = fish.extend({},_this.sessionInfo,_this.settings.paramters);

      fish.each(_this.entityParas,function(entityPara,idx) {
       try{
         //参数
        var pInitValue = {};
        if (entityPara.parameter) {
          try {
              var template = _.template(entityPara.parameter,_this.templateSettings);
              pInitValue = template(valueObj);
              pInitValue = pInitValue ? JSON.parse(pInitValue): {};
          } catch(e) {
             console.log('输入项类型：'+ entityPara.inputType + ',名称：' + entityPara.name + ',编码：' + entityPara.code + 
                         ',\nparameter为：' + entityPara.parameter + ',\nvalueObj为:' + JSON.stringify(valueObj) + 
                         ',\nparameter中<variablesName>替换为valueObj中实际值时异常：' + e);
          }
        }

          //配置转对象
          if (typeof entityPara.options === 'string' && !fish.isEmpty(entityPara.options.trim())) {
               entityPara.options = JSON.parse(entityPara.options);
          }
          
          if (entityPara.inputType == 'PopEdit') {
      	    var popEditOpts = fish.extend({},entityPara.options);
      	    if (!popEditOpts.dialogOption) {
      	       popEditOpts.dialogOption = {};
      	    }

      	    if (!popEditOpts.dialogOption.width) {
      	       popEditOpts.dialogOption.width = 300;
      	    }

      	    if (!popEditOpts.dialogOption.height) {
      	       popEditOpts.dialogOption.height = 350;
      	    }
      	       
      	    popEditOpts.url = entityPara.url;
             /*  var $popEdit =$('#'+entityPara.uniCmpId).popedit({
                   dialogOption:{
                       viewOptions:pInitValue,
                       width: entityPara.popWidth,
                       height:entityPara.popHeight
                   },
                   url:entityPara.url
               }); */
            popEditOpts.dialogOption.initValue = pInitValue;

	          var $popEdit =$('#'+entityPara.uniCmpId).popedit(popEditOpts);
            if (!entityPara.editable) {
                $popEdit.popedit('disable');
            }

            if (_this.settings.action == 'insert' && entityPara.defaultValue) {
                $popEdit.popedit('setValue',entityPara.defaultValue); 
            }

            //关联的字段赋值
            if(entityPara.options && entityPara.options.relaCmpCfg){
              $popEdit.popedit('option','change',function(e, data){
                 
                 //entityPara.options.relaCmpCfg的key为关联组件对应的code,value为popEdit返回值对应的字段
                 fish.each(entityPara.options.relaCmpCfg,function(value,key){
                    var findCmpData = fish.find(_this.entityParas,function(item){
                          return item.code == key;
                    });

                    if(findCmpData && findCmpData.uniCmpId){
                       $('#'+findCmpData.uniCmpId).val(data[value]);
                    }

                 });
              });
            } 

          } else if (entityPara.inputType == 'DateTimePicker') {
               var opts = fish.extend({},pInitValue,entityPara.options);
               var $datetimePicker = $('#'+entityPara.uniCmpId).datetimepicker(opts);
               if (!entityPara.editable) {
                  $datetimePicker.datetimepicker('disable');
               }

               if (_this.settings.action == 'insert' && entityPara.defaultValue) {
                  $datetimePicker.datetimepicker('value',entityPara.defaultValue);
               }
          } else if (entityPara.inputType == 'ClearInput') {
               if (entityPara.editable) {
                 $('#'+entityPara.uniCmpId).clearinput();
               } 
               
               if (_this.settings.action == 'insert' && entityPara.defaultValue) {
                  $('#'+entityPara.uniCmpId).val(entityPara.defaultValue);
               }
          } else if (entityPara.inputType == 'Combobox') {
              var defaults =  {
                       placeholder: entityPara.placeHolder ||'请选择'
                  };

              if(entityPara.dicTypeCode || entityPara.parentCode){
                 if(defaults.dataTextField == null){
                    defaults.dataTextField = 'dictName';
                 }

                 if(defaults.dataValueField == null){
                    defaults.dataValueField = 'dictCode';
                 }
                 
              }

              entityPara._cfgOpts = fish.extend({},defaults,entityPara.options);

              if (entityPara.dicTypeCode) {
                  utils.ajax('commonService','getDictsByTypeCode',entityPara.dicTypeCode).done(function(datas) { 

                    var $comboBox =  $('#'+entityPara.uniCmpId).combobox(entityPara._cfgOpts);
                    $comboBox.combobox('option','dataSource',datas);

                    if (!entityPara.editable) {
                       $comboBox.combobox('disable');
                    } 

                    if (_this.settings.action == 'insert' && entityPara.defaultValue) {
                        $comboBox.combobox('value',entityPara.defaultValue);
                    }

                    //关联的字段赋值
                    if(entityPara.options && entityPara.options.relaCmpCfg){
                      $comboBox.on('combobox:change',function(e){
                          var curValue = $comboBox.combobox('value'); 
                          var displayValueKey = $comboBox.combobox('option','dataValueField'); 
                          var datatSoures = $comboBox.combobox('option','dataSource'); 
                          var curValueDataObj = fish.find(datatSoures,function(item) { return item[displayValueKey] == curValue;});

                         //entityPara.options.relaCmpCfg数据格式：{"compCode":"relaDataKey"}
                         fish.each(entityPara.options.relaCmpCfg,function(relaDataKey,compCode){
                            var findCmpData = fish.find(_this.entityParas,function(item){
                                  return item.code == compCode;
                            });

                            if(findCmpData && findCmpData.uniCmpId){
                               $('#'+findCmpData.uniCmpId).val(curValueDataObj[relaDataKey]);
                            }

                         });
                      });
                    } 

                  });
              } else if (entityPara.parentCode) {
                  var parentData = fish.find(_this.entityParas,function(item){
                      return item.code == entityPara.parentCode;
                  });

                  if(parentData && parentData.uniCmpId){

                    //联动改变                     
                    $('#'+parentData.uniCmpId).on('combobox:change', function(e) {                            
                        $('#'+entityPara.uniCmpId).combobox('clear');
                        var dicTypeCode = $('#'+parentData.uniCmpId).combobox('value'); 
                        utils.ajax('commonService','getDictsByTypeCode',dicTypeCode).done(function(datas) {                    
                            var $comboBox =  $('#'+entityPara.uniCmpId).combobox(entityPara._cfgOpts);
                            $comboBox.combobox('option','dataSource',datas);

                            if (!entityPara.editable) {
                               $comboBox.combobox('disable');
                            } 

                            if (_this.settings.action == 'insert' && entityPara.defaultValue) {
                                $comboBox.combobox('value',entityPara.defaultValue);
                            }

                           //关联的字段赋值
                            if(entityPara.options && entityPara.options.relaCmpCfg){
                              $comboBox.on('combobox:change',function(e){
                                  var curValue = $comboBox.combobox('value'); 
                                  var displayValueKey = $comboBox.combobox('option','dataValueField'); 
                                  var datatSoures = $comboBox.combobox('option','dataSource'); 
                                  var curValueDataObj = fish.find(datatSoures,function(item) { return item[displayValueKey] == curValue;});

                                 //entityPara.options.relaCmpCfg数据格式：{"compCode":"relaDataKey"}
                                 fish.each(entityPara.options.relaCmpCfg,function(relaDataKey,compCode){
                                    var findCmpData = fish.find(_this.entityParas,function(item){
                                       return item.code == compCode;
                                    });
                                    
                                    if(findCmpData && findCmpData.uniCmpId){
                                       $('#'+findCmpData.uniCmpId).val(curValueDataObj[relaDataKey]);
                                    }

                                 });
                              });
                            } 
                        });
                     });
                  }
              } else {

                  var $comboBox =  $('#'+entityPara.uniCmpId).combobox(entityPara._cfgOpts); 

                  if (!entityPara.editable) {
                     $comboBox.combobox('disable');
                  } 

                  if (_this.settings.action == 'insert' && entityPara.defaultValue) {
                      $comboBox.combobox('value',entityPara.defaultValue);
                  }

                  //关联的字段赋值
                    if(entityPara.options && entityPara.options.relaCmpCfg){
                      $comboBox.on('combobox:change',function(e){
                          var curValue = $comboBox.combobox('value'); 
                          var displayValueKey = $comboBox.combobox('option','dataValueField'); 
                          var datatSoures = $comboBox.combobox('option','dataSource'); 
                          var curValueDataObj = fish.find(datatSoures,function(item) { return item[displayValueKey] == curValue;});

                         //entityPara.options.relaCmpCfg数据格式：{"compCode":"relaDataKey"}
                         fish.each(entityPara.options.relaCmpCfg,function(relaDataKey,compCode){
                            var findCmpData = fish.find(_this.entityParas,function(item){
                                  return item.code == compCode;
                            });

                            if(findCmpData && findCmpData.uniCmpId){
                               $('#'+findCmpData.uniCmpId).val(curValueDataObj[relaDataKey]);
                            }
                            
                         });
                      });
                    } 

              }

          } else if (entityPara.inputType == 'MultiSelect') { 
                   
              utils.ajax('commonService','getDLCVByTypeCode',entityPara.dicTypeCode).done(function(datas) {                
                  var $multiselect = $('#'+entityPara.uniCmpId).multiselect({
                     placeholder: entityPara.placeHolder ||'请选择',
                     dataTextField: 'value',
                     dataValueField: 'code',
                     dataSource: datas
                  });

                  if (!entityPara.editable) {
                     $multiselect.multiselect('disable');
                  }

                  if (_this.settings.action == 'insert' && entityPara.defaultValue) {
                     $multiselect.multiselect('value',JSON.parse(entityPara.defaultValue));
                  }
              });

          } else if (entityPara.inputType == 'FileUpload') {
             //暂时不知道写什么

          } else if (entityPara.inputType == 'SwitchButton') {
              var opts = fish.extend({},pInitValue,entityPara.options);
              var $switchbutton = $('#'+entityPara.uniCmpId).switchbutton(opts);
              
              if (_this.settings.action == 'insert' && entityPara.defaultValue) {
                 $switchbutton.switchbutton('option','state',(entityPara.defaultValue == true || entityPara.defaultValue== 'true'));
              }

              if (!entityPara.editable) {
                 $switchbutton.switchbutton('disable');
              }
          } else {

             //默认值
             if (_this.settings.action == 'insert' && entityPara.defaultValue) {
                 $('#'+entityPara.uniCmpId).val(entityPara.defaultValue);
             }
          }

        }catch(e){
             console.log('异常：'+JSON.stringify(entityPara)+ e);
        }
    });
  }
  
	return Object.create(moduleFormProperty);

  })();
});
