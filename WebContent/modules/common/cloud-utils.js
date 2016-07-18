define(function () {
    return (function () {
        var utils = function () {
        };
        utils.prototype = utils.fn = {
            getHash: function (u) {
            	/* 获取锚点和request parameters
            	 * command
            	 * page
            	 * pageRoute
            	 * params
            	 */
            	if(u&&!u.startsWith('#')){
            		u=u.substr(u.indexOf('#'))
            	}
            	
            	var baseUrl = u;
            	if(baseUrl==null){
            		baseUrl=window.location.hash;
            	}
                var h = u;
                if(h==null){
            		h=window.location.hash;
            	}                
                
                var result = {command: '#', page: '', params: []};
                if (baseUrl.startsWith('#!')) {
                    h = baseUrl.substr(2);
                    result.command = '#!';

                }
                else if (baseUrl.startsWith('#?')) {
                    h = baseUrl.substr(2);
                    result.command = '#?';
                }
                else if (baseUrl.startsWith('#/')) {
                    h = baseUrl.substr(2);
                    result.command = '#/';
                }
                else if (baseUrl.startsWith('#')) {
                    h = baseUrl.substr(1);
                }

                if (result.command != '#?') {
                    var indexOfQ = h.indexOf('?');
                    if (indexOfQ > 0) {
                        result.page = h.substr(0, indexOfQ);
                        h = h.substr(indexOfQ + 1, h.length);
                    }
                    else{
                        result.page = h;
                    }
                }
                
                if(result.page){
                	result.pageRoute=result.page.split('/');
                }


                var hashArr = h.split('&');
                $.each(hashArr, function (i, str) {
                    var tmp = str.split('=');

                    if (tmp.length >= 2) {
                        var qarr = tmp[1].split(',');
                        if (qarr.length == 1) {
                            result.params.push({
                                type: 'pair',
                                key: tmp[0],
                                value: tmp[1]
                            });
                        }
                        else if (qarr.length > 1) {
                            result.params.push({
                                type: 'list',
                                key: tmp[0],
                                value: qarr
                            });
                        }
                    }
                    else if (tmp.length == 1) {
                        result.params.push({
                            type: 'str',
                            key: tmp[0]
                        });
                    }
                });
                return result;
            },ajax:function(bean,method){
            	/* 调用bean的某个方法
            	 * bean
            	 * method
            	 * p0...px
            	 */
                var param={};
                param.bean=bean;
                param.method=method;
 
                for(var i=2;i<arguments.length;i++){
                    param["p" + (i-2).toString()] = JSON.stringify(arguments[i]);
                } 
                return $.post("callRemoteFunction/exec",param);
             
            },getConditions:function(formId){
               /*用户查询条件要求：操作符号：【等于、不等于、包含、不包含】+输入值
                *界面类似：
                * <form id="demoFormId">
                * <label>单号</label>
                * <select class="form-control" id="demo-oper" name="condOp.orderCode">
                *                         <option value="EQUALS">等于</option>
                *                         <option value="NOT_EQUALS">不等于</option>
                *                         <option value="LIKE">包含</option>
                *                         <option value="NOT_LIKE">不包含</option>
                * </select>
                * <input class="form-control" type="text"  id="demo-ordercode" name="condName.orderCode"  
                *   placeholder="请输入单号" > 
                *</form> 
                *  注意：condOp.orderCode和condName.orderCode组成一个查询条件，分别表示对查询条件orderCode的操作符和输入值。
                *  假设用户选择等于，输入OC0001，调用该方法: var conditons = cloud-utils.getConditions("demoFormId");
                *  获得结果为： [{op:"EQUALS",name:"orderCode",value:"OC0001"}]
                */
               var conds = [];
               var oringinVals = $('#'+formId).form('value');
               for (var key in  oringinVals) {
                  if(key.match('^condName\..+') && oringinVals[key] && $.trim(oringinVals[key]) != '' ){
                     var name = key.substring(9,key.length);
                     var cond = {};
                     cond.op = oringinVals['condOp.'+name];
                     cond.name = name;
                     cond.value = oringinVals[key];
                     conds.push(cond);
                  }
               };
               return conds;
          },
          
          /**
           * 获取页面框架头部、Tab业的高度，用于计算子视图的可用高度
           */
          getHeadHeight:function(){
        	  var navbarHeight = $(".navbar").outerHeight(true);
        	  var navHeight = $(".ui-tabs-nav").outerHeight(true);
        	  
        	  return navbarHeight + navHeight + 23;
          }

        };
        return new utils();


    })();
});