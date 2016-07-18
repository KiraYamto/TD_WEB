define([
	'text!modules/idcrm/serverequipment/templates/ServerEquipMngView.html',
	'i18n!modules/idcrm/serverequipment/i18n/ServerEquipMng.i18n',
	'css!modules/idcrm/serverequipment/styles/ServerEquipMng',
	'modules/common/cloud-utils'
], function(htmlTpl, i18nData,css,utils) {
    
	return fish.View.extend({
		template: fish.compile(htmlTpl),

		i18nData: fish.extend({}, i18nData),

		events: {
		   'click #serverequipment-srnt-search-btn':'searchNavTree',
		   'keypress #serverequipment-nav-name':'inputkeyDown',
		   'click #serverequipment-search-btn':'searchServerEquips',
		   'click #serverequipment-create-btn':'createServerEquip',
		   'click #serverequipment-update-btn':'updateServerEquip',
		   'click #serverequipment-del-btn':'delServerEquip',
		   'click #serverequipment-detail-btn':'showServerEquip',
		   'click #serverequipment-export-btn':'exportServerEquip',
		   'click #serverequipment-morequery-btn':'moreQueryBtnClick'
		},
		dictDatas:{},

		dictComps:{},

		//这里用来进行dom操作
		_render: function() {
			this.$el.html(this.template(this.i18nData));
			return this;
		},
           
		//这里用来初始化页面上要用到的fish组件
		_afterRender: function() {
		   var me = this;
		   me._initQryForm();
           me._initServerEquipGrid();
		   me._initSpaceTree();
		},

		 // 更多查询
        moreQueryBtnClick: function() {
            var height = $('#serverequipment-grid').grid('getSize').height;
            if($('#serverequipment-morequery-div').data('show') == false) {
                $('#serverequipment-morequery-div').show();
                $('#serverequipment-morequery-btn').html('收起↑');
		        $('#serverequipment-morequery-div').data('show',true);
                $('#serverequipment-grid').grid('setGridHeight',height-150);

            } else {
                $('#serverequipment-morequery-div').hide();
                $('#serverequipment-morequery-btn').html('更多↓');
		        $('#serverequipment-morequery-div').data('show',false);
                $('#serverequipment-grid').grid('setGridHeight', height+150);               
            }
        },

		_initQryForm: function(){
            var me = this;
		    me.$('#serverequipment-morequery-div').hide();

		    //机房选择
            me.$('#serverequipmentqry-roomId').popedit({
				dataTextField :'roomName',
				dataValueField :'roomId',
				dialogOption: {
					height: 400,
					width: 500
				},
				url:'js!modules/idcrm/common/popeditviews/dataCenterRoom/views/SelectDCOrRoomView'
			});

             //设备类型
            me.dictComps['PHY_SERVER_CHASSIS'] = me.$('#serverequipmentqry-chassisTypeId').combobox({
                 placeholder: '请选择',
                 dataTextField: 'dictName',
                 dataValueField: 'dictCode'
             });

              //生产模式
              me.dictComps['PRODUCTION_MODE'] = me.$('#serverequipmentqry-prodMode').combobox({
                  placeholder: '请选择',
                  dataTextField: 'dictName',
                  dataValueField: 'dictCode'
              });

               //业务类型
             me.dictComps['BUSINESS_TYPE'] = me.$('#serverequipmentqry-businessType').combobox({
                  placeholder: '请选择',
                  dataTextField: 'dictName',
                  dataValueField: 'dictCode'
              });

              //所属项目
             me.dictComps['RS_PROJECT'] = me.$('#serverequipmentqry-projectCode').combobox({
                  placeholder: '请选择',
                  dataTextField: 'dictName',
                  dataValueField: 'dictCode'
              });

             //所属工程
              var $engineeringCode = me.$('#serverequipmentqry-engineeringCode').combobox({
                  placeholder: '请选择',
                  dataTextField: 'dictName',
                  dataValueField: 'dictCode'
              });

             //设备品牌
              me.dictComps['PHY_SERVER_RS_VENDOR'] = me.$('#serverequipmentqry-vendor').combobox({
                  placeholder: '请选择',
                  dataTextField: 'dictName',
                  dataValueField: 'dictCode'
              });
             
             //设备型号
             var $model = $('#serverequipmentqry-model').combobox({
                  placeholder: '请选择',
                  dataTextField: 'dictName',
                  dataValueField: 'dictCode'
              });
           
			 var $vendor = me.dictComps['PHY_SERVER_RS_VENDOR'];
             $vendor.on('combobox:change', function(e) {
				 var modelDataTypeCode = me.dictComps['PHY_SERVER_RS_VENDOR'].combobox('value'); 
				 $model.combobox('clear');  
                $model.combobox('option','dataSource',me.comboBoxDictDatas[modelDataTypeCode]);               
			 });

			 var $project = me.dictComps['RS_PROJECT'];
             $project.on('combobox:change', function(e) {
				 var engineerDictTypeCode = me.dictComps['RS_PROJECT'].combobox('value'); 
				 $engineeringCode.combobox('clear');  
                 $engineeringCode.combobox('option','dataSource',me.comboBoxDictDatas[engineerDictTypeCode] || []);               
			 });
			 
             var dictTypeCodes = ['PHY_SERVER_CHASSIS','PRODUCTION_MODE','BUSINESS_TYPE','PHY_SERVER_RS_VENDOR','RS_PROJECT'];
			 utils.ajax('commonService','getDictsByTypeCodes',dictTypeCodes).done(function(datas){     
                me.comboBoxDictDatas = datas;
                for(var dictTypeCode in me.comboBoxDictDatas){
                   if(me.dictComps[dictTypeCode]){
                       me.dictComps[dictTypeCode].combobox('option','dataSource',me.comboBoxDictDatas[dictTypeCode] || []);
                   } 
                }

                //工程可选下列值
                var engineerDatas = fish.pluck(me.comboBoxDictDatas['RS_PROJECT'],'dictCode');
	             utils.ajax('commonService','getDictsByTypeCodes',engineerDatas).done(function(retDatas){  
	                 if(!fish.isEmpty(retDatas)){
	                    me.comboBoxDictDatas = _.extendOwn(me.comboBoxDictDatas,retDatas);
	                 } 
	             });

                //型号可选下拉值
                 var vendorDatas = fish.pluck(me.comboBoxDictDatas['PHY_SERVER_RS_VENDOR'],'dictCode');
	             utils.ajax('commonService','getDictsByTypeCodes',vendorDatas).done(function(retDatas){  
	                 if(!fish.isEmpty(retDatas)){
	                    me.comboBoxDictDatas = _.extendOwn(me.comboBoxDictDatas,retDatas);
	                 } 
	             });
             }); 

             var dictMapTypeCodes = ['PHY_SERVER_CHASSIS','PRODUCTION_MODE','BUSINESS_TYPE','PHY_SERVER_RS_VENDOR'];
			 utils.ajax('commonService','getDictMapsByTypeCodes',dictMapTypeCodes).done(function(datas){     
                 me.dictDatas = datas;
                 var vendorDatas = fish.keys(me.dictDatas['PHY_SERVER_RS_VENDOR']);
	             utils.ajax('commonService','getDictMapsByTypeCodes',vendorDatas).done(function(retDatas){  
	                 if(!fish.isEmpty(retDatas)){
	                    me.dictDatas = _.extendOwn(me.dictDatas,retDatas);
	                 } 
	             });
             }); 
		},

		_initServerEquipGrid:function(){
		    var getPerServEqData = $.proxy(this.getPerServEqData,this); //函数作用域改变
		    var me = this;
			var $srGrid = this.$('#serverequipment-grid').grid({
				datatype: 'json',
				width:'100%',
				colModel: [{
					name: 'eqName',
					label: '设备名称',
					width: 200
				}, {
					name: 'eqCode',
					width: 300,
					label: '设备编码'
				}, {
					name: 'dcName',
					label: '所属数据中心',
					width: 180
				}, {
					name: 'roomName',
					width: 200,
					label: '所属机房'
				},{
					name: 'chassisTypeId',
					width: 100,
					label: '设备类型',
					formatter:function(cellval,opts,rwdat,_act){
					   var dictDatas = me.dictDatas['PHY_SERVER_CHASSIS'];
					   var newVal = dictDatas? dictDatas[cellval] : cellval;
					   return (newVal ||'');
					}
				}, {
					name: 'productionMode',
					width: 100,
					label: '生产模式',
					formatter:function(cellval,opts,rwdat,_act){
					   var dictDatas = me.dictDatas['PRODUCTION_MODE'];
					   var newVal = dictDatas? dictDatas[cellval] : cellval;
					   return (newVal ||'');
					}
				},{
					name: 'businessType',
					width: 100,
					label: '业务类型',
					formatter:function(cellval,opts,rwdat,_act){
					   var dictDatas = me.dictDatas['BUSINESS_TYPE'];
					   var newVal = dictDatas? dictDatas[cellval] : cellval;
					   return (newVal ||'');
					}
				},{
					name: 'vendor',
					width: 100,
					label: '设备品牌',
					formatter:function(cellval,opts,rwdat,_act){
					   var dictDatas = me.dictDatas['PHY_SERVER_RS_VENDOR'];
					   var newVal = dictDatas? dictDatas[cellval] : cellval;
					   return (newVal ||'');
					}

				},{
					name: 'model',
					width: 100,
					label: '设备型号',
					formatter:function(cellval,opts,rwdat,_act){
					   var vendor = rwdat['vendor'];
					   var dictDatas = me.dictDatas[vendor];
					   var newVal = dictDatas? dictDatas[cellval] : cellval;
					   return (newVal ||'');
					}
				},{
					name: 'comments',
					width: 200,
					label: '备注'
				},{
					name: 'id',
					label: '物理机ID',
					key:true,
					hidden:true
				}],
				rowNum: 15,
				rowList: [15,30,50],
				pager: true,
				shrinkToFit:false,
				multiselect:true,
				recordtext: '当前显示 {0} - {1} 条记录 共 {2} 条记录',
                                pgtext: '第 {0} 页 / 共 {1} 页',
                                emptyrecords: '没有记录',
				displayNum:3,
				pageData: getPerServEqData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery('#dispatch-caselist-grid').grid('reloadData',getPerData(1))来加载数据;
			});
		},

		getPerServEqData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法

		    var me = this;
            var conds = me.$('#serverequipment-grid').grid('option', 'qryConds');
			rowNum = rowNum || this.$('#serverequipment-grid').grid('getGridParam', 'rowNum');
			
			var params = {};
			params.conditions=conds;
			
			me.$('#serverequipment-grid').blockUI({message:'查询中...'});
			utils.ajax('serverEquipmentService','queryByCond',conds,page,rowNum)
			     .always(function(){
                        me.$('#serverequipment-grid').unblockUI();
                  })
				 .done(function(datas)	{
				 	me.$('#serverequipment-grid').grid('reloadData', datas);
				 });

			return false;
		},

		_initSpaceTree: function(){
		    var me =this;
           //滚动条		    
		    $('#serverequipment-spacers-navtreeDiv').niceScroll('#serverequipment-spacers-navtree',{
		                        cursorcolor: '#CE0015',
			               cursorwidth: '7px'}); 
		    
		   
		     var onNavTreeClick = $.proxy(this.onNavTreeClick,this); //函数作用域改变
             var settings = {
                  view:{
                     dblClickExpand: false
                  },
                  data: {
                          simpleData: {
                              enable: true,
                              rootPId:'area_0'
                          }
                        },
                 callback: {
                             onClick: onNavTreeClick
                           }
             };
             me.$('#serverequipment-spacers-navtree').tree(settings);
             //获取区域和数据中心
             me.loadResNavTree(null);           
		},

	    onNavTreeClick: function(e, treeNode){
		    var me = this;
		    me.loadGridByTreeNode(treeNode);

            if(treeNode.loadedChild){
		       return;
		    }
		    treeNode.loadedChild = true; //标识是否展开过
		    if(treeNode.tag=='area' || treeNode.tag=='dataCenter'){
		       me.loadResNavTree(treeNode);
		    }           
		},

		loadResNavTree: function(treeNode){
		   var me = this;
		   var treeNodeKId,tag,isIncludeSelf=false;
		   if(treeNode == null){
              treeNodeKId = null;
		      tag = 'area';
		   }else{
		      treeNodeKId = treeNode.kId;
		      tag = treeNode.tag;
		   }
		   me.$('#serverequipment-spacers-navtree').blockUI({message:''});
		   utils.ajax('commonService', 'getResourceTree',treeNodeKId,tag,isIncludeSelf)
			     .always(function(){
                     me.$('#serverequipment-spacers-navtree').unblockUI();   
                 }).done(
					function(nodeDatas) {
			           if(!nodeDatas){
		   	              nodeDatas = [];
			   	       }
	                   fish.each(nodeDatas,function(element, index){
			   	           element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	       });
				      var navTree = me.$('#serverequipment-spacers-navtree').tree("instance");
				      if(null != treeNode){
				         navTree.removeChildNodes(treeNode);
				      }
	                  
	                  navTree.addNodes(treeNode,nodeDatas);
	            //      navTree.expandNode(treeNode,true);

	                  if(null == treeNode){//根节点，再加载
	                     var nodes = navTree.getNodes();
	                     if(nodes && nodes.length > 0){
	                         me.loadResNavTree(nodes[0]);
	                     }
	                  }

			    }).fail(function(){
                     console.log("加载空间树的失败,treeNode:"+JSON.stringify(treeNode));
                });
		},

       //右侧显示当前物理机列表信息
		loadGridByTreeNode: function(treeNode){
            var me = this;
            if(treeNode.tag== me.treeNodeTags.dataCenter){
                var conds = [{'op':'EQUALS','name':'dcId','value':treeNode.kId}];
                me.$('#serverequipment-grid').grid('option', 'qryConds',conds);
		        me.getPerServEqData(1);
            }else if(treeNode.tag== me.treeNodeTags.area){
                var conds = [{'op':'EQUALS','name':'areaId','value':treeNode.kId}];
                me.$('#serverequipment-grid').grid('option', 'qryConds',conds);
		        me.getPerServEqData(1);
            }else if(treeNode.tag== me.treeNodeTags.dcRoom){
                var conds = [{'op':'EQUALS','name':'roomId','value':treeNode.kId}];
                me.$('#serverequipment-grid').grid('option', 'qryConds',conds);
		        me.getPerServEqData(1);
            }
		},

		searchNavTree:function(){
		     var me = this;
		     this.$('#serverequipment-spacers-navtree').blockUI({message:''});     
		     var cond = this.$('#serverequipment-nav-name').val();
		     utils.ajax('commonService','getRoomNavTreeByName',cond)
		         .always(function(){
                     me.$('#serverequipment-spacers-navtree').unblockUI(); 
                 })
		   	     .done(function(nodeDatas){
		   	         if(!nodeDatas){
		   	             nodeDatas = [];
			   	      }
	                  fish.each(nodeDatas,function(element, index){
			   	         element.icon = me.getNavtreeIcon(element.tag,element.grade);
			   	      });
			       var navTreeInst = me.$('#serverequipment-spacers-navtree').tree('instance');
		           navTreeInst.reloadData(nodeDatas);
		           navTreeInst.expandAll(true);
                 });
		},

		inputkeyDown: function(e){
		    if(e.keyCode == 13){ //回车键
		       this.searchNavTree();
		    }
		},

		_getSelServerEquip:function(){
		    var selRows = this.$('#serverequipment-grid').grid('getCheckRows');
		    if (selRows==null||selRows.length==0|| selRows.length > 1){
		        fish.info('请选择一个物理机');
		        return;
		    }
		    return selRows[0];
		},

		_getSelServerEquips:function(){
		    var selRows = this.$('#serverequipment-grid').grid('getCheckRows');
		    if (selRows==null||selRows.length==0){
		        fish.info('请至少选择一个物理机');
		        return;
		    }
		    return selRows;
		},
		
		searchServerEquips:function(){//查询
		  //获取查询条件
		   var conds = utils.getConditions('serverequipment-Qryform');
		   if($('#serverequipment-morequery-div').data('show') == true) {
		      var moreCond = utils.getConditions('serverequipment-QryformMore');
		      conds = fish.union(conds,moreCond);
		   }
		   this.$('#serverequipment-grid').grid('option', 'qryConds',conds);
		   this.getPerServEqData(1);
		},

		createServerEquip:function(){//新增
		  var me = this;
		  fish.popupView({ 
		       url: 'modules/idcrm/serverequipment/views/ServerEquipMainFormView',
			   width: '98%',height:600,viewOption:{action:'insert'},	
			   callback:function(popup,view){
			   	   popup.result.then(function (ret) {
			   	       if(ret && ret.isSuccess){
			   	         fish.confirm('是否打开添加虚资源？').result.then(function(){
			   	            me.getPerServEqData(1);
			   	            me.updatePopView(ret.data);
			   	         },function(){
			   	            me.getPerServEqData(1);
			   	         });
	                      
	                   } 
			   	   },function (e) {
			   	   	  console.log('关闭了',e);
			   	   });
			   }
		  });
		},

		updateServerEquip:function(){//修改
		 
          var selServerEquip = this._getSelServerEquip();
          if(!selServerEquip){
             return;
          } 
          this.updatePopView(selServerEquip);
		},

		updatePopView:function(selServerEquip){
           var me = this;
   		   fish.popupView({
   		         url: 'modules/idcrm/serverequipment/views/ServerEquipMainFormView',
	             width: '98%',height:600,	
	             viewOption:{action:'modify',id:selServerEquip.id,resTypeId:selServerEquip.rsTypeId},	
	             callback:function(popup,view){
	             	popup.result.then(function (ret){
	             	    if(ret && ret.isSuccess){
	             	       me.getPerServEqData(1);
	             	    } 
	             	},function (e) {
	             		console.log('关闭了',e);
	             	});
	             }
           });
		},

		delServerEquip:function(){//删除
		    var me = this;
			fish.confirm('是否删除物理机？').result.then(function() {	 

			    var delServerEquips = me._getSelServerEquips(); 
			    var seIds = [],roomIds = [];
			    for (var i = delServerEquips.length - 1; i >= 0; i--) {
			    	seIds.push(delServerEquips[i].id);
			    	roomIds.push(delServerEquips[i].roomId);
			    }
			    if(seIds && seIds.length > 0){
			       me.$el.blockUI({message:'提交中...'});
			       utils.ajax('serverEquipmentService','batchDelServerEqIds',seIds)
			           .always(function(){
	                        me.$el.unblockUI();
	                    })
		               .done(function(ret){
	                       if(ret && ret.code === 'SUCCESS'){
			                    fish.info(ret.msg,function(){
	                              me.getPerServEqData(1);                      
	                           });
					       }else{
					           fish.error(ret?ret.msg:'删除失败');
					       }
		               })
		               .fail(function(e){
		               	   console.log(e);
		               	   fish.error('删除失败,'+e.message);
		               });
			    }         
	        });
		},

		showServerEquip:function(){//展示
		  var me = this;
          var selServerEquip = this._getSelServerEquip();
          if(selServerEquip){
               var pop = fish.popupView({url: 'modules/idcrm/serverequipment/views/ServerEquipMainFormView',
	               width: '98%',height:600,	
	               viewOption:{action:'detail',id:selServerEquip.id,resTypeId:selServerEquip.rsTypeId}
               });
          }
		},

		exportServerEquip:function(){//导出
           fish.info('尚未实现');
		},

		resize:function(){
		   var containerParentheight = $('.serverequipment-mng-container').parent().parent().outerHeight();
		   this.$('#serverequipment-grid').grid('setGridHeight',containerParentheight-50);
		   this.$('#serverequipment-grid').grid('resize',true);
           
           this.$('#serverequipment-spacers-navtreeDiv').height(containerParentheight-30);		  
		},

		treeNodeTags:{
		   area:'area',
		   dataCenter:'dataCenter',
		   dcRoom:'dcRoom'
		},

		treeNodeIcon:{
		   'area':{'C2':'resources/images/idc/treeNode/province.png',
		           'C3':'resources/images/idc/treeNode/city.png',
		           'C4':'resources/images/idc/treeNode/county.png'
		    },
		   'dataCenter':'resources/images/idc/treeNode/datacenter.png',
		   'dcRoom':'resources/images/idc/treeNode/room.png'
		},

		getNavtreeIcon: function(tag,grade){//空间资源导航树图标
		   var icon;
		   if(grade){
              icon = this.treeNodeIcon[tag][grade];
		   }else{
		      icon = this.treeNodeIcon[tag];
		   }
		   return icon? icon:'';
		}
	});
});