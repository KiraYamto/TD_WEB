define([
        'text!modules/idcrm/serverequipment/templates/VirtualMachineFormView.html',
        'i18n!modules/idcrm/serverequipment/i18n/VirtualMachineFormView.i18n',
        'modules/common/cloud-utils'
    ], function(htmlTpl,i18nData,utils) {
        return fish.View.extend({
            template: fish.compile(htmlTpl),
            i18nData: fish.extend({}, i18nData),
            events: {//事件对象的书写格式为 {"event selector": "callback"}。 省略 selector 则事件被绑定到视图的根元素（this.el),可以用this.$el.trigger触发。             
            },
            //这里用来进行dom操作
            _render: function() {
               this.$el.html(this.template(this.i18nData));               
               return this;
            },
            _afterRender: function() {
               this._initVlanPoolGrid();
               this._initVirMachineGrid();
               this.getPerVlanPoolData(1);
               this.getPerVirMachineData(1);
            },
            _initVlanPoolGrid:function(){
                var getPerVlanPoolData = $.proxy(this.getPerVlanPoolData,this); //函数作用域改变
                var me = this;
                var $srGrid = this.$("#serverequip-respool-grid").grid({
                  datatype: "json",
                  height:200,
                  colModel: [{
                    name: 'vcenterCode',
                    label: '资源池',
                    width: '35%'
                  }, {
                    name: 'vdcCode',                  
                    label: '虚数据中心',
                    width: '35%'
                  }, {
                    name: 'pubCode',
                    label: '集群',
                    width: '30%'
                  },{
                    name: 'id',
                    label: '资源设备关联VCENTER_ID',
                    key:true,
                    hidden:true
                  }],
                  rowNum: 15,
                  rowList: [10,15,30,50],
                  pager: true,
                  shrinkToFit:true,
                  recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
                                          pgtext: "第 {0} 页 / 共 {1} 页",
                                          emptyrecords: "没有记录",
                  displayNum:3,
                  pageData: getPerVlanPoolData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
                });

            },
            getPerVlanPoolData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法

              var me = this;
              rowNum = rowNum || this.$("#serverequip-respool-grid").grid("getGridParam", "rowNum");

              me.$("#serverequip-respool-grid").blockUI({message:'查询中...'});
              utils.ajax('serverEquipmentService','queryVCenterByEqIdAndResType',me.options.id,me.options.resTypeId,page,rowNum)
                   .always(function(){
                      me.$("#serverequip-respool-grid").unblockUI();
                   }).done(function(datas) {  
                      me.$("#serverequip-respool-grid").grid("reloadData", datas);
                   });

              return false;
            },
            _initVirMachineGrid:function(){
                var getPerVirMachineData = $.proxy(this.getPerVirMachineData,this); //函数作用域改变
                var me = this;
                var $srGrid = this.$("#serverequip-virmachine-grid").grid({
                  datatype: "json",
                  width:'100%',
                  height:200,
                  colModel: [{
                    name: 'vmUuid',
                    label: 'UUID',
                    width: 180
                  }, {
                    name: 'vmName',
                    width: 180,
                    label: '名称'
                  }, {
                    name: 'pathName',
                    label: '全路径',
                    width: 180
                  }, {
                    name: 'cpuNum',
                    width: 150,
                    label: 'CPU数量'
                  },{
                    name: 'memorySizeMb',
                    width: 150,
                    label: '内存容量'
                  },{
                    name: 'storeSpaceMb',
                    width: 150,
                    label: '已分配存储'
                  },{
                    name: 'id',
                    label: '虚主机ID',
                    key:true,
                    hidden:true
                  }],
                  rowNum: 15,
                  rowList: [10,15,30,50],
                  pager: true,
                  shrinkToFit:true,
                  recordtext: "当前显示 {0} - {1} 条记录 共 {2} 条记录",
                                          pgtext: "第 {0} 页 / 共 {1} 页",
                                          emptyrecords: "没有记录",
                  displayNum:3,
                  pageData: getPerVirMachineData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery("#dispatch-caselist-grid").grid("reloadData",getPerData(1))来加载数据;
                });

            },
            getPerVirMachineData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法

              var me = this;
              rowNum = rowNum || this.$("#serverequip-virmachine-grid").grid("getGridParam", "rowNum");
              
              me.$("#serverequip-virmachine-grid").blockUI({message:'查询中...'});
              utils.ajax('serverEquipmentService','queryVmByEqId',me.options.id,page,rowNum)
                   .always(function(){
                      me.$("#serverequip-virmachine-grid").unblockUI();
                   }).done(function(datas){
                      me.$("#serverequip-virmachine-grid").grid("reloadData", datas);
                   });

              return false;
            }
        });
    });