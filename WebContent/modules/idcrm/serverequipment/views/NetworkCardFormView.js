define([
        'text!modules/idcrm/serverequipment/templates/NetworkCardFormView.html',
        'i18n!modules/idcrm/serverequipment/i18n/NetworkCardFormView.i18n',
        'modules/common/cloud-utils'
    ], function(htmlTpl,i18nData,utils) {
        return fish.View.extend({
            template: fish.compile(htmlTpl),
            i18nData: fish.extend({}, i18nData),
            events: {//事件对象的书写格式为 {'event selector': 'callback'}。 省略 selector 则事件被绑定到视图的根元素（this.el),可以用this.$el.trigger触发。             
            },
            //这里用来进行dom操作
            _render: function() {
               this.$el.html(this.template(this.i18nData));               
               return this;
            },
            _afterRender: function() {
               var me = this;
               me._initNetworkCardGrid();
               utils.ajax('commonService','getDictMapsByTypeCode','NETWORK_CARD_RS').done(function(datas){     
                   me.classTypeDictDatas = datas;
                   me.getPerNetworkCardData(1);
               }); 
            },
            _initNetworkCardGrid:function(){
                var getPerNetworkCardData = $.proxy(this.getPerNetworkCardData,this); //函数作用域改变
                var me = this;
                var $srGrid = this.$('#serverequip-networkcard-grid').grid({
                  datatype: 'json',
                  width:'100%',
                  height:450,
                  colModel: [{
                    name: 'slotName',
                    label: '槽位',
                    width: 200
                  }, {
                    name: 'chassisTypeId',
                    width: 120,
                    label: '类型',
                    formatter:function(cellval,opts,rwdat,_act){
                        var newVal = me.classTypeDictDatas? classTypeDictDatas[cellval] : cellval;
                        return (newVal ||'');
                    }
                  }, {
                    name: 'vendorName',
                    label: '品牌',
                    width: 180
                  }, {
                    name: 'modelName',
                    width: 200,
                    label: '型号'
                  },{
                    name: 'name',
                    width: 100,
                    label: '名称'
                  }, {
                    name: 'portNum',
                    width: 100,
                    label: '端口数量'
                  },{
                    name: 'id',
                    label: '网卡ID',
                    key:true,
                    hidden:true
                  }],
                  rowNum: 30,
                  rowList: [10,15,30,50],
                  pager: true,
                  shrinkToFit:true,
                  recordtext: '当前显示 {0} - {1} 条记录 共 {2} 条记录',
                                          pgtext: '第 {0} 页 / 共 {1} 页',
                                          emptyrecords: '没有记录',
                  displayNum:3,
                  pageData: getPerNetworkCardData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery('#dispatch-caselist-grid').grid('reloadData',getPerData(1))来加载数据;
                });

            },
            getPerNetworkCardData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法

              var me = this;
              var conds = [{'op':'EQUALS','name':'eqId','value':me.options.id},
                           {'op':'EQUALS','name':'relateRsTypeId','value':me.options.resTypeId}];
              rowNum = rowNum || this.$('#serverequip-networkcard-grid').grid('getGridParam', 'rowNum');
              
              var params = {};
              params.conditions=conds;
              params.pageIdx=page;
              params.pageSize=rowNum;
              
              me.$('#serverequip-networkcard-grid').blockUI({message:'查询中...'});
              utils.ajax('netEquipBoardService','findNetEquipBoardListByCond',params)
                   .always(function(){
                       me.$('#serverequip-networkcard-grid').unblockUI();
                   }).done(function(datas)  {  
                       me.$('#serverequip-networkcard-grid').grid('reloadData', datas);
                   });

              return false;
            }
        });
    });
    