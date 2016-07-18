define([
    	'text!modules/idcrm/equipmentrecord/templates/RecordFormView.html'+codeVerP,
    	'i18n!modules/idcrm/equipmentrecord/i18n/record.i18n.zh.js'+codeVerP,
    	'modules/common/cloud-utils.js'+codeVerP
    ], function(RecordFormViewTpl, i18nRecord,utils) {
    	return fish.View.extend({
    		template: fish.compile(RecordFormViewTpl),
    		i18nData: fish.extend({}, i18nRecord),
    		events: {
                "loadRecordByRoId":"_loadRecordByRoId",
                "update.record":"updateAction",
                "create.record":"createAction"
    		},
    		
    		//这里用来进行dom操作
    		_render: function() {
    			var html=$(this.template(this.i18nData));
    			this._initForm(html);
    			html.find('#updateForm').hide();
    			html.find('#recordCode').hide();
    			html.find('#record-form').form();
    			this.$el.html(html);
    			return this;
    		},
    		onCollapse:function(event, treeNode){
    			
    		},
    		_initForm:function(html){ //初始化表单

    			html.find('#record-createDate').datetimepicker({
    				endDate: fish.dateutil.addDays(new Date(), 10)
    			});

    			html.find('#record-operTime').datetimepicker({
    				endDate: fish.dateutil.addDays(new Date(), 10)
    			});

    			html.find('#record-updateDate').datetimepicker({
    				endDate: fish.dateutil.addDays(new Date(), 10)
    			});
    			html.find('#record-rsTypeId').combobox({
                   placeholder: '请选择',
                   dataTextField: 'name',
                   dataValueField: 'value',
                   dataSource: [],
                   change:function(){
                	   var val = $('#record-rsTypeId').combobox('value');
                	   $('#record-rs-type').val(val);
                	  
                   }
    			});
	   			utils.ajax('equipmentRecordService','qryRsTypes').done(function(datas){                
	   				html.find('#record-rsTypeId').combobox('option', 'dataSource', datas);
	              });
				html.find('#record-eventCode').combobox({
	                placeholder: '请选择',
	                dataTextField: 'value',
	                dataValueField: 'code',
	                dataSource: []
	            });
				utils.ajax('commonService','getDLCVByTypeCode','EVENT_CODE').done(function(datas){                
					html.find('#record-eventCode').combobox('option', 'dataSource', datas);
	           });
				html.find('#record-fitType').combobox({
	                placeholder: '请选择',
	                dataTextField: 'value',
	                dataValueField: 'code',
	                dataSource: []
	            });
				utils.ajax('commonService','getDLCVByTypeCode','FIT_TYPE').done(function(datas){                
					html.find('#record-fitType').combobox('option', 'dataSource', datas);
	           });
    			this._initRoom(html);
    			this._initRs(html);

            },
            _initRoom:function(html){
            	this.popeditControl= html.find('#record-room').popedit({
    				dataTextField :'name',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 500
    				},
    				showClearIcon:false
    			});

    			utils.ajax('equiprmService', 'findFrameTree', true, true).done(function(ret){
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
                        },
                        fNodes : ret
                    };

                    $("#room-tree").tree(options);

                    function onClick(e, treeNode) {
                        var nodes = $("#room-tree").tree("getSelectedNodes"),
                            v = "";
                        nodes.sort(function compare(a,b){return a.id-b.id;});
                        for (var i=0, l=nodes.length; i<l; i++) {
                            v += nodes[i].name + ",";
                        }
                        if (v.length > 0 ) {
                            v = v.substring(0, v.length-1);
                        }
                    }
                });
            },
            _initRs:function(html){
            	this.popeditControl1 = html.find('#record-rs').popedit({
            		dataTextField :'name',
    				dataValueField :'id',
    				dialogOption: {
    					height: 400,
    					width: 700
    				},
    				showClearIcon:false
    			});

            	utils.ajax('equipmentRecordService', 'qryRsListByType', null).done(function(ret){
                    var options1 = {
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
                        },
                        fNodes : ret
                    };

        			var $Rstree = html.find("#rs-tree").tree(options1);

                    function onClick(e, treeNode) {
                        var nodes = $("#rs-tree").tree("getSelectedNodes"),
                            v = "";
                        nodes.sort(function compare(a,b){return a.id-b.id;});
                        for (var i=0, l=nodes.length; i<l; i++) {
                            v += nodes[i].name + ",";
                        }
                        if (v.length > 0 ) {
                            v = v.substring(0, v.length-1);
                        }
                    }
                });
            },
            _loadRecordByRoId:function(){
            	 var me = this;
                 if(this.options && this.options.roId){
                     utils.ajax('equipmentRecordService','queryRecordByRoId',this.options.roId).done(function(ret){                           
                        me.$('#record-form').form('value',ret);
                        me.$('#record-rs').val(ret.rsName);
                        me.$('#record-room').val(ret.roomName);
                        me.$('#record-updateId').val(currentUser.staffName);
	   					me.$("#record-model-name").val(ret.modelName);
	   					me.$("#record-vendor-name").val(ret.venderName);
                        var node = new Object();
                        node.id = ret.roomId;
                        node.name = ret.roomName;
                        me.$('#record-room').data('uiPopedit').setValue(node);
                        var rsNode = new Object();
                        rsNode.id = ret.rsId;
                        rsNode.name = ret.rsName;
                        me.$('#record-rs').data('uiPopedit').setValue(rsNode);
                        me.trigger('initFinished');
                     });
                 }
            },
    		//这里用来初始化页面上要用到的fish组件
    		_afterRender: function() {
               //根据不同动作（事件）触发不同动作（事件）
                if(this.options && this.options.action){
                    this.$el.trigger(this.options.action); // this.options为打开view传入的参数
                }
    			var popup=this.popup;
    			var me=this;
    			$('#record-creatorId').val(currentUser.staffName);
    			$('#record-oper').val(currentUser.staffName);
    			var date = me.getNowFormatDate();
    			$('#record-createDate').attr("value",date);
    		    $('#record-createDate').datetimepicker("update");
    			$('#record-operTime').attr("value",date);
    		    $('#record-operTime').datetimepicker("update");

    			this.$el.on('click','#room-choose',function(e){
    				 var treeInstance = me.$("#room-tree").tree("instance");
    				 var nodes = treeInstance.getSelectedNodes();
    			        var treeNode =null;
    				 if(nodes&&nodes.length>0){
    					 treeNode= nodes[0];
    				 }
    				 if(!treeNode){
    					 fish.info("请选择一个机房");
    				 }
    				 else{
//    					 console.log(treeNode);
    					 me.$("#room-demodialog").dialog("setReturnValue",treeNode);
    					 me.$("#room-demodialog").dialog("close");
    				 }
    			});
    			
		    	this.$el.on('click','#room-Close',function(e){
		    		me.$("#room-demodialog").dialog("setReturnValue",null);
		    		me.$("#room-demodialog").dialog("close");
		    	});
		    	this.$el.on('click','#record-query-btn',function(e){
		    		var rsName = $('#record-rs-name').val();
              	   	var rsCode = $('#record-rs-code').val();
              	   	var rsType = $('#record-rs-type').val();
              	   	var param = {
              	   		rsType:rsType,
              	   		rsName:rsName,
              	   		rsCode:rsCode
              	   	};
              	   	if(!rsType){
              	   		fish.info("请先选择一个资源类型");
              	   	}
              	   	utils.ajax('equipmentRecordService','qryRsListByType',param).done(function(ret){
         				var root=[];
         				if(ret)
         				$.each(ret,function(i,n){
         					if(n.leaf==1){
         						n.isParent =false;
         					}
         					else{
         						n.isParent =true;
         					}
         					root.push(n);
         				});
         				$('#rs-tree').tree('reloadData', root);
         			});
		    	});
		    	this.$el.on('click','#rs-choose',function(e){
	   				 var treeInstance = me.$("#rs-tree").tree("instance");
	   				 var nodes = treeInstance.getSelectedNodes();
	   			        var treeNode =null;
	   				 if(nodes&&nodes.length>0){
	   					 treeNode= nodes[0];
	   				 }
	   				 if(!treeNode){
	   					 fish.info("请选择一个设备");
	   				 }
	   				 else{
	   					 me.$("#rs-demodialog").dialog("setReturnValue",treeNode);
	   					 me.$("#record-rsName").val(treeNode.name);
	   					 me.$("#record-roCode").val(treeNode.code);
	   					 me.$("#record-model").val(treeNode.model);
	   					 me.$("#record-vendor").val(treeNode.vender);
	   					 me.$("#record-model-name").val(treeNode.modelName);
	   					 me.$("#record-vendor-name").val(treeNode.venderName);
	   					 me.$("#rs-demodialog").dialog("close");
	   				 }
		    	});
   			
		    	this.$el.on('click','#rs-Close',function(e){
		    		me.$("#rs-demodialog").dialog("setReturnValue",null);
		    		me.$("#rs-demodialog").dialog("close");
		    	});
    			this.$el.on('click', '#save-button', function(e) {
    				var ret = me.$('#record-form').form('value')||{};
    				ret.room=me.$('#record-room').data('uiPopedit').getValue();
    				ret.rs=me.$('#record-rs').data('uiPopedit').getValue();
    				if(me.options != undefined && me.options.action == 'update.record'){
    					 ret.roomId = ret.room.id;
    					 ret.rsId = ret.rs.id;
    					 ret.updateId = currentUser.staffId;
    					 ret.id = me.options.roId;
    					 popup.close(ret); //传递数据
    				}else{
    					var info = me.$('#record-info-form').form('value')||{};
    					if(!info.operTime){
    						fish.info("操作时间不能为空");
    						return;
    					}
        				info.creatorId = currentUser.staffId;
        				info.oper = currentUser.staffId;
        				var param = {
        						roomId:ret.room.id,
        						rsId:ret.rs.id,
        						rsTypeId:ret.rsTypeId,
        						rsName:ret.rsName,
        						model:ret.model,
        						vendor:ret.vendor,
        						roCode:ret.roCode,
        						eventCode:info.eventCode,
        						eventName:info.eventName,
        						fitType:info.fitType,
        						creatorId:info.creatorId,
        						createDate:info.createDate,
        						oper:info.oper,
        						operTime:info.operTime,
        						department:info.department,
        						contactWay:info.contactWay,
        						comments:info.comments
        				};
        				utils.ajax('equipmentRecordService','addEquipmentRecord',param).done(function(ret){
            				if(ret.code == 'success'){
            					fish.info('新增成功！');
                				popup.close(ret);
            				}else{
            					fish.error('操作失败！');
            				}
            			}).fail(function(e){
        		         	console.log(e);
        		         	fish.error(e);
    	            	});
    				}
    			});
    		},
    		updateAction:function(){
    			var html=$(this.template(this.i18nData));
    			this._initForm(html);
    			$('#updateForm').show();
                this.$('#record-info-form').hide();
                this.$el.trigger("loadRecordByRoId");
    		},
    		createAction:function(){
    			var html=$(this.template(this.i18nData));
    			this._initForm(html);
				this.$el.trigger("loadRecordByRoId");
    		},
    		getNowFormatDate:function(){
    			var date = new Date();
			    var seperator1 = "-";
			    var seperator2 = ":";
			    var year = date.getFullYear();
			    var month = date.getMonth() + 1;
			    var strDate = date.getDate();
			    if (month >= 1 && month <= 9) {
			        month = "0" + month;
			    }
			    if (strDate >= 0 && strDate <= 9) {
			        strDate = "0" + strDate;
			    }
			    var currentdate = year + seperator1 + month + seperator1 + strDate
			            + " " + date.getHours() + seperator2 + date.getMinutes()
			            + seperator2 + date.getSeconds();
			    return currentdate;
    		}
    	});
    });