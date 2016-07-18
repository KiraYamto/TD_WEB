define([
        'text!modules/idcrm/serverequipment/templates/RelaStorageFormView.html',
        'i18n!modules/idcrm/serverequipment/i18n/RelaStorageFormView.i18n',
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

            dictDatas:{},

            _afterRender: function() {
               var me = this;
               me._initRelaStorageGrid();
               utils.ajax('commonService','getDLCVByTypeCode','PHY_SERVER_CHASSIS').done(function(retDatas){ 
                   me.dictDatas['PHY_SERVER_CHASSIS'] = retDatas;               
                   me.getPerRelaStorageData(1);
                });
               
            },
            _initRelaStorageGrid:function(){
                var getPerRelaStorageData = $.proxy(this.getPerRelaStorageData,this); //函数作用域改变
                var me = this;
                var $srGrid = this.$('#serverequip-relaStorage-grid').grid({
                  datatype: 'json',
                  height:450,
                  colModel: [{
                    name: 'eqName',
                    label: '设备名称',
                    width: 180
                  }, {
                    name: 'eqCode',
                    width: 180,
                    label: '设备编码'
                  }, {
                    name: 'dcName',
                    label: '所属数据中心',
                    width: 200
                  }, {
                    name: 'roomName',
                    width: 200,
                    label: '所属机房'
                  },{
                    name: 'chassisTypeId',
                    width: 120,
                    label: '设备类型',
                    formatter:function(cellval,opts,rwdat,_act){
                       var datas = me.dictDatas['PHY_SERVER_CHASSIS'];
                       var findObj = datas ? fish.find(datas,function(obj){ return obj.code == cellval;}) : null;
                       var newVal = findObj && findObj.value ? findObj.value :cellval;
                       return (newVal ||'');
                    }
                  }, {
                    name: 'id',
                    label: '关联存储ID',
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
                  pageData: getPerRelaStorageData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery('#dispatch-caselist-grid').grid('reloadData',getPerData(1))来加载数据;
                });

            },
            getPerRelaStorageData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法

              var me = this;
              var conds = me.$('#serverequip-relaStorage-grid').grid('option', 'qryConds');
              rowNum = rowNum || this.$('#serverequip-relaStorage-grid').grid('getGridParam', 'rowNum');
              
              var params = {};
              params.conditions=conds;
              params.pageIdx=page;
              params.pageSize=rowNum;
              
              me.$('#serverequip-relaStorage-grid').blockUI({message:'查询中...'});
              utils.ajax('serverEquipmentService','queryByCond',conds,page,rowNum)
                   .always(function(){
                                me.$('#serverequip-relaStorage-grid').unblockUI();
                          })
                 .done(function(ret)  {        
                   var datas = {
                        'total': Math.ceil(ret.total/rowNum),
                       'page': page, 
                       'records': ret.total, 
                       'rows': ret.rows
                     };   
                  me.$('#serverequip-relaStorage-grid').grid('reloadData', datas);
                 });

              return false;
              
            }
        });
    });
    