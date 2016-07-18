define([
        'text!modules/idcrm/serverequipment/templates/IPAddressFormView.html',
        'i18n!modules/idcrm/serverequipment/i18n/IPAddressFormView.i18n',
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
               me._initIPAddressGrid();

               var realDictType ="IP_RELA_TYPE";
               utils.ajax('commonService','getDictsByTypeCode',realDictType).done(function(retDatas){                   
                    me.realTypeDict = retDatas;               
               });

               me.getPerIPAddressData(1);
            },
            _initIPAddressGrid:function(){
                var getPerIPAddressData = $.proxy(this.getPerIPAddressData,this); //函数作用域改变
                var me = this;
                var $srGrid = this.$('#serverequip-ipaddress-grid').grid({
                  datatype: 'json',
                  width:'100%',
                  height:450,
                  colModel: [{
                    name: 'boardCode',
                    label: '设备板卡',
                    width: 200
                  }, {
                    name: 'portCode',
                    width: 200,
                    label: '设备端口'
                  }, {
                    name: 'relaType', //设备关联表的类型
                    label: '类型',
                    width: 100,
                    formatter:function(cellval,opts,rwdat,_act){
                       var findObj;
                       if(me.realTypeDict){
                          findObj = fish.find(me.realTypeDict,function(item){ return item.dictCode == cellval; });
                       }
                       var newVal = findObj ? findObj.dictName:cellval;
                       return (newVal ||'');
                    }
                  }, {
                    name: 'vlan',
                    width: 150,
                    label: 'VLAN'
                  },{
                    name: 'ipAddress',
                    width: 150,
                    label: 'IP地址'
                  }, {
                    name: 'ipSeg',
                    width: 150,
                    label: 'IP地址段'
                  },{
                    name: 'gateway',
                    width: 150,
                    label: '网关'

                  },{
                    name: 'realId',
                    label: 'IP设备关联ID',
                    key:true,
                    hidden:true
                  }],
                  rowNum: 30,
                  rowList: [10,15,30,50],
                  pager: true,
                  shrinkToFit:true,
                  multiselect:true,
                  recordtext: '当前显示 {0} - {1} 条记录 共 {2} 条记录',
                                          pgtext: '第 {0} 页 / 共 {1} 页',
                                          emptyrecords: '没有记录',
                  displayNum:3,
                  pageData: getPerIPAddressData //同步场景直接用getPerData,返回json格式数据;异步场景用getPerData2,先返回false中断内部逻辑,再通过 jQuery('#dispatch-caselist-grid').grid('reloadData',getPerData(1))来加载数据;
                });

            },
            getPerIPAddressData: function(page, rowNum, sortname, sortorder) { //请求服务器获取数据的方法

              var me = this;
              rowNum = rowNum || this.$('#serverequip-ipaddress-grid').grid('getGridParam', 'rowNum');
              
              me.$('#serverequip-ipaddress-grid').blockUI({message:'查询中...'});
              utils.ajax('ipaddrservice','findIPListByEqIdAndEqType',me.options.id,me.options.resTypeId,page,rowNum)
                   .always(function(){
                      me.$('#serverequip-ipaddress-grid').unblockUI();
                   }).done(function(datas)  {                    
                      me.$('#serverequip-ipaddress-grid').grid('reloadData', datas);
                   });

              return false;
            }
        });
    });
    