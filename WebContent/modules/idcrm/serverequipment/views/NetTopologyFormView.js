define([
        'text!modules/idcrm/serverequipment/templates/NetTopologyFormView.html',
        'i18n!modules/idcrm/serverequipment/i18n/NetTopologyFormView.i18n',
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
               this._initNetTopoGrid();
               this.getPerNetTopoData(1);
            },
            _initNetTopoGrid:function(){
                var getPerNetTopoData = $.proxy(this.getPerNetTopoData,this); //函数作用域改变
                var me = this;
                var $srGrid = this.$('#serverequip-nettopo-grid').grid({
                  datatype: 'json',
                  width:'100%',
                  height:450,
                  colModel: [{
                    name: 'boardCode',
                    label: '设备板卡',
                    width: 200
                  }, {
                    name: 'portCode',
                    width: 120,
                    label: '设备端口'
                  }, {
                    name: 'opEqRsTypeId', //设备关联表的类型
                    label: '对端设备类型',
                    width: 180
                  }, {
                    name: 'opEqCode',
                    width: 200,
                    label: '对端设备编码'
                  },{
                    name: 'opPortCode',
                    width: 100,
                    label: '对端设备端口'
                  },{
                    name: 'relaId',
                    label: '端口关联ID',
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
                  pageData: getPerNetTopoData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery('#dispatch-caselist-grid').grid('reloadData',getPerData(1))来加载数据;
                });

            },
            getPerNetTopoData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法

              var me = this;
              rowNum = rowNum || this.$('#serverequip-nettopo-grid').grid('getGridParam', 'rowNum');            
              me.$('#serverequip-nettopo-grid').blockUI({message:'查询中...'});
              utils.ajax('iRsPortService','findTopoList',me.options.id,me.options.resTypeId,page,rowNum)
                   .always(function(){
                      me.$('#serverequip-nettopo-grid').unblockUI();
                   }).done(function(datas)  {  
                      me.$('#serverequip-nettopo-grid').grid('reloadData', datas);
                  });

              return false;
            }
        });
    });
    