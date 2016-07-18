define([
	'text!modules/idcrm/rmconfig/templates/ResourceConfigView.html',
	'i18n!modules/idcrm/rmconfig/i18n/ResourceConfig.i18n',
	'modules/common/cloud-utils',
	'css!modules/idcrm//rmconfig/styles/ResourceConfig.css'
], function(AgencyMenegementViewTpl, i18nAgency,utils,css) {
	return fish.View.extend({
		template: fish.compile(AgencyMenegementViewTpl),
		i18nData: fish.extend({}, i18nAgency),
		events: {
			"click #rmconfig-auto-conf-btn": "rmconfigAutoConfClick",
			"click #rmconfig-submit-btn": "rmconfigSubmitClick",
			'click #rmconfig-frame-conf-btn':'rmconfigFrameConfClick',
			'click #rmconfig-port-conf-btn':'rmconfigPortConfClick',
			'click #rmconfig-ip-conf-btn':'rmconfigIpConfClick',
			'click #rmconfig-repeal-btn':'rmconfigRepealClick',
			'click #rmconfig-cancel-btn':'rmconfigCancelClick'
		},                              
		  

		 //这里用来进行dom操作
        _render: function () {
            this.$el.html(this.template(this.i18nData));
            return this;
        },
		
        
        //这里用来初始化页面上要用到的fish组件
        _afterRender: function () {
            this.loadConfFrameRender();
        },
        
        loadConfFrameRender : function (){
        
        //配置信息
   		 var frameGridProxy = $.proxy(this.frameGrid,this);
		 var portsGridProxy = $.proxy(this.portsGrid,this);
		 var ipGridProxy = $.proxy(this.ipGrid,this);
		 //显示信息
		 var setShowPortProxy = $.proxy(this.setShowPort,this);
		 var setShowFrameProxy = $.proxy(this.setShowFrame,this);
		 var setShowIpProxy = $.proxy(this.setShowIp,this);
		 //cache
		 var setCacheProxy = $.proxy(this.setCache,this);
		 var getCacheProxy = $.proxy(this.getCache,this);
		 
		 var setConfigResultProxy = $.proxy(this.setConfigResult,this);
		 var getConfigResultProxy = $.proxy(this.getConfigResult,this);
		
		 var iomObj;
		 
        	//1,调用开通接口，获取json对象
        	//utils.ajax('iomService','qryConfigResourceInfo',this.options.baseOrderId).done(function(ret){
		
		 
		 iomObj= {
				    "custDto": {
				        "id": 668000,
				        "custCode": "203010462233",
				        "custName": "中国共产党许昌市纪律检委员会",
				        "custGradeId": 1,
				        "custType": "1",
				        "email": "",
				        "zipcode": "",
				        "address": "河南省许昌市建安大道1516号",
				        "createdDate": "Apr 19, 2016 12:18:22 AM",
				        "updateDate": "Apr 19, 2016 12:18:22 AM",
				        "state": "A",
				        "stateDate": "May 20, 2016 3:41:42 PM",
				        "crmCustId": "203010462233",
				        "custTypeName": "普通",
				        "custGradeDto": {},
				        "linkmanDtos": [
				            {
				                "custId": 668000,
				                "id": 642000,
				                "linkmanName": "中国共产党许昌市纪律检委员会",
				                "sex": "",
				                "officePhone": "",
				                "homePhone": "",
				                "mobilePhone": "",
				                "fax": "",
				                "zipcode": "",
				                "mailAddr": "河南省许昌市建安大道1516号",
				                "email": "",
				                "mainComm": "",
				                "comments": "",
				                "createdDate": "Apr 19, 2016 12:17:01 AM",
				                "updateDate": "Apr 19, 2016 12:17:01 AM",
				                "state": "10A",
				                "stateDate": "Apr 19, 2016 12:17:01 AM"
				            }
				        ],
				        "roleType": "1",
				        "areaId": 10,
				        "areaName": "许昌",
				        "certTypeId": 21,
				        "certNbr": "00574704X",
				        "custManagerId": 123
				    },
				    "dependProdOrderDtos": [
				        {
				            "id": 14300028,
				            "serviceOrderId": 14300007,
				            "dependProdId": 1969,
				            "actType": "ADD",
				            "dependProdOrderAttrDtos": [
				                {
				                    "dependProdOrderId": 14300028,
				                    "characterId": 65,
				                    "characterValue": "2016-04-11 08:39:39",
				                    "characteName": "开始时间",
				                    "oldCharacteName": "",
				                    "actType": "ADD",
				                    "productCharacterDto": {
				                        "id": 65,
				                        "inputTypeId": "A01",
				                        "dataTypeId": "S01",
				                        "name": "开始时间",
				                        "code": "START_DATE",
				                        "crmProdAttrId": "START_DATE"
				                    }
				                },
				                {
				                    "dependProdOrderId": 14300028,
				                    "characterId": 66,
				                    "characterValue": "2050-01-01 23:59:59",
				                    "characteName": "结束时间",
				                    "oldCharacteName": "",
				                    "actType": "ADD",
				                    "productCharacterDto": {
				                        "id": 66,
				                        "inputTypeId": "A01",
				                        "dataTypeId": "S01",
				                        "name": "结束时间",
				                        "code": "END_DATE",
				                        "crmProdAttrId": "END_DATE"
				                    }
				                }
				            ],
				            "dependProdDto": {
				                "id": 1969,
				                "productDto": {
				                    "name": "90000652",
				                    "code": "90000652",
				                    "crmProdId": "90000652"
				                }
				            }
				        },
				        {
				            "id": 14300029,
				            "serviceOrderId": 14300007,
				            "dependProdId": 1970,
				            "actType": "ADD",
				            "dependProdOrderAttrDtos": [
				                {
				                    "dependProdOrderId": 14300029,
				                    "characterId": 49,
				                    "characterValue": "1",
				                    "characteName": "租赁方式",
				                    "oldCharacteName": "",
				                    "actType": "ADD",
				                    "productCharacterDto": {
				                        "id": 49,
				                        "inputTypeId": "A04",
				                        "dataTypeId": "S01",
				                        "name": "Zjtgfx",
				                        "code": "Zjtgfx",
				                        "defaultValue": "",
				                        "isnull": "",
				                        "mask": "",
				                        "comments": "",
				                        "crmProdAttrId": "Zjtgfx"
				                    }
				                },
				                {
				                    "dependProdOrderId": 14300029,
				                    "characterId": 50,
				                    "characterValue": "20",
				                    "characteName": "租赁个数",
				                    "oldCharacteName": "",
				                    "actType": "ADD",
				                    "productCharacterDto": {
				                        "id": 50,
				                        "inputTypeId": "A04",
				                        "dataTypeId": "S01",
				                        "name": "总计",
				                        "code": "sumcount",
				                        "defaultValue": "",
				                        "isnull": "",
				                        "mask": "",
				                        "comments": "",
				                        "crmProdAttrId": "sumcount"
				                    }
				                },
				                {
				                    "dependProdOrderId": 14300029,
				                    "characterId": 51,
				                    "characterValue": "4KW",
				                    "characteName": "机柜功率",
				                    "oldCharacteName": "",
				                    "actType": "ADD",
				                    "productCharacterDto": {
				                        "id": 51,
				                        "inputTypeId": "A04",
				                        "dataTypeId": "S01",
				                        "name": "宽带功率",
				                        "code": "kdgl",
				                        "defaultValue": "",
				                        "isnull": "",
				                        "mask": "",
				                        "comments": "",
				                        "crmProdAttrId": "kdgl"
				                    }
				                }
				            ],
				            "dependProdDto": {
				                "id": 1970,
				                "productDto": {
				                    "name": "46000004",
				                    "code": "46000004",
				                    "crmProdId": "46000004"
				                }
				            }
				        },
				        {
				            "id": 14300030,
				            "serviceOrderId": 14300007,
				            "dependProdId": 1971,
				            "actType": "ADD",
				            "dependProdOrderAttrDtos": [
				                {
				                    "dependProdOrderId": 14300030,
				                    "characterId": 52,
				                    "characterValue": "0",
				                    "characteName": "独享百兆",
				                    "oldCharacteName": "",
				                    "actType": "ADD",
				                    "productCharacterDto": {
				                        "id": 52,
				                        "inputTypeId": "A04",
				                        "dataTypeId": "S01",
				                        "name": "独享百兆",
				                        "code": "Dxbmsum",
				                        "defaultValue": "",
				                        "isnull": "",
				                        "mask": "",
				                        "comments": "",
				                        "crmProdAttrId": "Dxbmsum"
				                    }
				                },
				                {
				                    "dependProdOrderId": 14300030,
				                    "characterId": 53,
				                    "characterValue": "0",
				                    "characteName": "共享百兆",
				                    "oldCharacteName": "",
				                    "actType": "ADD",
				                    "productCharacterDto": {
				                        "id": 53,
				                        "inputTypeId": "A04",
				                        "dataTypeId": "S01",
				                        "name": "共享百兆",
				                        "code": "gxbmsum",
				                        "defaultValue": "",
				                        "isnull": "",
				                        "mask": "",
				                        "comments": "",
				                        "crmProdAttrId": "gxbmsum"
				                    }
				                },
				                {
				                    "dependProdOrderId": 14300030,
				                    "characterId": 54,
				                    "characterValue": "2",
				                    "characteName": "独享1G",
				                    "oldCharacteName": "",
				                    "actType": "ADD",
				                    "productCharacterDto": {
				                        "id": 54,
				                        "inputTypeId": "A04",
				                        "dataTypeId": "S01",
				                        "name": "独享1G",
				                        "code": "dxogsum",
				                        "defaultValue": "",
				                        "isnull": "",
				                        "mask": "",
				                        "comments": "",
				                        "crmProdAttrId": "dxogsum"
				                    }
				                },
				                {
				                    "dependProdOrderId": 14300030,
				                    "characterId": 55,
				                    "characterValue": "0",
				                    "characteName": "独享10G",
				                    "oldCharacteName": "",
				                    "actType": "ADD",
				                    "productCharacterDto": {
				                        "id": 55,
				                        "inputTypeId": "A04",
				                        "dataTypeId": "S01",
				                        "name": "独享10G",
				                        "code": "dxtgsum",
				                        "defaultValue": "",
				                        "isnull": "",
				                        "mask": "",
				                        "comments": "",
				                        "crmProdAttrId": "dxtgsum"
				                    }
				                }
				            ],
				            "dependProdDto": {
				                "id": 1971,
				                "productDto": {
				                    "name": "46000003",
				                    "code": "46000003",
				                    "crmProdId": "46000003"
				                }
				            }
				        },
				        {
				            "id": 14300031,
				            "serviceOrderId": 14300007,
				            "dependProdId": 1972,
				            "actType": "ADD",
				            "dependProdOrderAttrDtos": [
				                {
				                    "dependProdOrderId": 14300031,
				                    "characterId": 50,
				                    "characterValue": "16",
				                    "characteName": "IP个数",
				                    "oldCharacteName": "",
				                    "actType": "ADD",
				                    "productCharacterDto": {
				                        "id": 50,
				                        "inputTypeId": "A04",
				                        "dataTypeId": "S01",
				                        "name": "总计",
				                        "code": "sumcount",
				                        "defaultValue": "",
				                        "isnull": "",
				                        "mask": "",
				                        "comments": "",
				                        "crmProdAttrId": "sumcount"
				                    }
				                }
				            ],
				            "dependProdDto": {
				                "id": 1972,
				                "productDto": {
				                    "name": "46000005",
				                    "code": "46000005",
				                    "crmProdId": "46000005"
				                }
				            }
				        }
				    ],
				    "indepProdDto": {
				        "id": 1968,
				        "endtoendFlag": "0",
				        "productDto": {
				            "id": 1968,
				            "name": "IDC主机托管",
				            "prodAlias": "IDC主机托管",
				            "typeId": "001",
				            "code": "46000002",
				            "crmProdId": "46000002",
				            "operatorId": "001",
				            "edition": "V1.0",
				            "catalogId": 1,
				            "state": "10A",
				            "stateDate": "Sep 17, 2015 11:28:22 AM",
				            "comments": "(null)",
				            "crmProdIntsId": "771604117347417688"
				        }
				    },
				    "indepProdOrderEvtDtos": [
				        {
				            "evtWithProdId": 1173,
				            "serviceOrderId": 14300007,
				            "name": "装机",
				            "code": "10",
				            "crmId": "10"
				        }
				    ],
				    "indepProdOrderAttrDtos": [
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 22,
				            "characterValue": "10",
				            "characteName": "0374",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "KEEP",
				            "productCharacterDto": {
				                "id": 22,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "区域ID",
				                "code": "area_id",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 23,
				            "characterValue": "37412660",
				            "characteName": "37412660",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 23,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "域名号码",
				                "code": "dn_no",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 24,
				            "characterValue": "762090",
				            "characteName": "762090",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 24,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "区域编码",
				                "code": "AREA_CODE"
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 25,
				            "characterValue": "0",
				            "characteName": "0",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 25,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "合作方ID",
				                "code": "COMMUNIT_ID",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 26,
				            "characterValue": "01",
				            "characteName": "可拆可催可停可通知",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 26,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "催停标识",
				                "code": "CSTOP_FLAG",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 27,
				            "characterValue": "0",
				            "characteName": "普通",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 27,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "处理级别",
				                "code": "ChuLiJiBie",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 28,
				            "characterValue": "许昌市市政府",
				            "characteName": "许昌市市政府",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 28,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "详细安装地址",
				                "code": "DETAIL_INSTALL_ADDRESS",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 29,
				            "characterValue": "0",
				            "characteName": "0",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 29,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "初始密码",
				                "code": "INIT_PASSWD",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 30,
				            "characterValue": "0374",
				            "characteName": "0374",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 30,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "本地网络编码",
				                "code": "LOCAL_NET_CODE",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 31,
				            "characterValue": "8978964",
				            "characteName": "8978964",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 31,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "测量室ID",
				                "code": "measure_id",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 32,
				            "characterValue": "F",
				            "characteName": "EPON",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 32,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "PON标识",
				                "code": "pen_flag",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 33,
				            "characterValue": "许昌市IDC一楼机房",
				            "characteName": "许昌市IDC一楼机房",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 33,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "测量室名称",
				                "code": "measure_name",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 34,
				            "characterValue": "1",
				            "characteName": "否",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 34,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "单元标识",
				                "code": "unit_flag",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 35,
				            "characterValue": "02",
				            "characteName": "乙类",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 35,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "月租",
				                "code": "MONTH_RENT",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 36,
				            "characterValue": "N",
				            "characteName": "N",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 36,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "NGN标识",
				                "code": "NGN_MARK",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 37,
				            "characterValue": "21064",
				            "characteName": "21064",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 37,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "PARENT_MOFFICE",
				                "code": "PARENT_MOFFICE",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 38,
				            "characterValue": "E1",
				            "characteName": "主机托管",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 38,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "产品属性",
				                "code": "PROD_PROP",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 39,
				            "characterValue": "是",
				            "characteName": "ICP备案",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 39,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "ICPOK",
				                "code": "ICPOK",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 40,
				            "characterValue": "A",
				            "characteName": "按时长计费",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 40,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "租赁模式",
				                "code": "RENT_MODE",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 41,
				            "characterValue": "A",
				            "characteName": "普通",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 41,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "安全级别",
				                "code": "SAFE_LEVEL",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 42,
				            "characterValue": "0",
				            "characteName": "0",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 42,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "序列号ID",
				                "code": "SERIAL_NUMBER_ID",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 43,
				            "characterValue": "76a0cc",
				            "characteName": "76a0cc",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 43,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "服务编码",
				                "code": "SERVICE_CODE",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 44,
				            "characterValue": "A",
				            "characteName": "城市",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 44,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "城市标记",
				                "code": "TOWN_FLAG",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 45,
				            "characterValue": "76a2eo",
				            "characteName": "76a2eo",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 45,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "用户呼叫区域",
				                "code": "USER_CALLING_AREA",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 46,
				            "characterValue": "412660",
				            "characteName": "412660",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 46,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "用户密码",
				                "code": "USER_PASSWD",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 47,
				            "characterValue": "0",
				            "characteName": "普通用户",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 47,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "用户类型编码",
				                "code": "USER_TYPE_CODE",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 48,
				            "characterValue": "10020184",
				            "characteName": "(省公司)协议用户[资费]",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 48,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "10020184",
				                "code": "10020184",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 57,
				            "characterValue": "90000652",
				            "characteName": "协议费:增值业务-互联网平台-主机托管使用月数:null+总金额:null元",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 57,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "90000652",
				                "code": "90000652",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 58,
				            "characterValue": "0",
				            "characteName": "后付费",
				            "oldCharacterValue": "0",
				            "oldCharacteName": "后付费",
				            "actType": "KEEP",
				            "productCharacterDto": {
				                "id": 58,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "付费方式",
				                "code": "bala_mode",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 59,
				            "characterValue": "2",
				            "characteName": "固网",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 59,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "网络类型编码",
				                "code": "NET_TYPE_CODE",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 60,
				            "characterValue": "88050078",
				            "characteName": "88050078",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 60,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "产品包",
				                "code": "prod_bag_id",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 61,
				            "characterValue": "600000",
				            "characteName": "600000",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 61,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "支付费用总计",
				                "code": "deposit_sum",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 62,
				            "characterValue": "0",
				            "characteName": "0",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 62,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "未支付费用",
				                "code": "uncharge_fee",
				                "defaultValue": "",
				                "isnull": "",
				                "mask": "",
				                "comments": ""
				            }
				        },
				        {
				            "serviceOrderId": 14300007,
				            "indepProdId": 1968,
				            "characterId": 63,
				            "characterValue": "E1",
				            "characteName": "ICP备案编号",
				            "oldCharacterValue": "",
				            "oldCharacteName": "",
				            "actType": "ADD",
				            "productCharacterDto": {
				                "id": 63,
				                "inputTypeId": "A04",
				                "dataTypeId": "S01",
				                "name": "备案编号",
				                "code": "ICPNO"
				            }
				        }
				    ],
				    "accessInfoDtos": [
				        {
				            "flag": "新接入资源",
				            "addrId": 762090,
				            "addrName": "许昌市市政府",
				            "exchId": "21064",
				            "exchCode": "21064",
				            "exchName": "许昌市IDC机房",
				            "measureId": 21064,//8978964,
				            "measureName": "许昌分局测量室",
				            "serviceOrderId": 14300007
				        }
				    ]
				}
        		//iomObj = ret;
				//2,解析json对象为电路对象和电路详情对象
	        	
        		var custDto = iomObj.custDto;
    			var indepProdDto = iomObj.indepProdDto;
      			var indepProdOrderAttrDtos = iomObj.indepProdOrderAttrDtos;
    			var indepProdOrderEvtDtos = iomObj.indepProdOrderEvtDtos[0];
    			var accessInfoDtos = iomObj.accessInfoDtos[0];
    			var dependProdOrderDtos = iomObj.dependProdOrderDtos;//附属产品list
    			
    			
    			//roomId，roomName
    			var roomId = accessInfoDtos.measureId;
    			var roomName = accessInfoDtos.measureName;
    			//2.1获取serviceOrderId，产品实例号，客户信息(code,name),
    			var serviceOrderId = indepProdOrderEvtDtos.serviceOrderId;
    			var prodIntsId = indepProdDto.productDto.crmProdIntsId;
    			var name =  custDto.custName;
    			var code =  custDto.custCode; 
    			
    			
    			//封装业务电路对象
    			var rsCircuitModel = new Object();
    			rsCircuitModel.orderId=serviceOrderId
    			rsCircuitModel.cusName=name;
      			rsCircuitModel.cusCode=code;
      			rsCircuitModel.prodInsId=prodIntsId;
      			rsCircuitModel.cirCode = code+""+prodIntsId;//客户编码+产品实例号
      			rsCircuitModel.cirType = "cirType";
      			rsCircuitModel.roomId = roomId;
      			rsCircuitModel.roomName = roomName;
      			rsCircuitModel.staffId = currentUser.staffId;
      			
      			var frame ;//创建电路详情对象（机柜|机位）
      			var port1;//独享百兆
      			var port2;//共享百兆
      			var port3;//独享1G
      			var port4;//独享10G
      			var ip ;  //ip电路详情对象
      			
      			//var frameArray = [];
      			var portArray = [];
      			
      			for(var k=0;k<dependProdOrderDtos.length;k++){
    				var dependProdOrderDto = dependProdOrderDtos[k];
    				var dependProdId = dependProdOrderDto.dependProdId;
    				if(dependProdId==1970){
    					var dependProdOrderAttrDtos = dependProdOrderDto.dependProdOrderAttrDtos;
    					for(var l=0;l<dependProdOrderAttrDtos.length;l++){
        					var dependProdOrderAttrDto = dependProdOrderAttrDtos[l];
        					var characterId = dependProdOrderAttrDto.characterId;
        					if(characterId==49 || characterId==50||characterId==51){
            					if(typeof(frame)=="undefined"){
            						frame = new Object();
            					}
            				}
            				
            				if(characterId==49){
            					var rentType = dependProdOrderAttrDto.characterValue;//租赁方式
            					if(rentType=="1"){//1，按机柜；2，按U位 
            						frame.rsTypeId="CABINET_RS";//code
            					}else if(rentType=="2"){
            						frame.rsTypeId="UNIT_RS";//code
            					}
            				}else if(characterId==50){
            					var rentNum= dependProdOrderAttrDto.characterValue;//租赁个数
            					frame.rsNum = rentNum;
            				}else if(characterId==51){
            					var power = dependProdOrderAttrDto.characterValue;//4KW功率
            					frame.unitPower = power;
            					frame.enumFlag=power;
            				}
        				}//内层for-end
    				}else if(dependProdId==1971){
    					var dependProdOrderAttrDtos = dependProdOrderDto.dependProdOrderAttrDtos;
    					for(var l=0;l<dependProdOrderAttrDtos.length;l++){
        					var dependProdOrderAttrDto = dependProdOrderAttrDtos[l];
        					var characterId = dependProdOrderAttrDto.characterId;
            				
        					if(characterId==52){
            					var Exclusive_100M= dependProdOrderAttrDto.characterValue;//独享百兆
            					if(parseInt(Exclusive_100M)>0){
            						port1 = new Object();
            						port1.rsTypeId="PHY_PORT_RS";
            						port1.allocationType = 104001;//code
            						port1.allocationTypeName = "独享";
            						port1.rateId = 103001;//code
            						port1.rateName = "100M";
            						port1.rsNum = Exclusive_100M;
            						port1.enumFlag="DX100M";
            						portArray.push(port1);
            					}
            				}else if(characterId==53){
            					var share_100M= dependProdOrderAttrDto.characterValue;//共享百兆
            					if(parseInt(share_100M)>0){
            						port2 = new Object();
            						port2.rsTypeId="PHY_PORT_RS";
            						port2.allocationType =104002; //code
            						port2.allocationTypeName = "共享";
            						port2.rateId = 103001;//code
            						port2.rateName = "100M";
            						port2.rsNum = share_100M;
            						port2.enumFlag="GX100M";
            						portArray.push(port2);
            					}
            				}else if(characterId==54){
            					var Exclusive_1G = dependProdOrderAttrDto.characterValue;//独享1G
            					if(parseInt(Exclusive_1G)>0){
            						port3 = new Object();
            						port3.rsTypeId="PHY_PORT_RS";
            						port3.allocationType =104001; //code
            						port3.allocationTypeName = "独享";
            						port3.rateId = 103002;//code
            						port3.rateName = "1G";
            						port3.rsNum = Exclusive_1G;
            						port3.enumFlag="DX1G";
            						portArray.push(port3);
            					}
            				}else if(characterId==55){
            					var Exclusive_10G = dependProdOrderAttrDto.characterValue;//独享10G
            					if(parseInt(Exclusive_10G)>0){
            						port4 = new Object();
            						port4.rsTypeId="PHY_PORT_RS";
            						port4.allocationType =104001; //code
            						port4.allocationTypeName = "独享";
            						port4.rateId = 103003;//code
            						port4.rateName = "10G";
            						port4.rsNum = Exclusive_10G;
            						port4.enumFlag="DX10G";
            						portArray.push(port4);
            					}
            				}
        				}//内层for-end
    				}else if(dependProdId==1972){
    					var dependProdOrderAttrDtos = dependProdOrderDto.dependProdOrderAttrDtos;
    					for(var l=0;l<dependProdOrderAttrDtos.length;l++){
        					var dependProdOrderAttrDto = dependProdOrderAttrDtos[l];
        					var characterId = dependProdOrderAttrDto.characterId;
        					if(characterId==50){
            					var ipNum= dependProdOrderAttrDto.characterValue;//Ip个数
            					if(parseInt(ipNum)>0){
            						ip = new Object();
            						ip.rsTypeId="IP_RS";
            						ip.rsNum = ipNum;
            					}
            				}//if-end
        				}//内层for-end
    				}
    				
    				
    			}//外层for-end
        		
    			 if(frame==undefined&&portArray.length==0&&ip==undefined){
    				 alert("没有需要配置的资源！");
    				 frame=null;
    				 ip=null;
    			 }
    	
    			 utils.ajax('iPageRsConfigService', 'compareAndView',rsCircuitModel, frame, portArray, ip).done(function (ret) {
    	               //alert("保存成功");
    				 	var result = JSON.parse(ret);
    				 	var frame = result.frame; 
    				 	var ports = result.ports; 
    				 	var ip  = result.ip;
    				 	var circuitModel = result.circuitModel;
    				 	var configResult = result.configResult;
    				 	
    				 	frameGridProxy(frame);
    				 	portsGridProxy(ports);
    				 	ipGridProxy(ip);
    				 	
    				 	setShowFrameProxy(frame);
    				 	setShowPortProxy(ports);
    				 	setShowIpProxy(ip);
    				 	setCacheProxy(circuitModel);
    				 	setConfigResultProxy(configResult);
    	            });
    			 
    			 
        	//});
        	
        	//2,解析json对象为电路对象和电路详情对象
        	//3,将电路对象及电路详情对象传至后台,业务对比，逻辑计算
        	//4,返回配置详情，页面显示
  			
        },//loadConfFrameRender结尾
        
        
        //画图方法
    	portsGrid:function(ports){
			  var opt = {
              data:ports,
              hidegrid: false,
              cellEdit: true,
              gridComplete: function(e) { //数据加载完成触发的事件
                  $("#rmconfig-port-grid").grid("mergeColCellByReferenceCol", 1,4);
              },
              shrinkToFit: false,
              height: 300
          };
		 
			  $("#rmconfig-port-grid").grid(
              $.extend(opt, {
                  colModel: [
                      { label: '序号', name: 'seq', align: 'center', width: 80, sortable: false },
                      { label: '速率', name: 'rateName', align: 'center', width: 80, sortable: false },
                      { label: '使用方式', name: 'allocationTypeName', align: 'center', width: 126, sortable: false },
                      { label: '租用数量', name: 'rsNum', align: 'center', width: 80, sortable: false },
                      { label: '配置要求', name: 'configRequireName', align: 'center', sortable: false },
                      { label: '所属设备', name: 'equipment', width: 225, sortable: false },
                      { label: '端口名称', name: 'portName',  width: 255,editable: true, sortable: false },
                  ],multiselect:true
              })
           );
			  $("#rmconfig-port-grid").grid('setGroupHeaders', { 
		          useColSpanStyle: true,
		          groupHeaders: [
		              { startColumnName: 'equipment', numberOfColumns: 2, titleText: '配置结果' }
		          ]
		      });
			 
		 },//portGrid-end
		
       //--------------------------------------    
       
       
		frameGrid:function(frame){
			var opt = {
	        		data: frame ,
	        		hidegrid: false,
	        		cellEdit: true,
	        		gridComplete: function(e) { //数据加载完成触发的事件
	        			$("#rmconfig-frame-grid").grid("mergeColCellByReferenceCol", 1, 4);
	        		},
	        		shrinkToFit: false,
	        		height: 300
	        };
	        
	        $("#rmconfig-frame-grid").grid(
	        		$.extend(opt, {
	        			colModel: [
	        			           { label: '序号', name: 'seq', align: 'center', width: 80, sortable: false },
	        			           { label: '功率', name: 'unitPower', align: 'center', width: 80, sortable: false },
	        			           { label: '租用方式', name: 'rentType', align: 'center', width: 126, sortable: false },
	        			           { label: '租用数量', name: 'rsNum', align: 'center', width: 80, sortable: false },
	        			           { label: '配置要求', name: 'configRequireName', align: 'center', width: 150,sortable: false },
	        			           { label: '分配机房', name: 'roomName', width: 150,sortable: false },
	        			           { label: '分配机柜', name: 'frameName',width: 150, editable: true, sortable: false },
	        			           { label: '分配机位', name: 'frameUnitName',width: 150,  sortable: false }
	        			           ],multiselect:true
	        		})
	        );
	        
	       $("#rmconfig-frame-grid").grid('setGroupHeaders', {
	          useColSpanStyle: true,
	          groupHeaders: [
	              { startColumnName: 'roomName', numberOfColumns: 3, titleText: '配置结果' }
	          ]
	      });
		},//frameGrid-end
		
		//------------------------------------------------
		
		ipGrid:function(ip){
			var opt = {
	        		data: ip ,
	        		hidegrid: false,
	        		cellEdit: true,
	        		gridComplete: function(e) { //数据加载完成触发的事件
	        			$("#rmconfig-ip-grid").grid("mergeColCellByReferenceCol", 1, 2);
	        		},
	        		shrinkToFit: false,
	        		height: 300
	        };
	        
	        $("#rmconfig-ip-grid").grid(
	        		$.extend(opt, {
	        			colModel: [
	        			           { label: '序号', name: 'seq', align: 'center', width: 130, sortable: false },
	        			           { label: '租用数量', name: 'rsNum', align: 'center', width: 130, sortable: false },
	        			           { label: '配置要求', name: 'configRequireName', align: 'center', width: 150,sortable: false },
	        			           { label: '所属地址段', name: 'segmentName', width: 220,sortable: false },
	        			           { label: 'IP地址', name: 'ipName',width: 220, editable: true, sortable: false },
	        			           ],multiselect:true
	        		})
	        );
	        
	       $("#rmconfig-ip-grid").grid('setGroupHeaders', {
	          useColSpanStyle: true,
	          groupHeaders: [
	              { startColumnName: 'segmentName', numberOfColumns: 2, titleText: '配置结果' }
	          ]
	      });
		},//frameGrid-end
       
		 //提交按钮点击
		rmconfigSubmitClick : function(){
			
			var getConfigIpProxy = $.proxy(this.getConfigIp,this); 
			var getConfigFrameProxy = $.proxy(this.getConfigFrame,this);
			var getConfigPortProxy = $.proxy(this.getConfigPort,this);
			var getCacheProxy = $.proxy(this.getCache,this);
			
			var frame = getConfigFrameProxy();
			var port = getConfigPortProxy();
			var ip = getConfigIpProxy();
			var circuitModel = getCacheProxy();
			
			var frameNum = 0;
			var portNum_DX100M = 0;
			var portNum_GX100M = 0;
			var portNum_DX1G = 0;
			var portNum_DX10G = 0;
			var ipNum = 0;
			
			var frameConfigedNum = 0;
			var portConfigedNum_DX100M = 0;
			var portConfigedNum_GX100M = 0;
			var portConfigedNum_DX1G = 0;
			var portConfigedNum_DX10G = 0;
			var ipConfigedNum = 0;
			
			if(frame==undefined){
				frame=null;
			}else{
				frameNum = frame.rsConfig.configRequire.requireNum;
				frameConfigedNum =frame.rsConfig.configResult.frameResList.length;
				frame = JSON.stringify(frame);
			}
			if(port==undefined){
				port=null;
			}else{
				if(port.DX100MConfig!=undefined){
					portNum_DX100M=port.DX100MConfig.rsConfig.configRequire.requireNum;
					portConfigedNum_DX100M = port.DX100MConfig.rsConfig.configResult.rateResList.length;
				}
				if(port.GX100MConfig!=undefined){
					portNum_GX100M=port.DX100MConfig.rsConfig.configRequire.requireNum;
					portConfigedNum_GX100M = port.DX100MConfig.rsConfig.configResult.rateResList.length;
				}
				if(port.DX1GConfig!=undefined){
					portNum_DX1G=port.DX1GConfig.rsConfig.configRequire.requireNum;
					portConfigedNum_DX1G = port.DX1GConfig.rsConfig.configResult.rateResList.length;
				}
				if(port.DX10GConfig!=undefined){
					portNum_DX10G=port.DX10GConfig.rsConfig.configRequire.requireNum;
					portConfigedNum_DX10G = port.DX10GConfig.rsConfig.configResult.rateResList.length;
				}
				 
				port = JSON.stringify(port);
			}
			if(ip==undefined){
				ip=null;
			}else{
				ipNum = ip.rsConfig.configRequire.requireNum;
				ipConfigedNum = ip.rsConfig.configResult.ipResList.length;
				ip = JSON.stringify(ip);
			}
			
			var str = "您确定要提交吗？";
			if(frameNum-frameConfigedNum>0){
				str += "&nbsp;<br>机柜/机位的配置要求："+frameNum+",实际配置数量："+frameConfigedNum+"。";
			}
			
			if(portNum_DX100M-portConfigedNum_DX100M>0){
				str+="&nbsp;<br>独享100M的配置要求："+portNum_DX100M+",实际配置数量："+portConfigedNum_DX100M+"。";
			}
			if(portNum_GX100M-portConfigedNum_GX100M>0){
				str+="&nbsp;<br>共享100M的配置要求："+portNum_GX100M+",实际配置数量："+portConfigedNum_GX100M+"。";
			}
			if(portNum_DX1G-portConfigedNum_DX1G>0){
				str+="&nbsp;<br>独享1G的配置要求："+portNum_DX1G+",实际配置数量："+portConfigedNum_DX1G+"。";
			}
			if(portNum_DX10G-portConfigedNum_DX10G>0){
				str+="&nbsp;<br>独享10G的配置要求："+portNum_DX10G+",实际配置数量："+portConfigedNum_DX10G+"。";
			}
			if(ipNum-ipConfigedNum>0){
				str+="&nbsp;<br>ip配置要求："+ipNum+",实际配置数量："+ipConfigedNum+"。";
			}
			
			fish.confirm(str).result.then(function() {
				utils.ajax('iPageRsConfigService', 'configSave',frame, port,ip,circuitModel).done(function (ret) {
					if(ret){
						if(ret == "success"){
	            			fish.success('提交成功');
	            		}else{
	            			fish.error('提交失败');
	            		}
					}else{
	        			fish.info('消息未返回');
	        		}	
				 });
	            
            });
			
		},
        
        //配置frame按钮点击
        rmconfigFrameConfClick : function(){
        	
        	//画图代理
      		 var frameGridProxy = $.proxy(this.frameGrid,this);
      		//cache代理
	   		 var setCacheProxy = $.proxy(this.setCache,this);
	   		 var getCacheProxy = $.proxy(this.getCache,this);
	   		 //配置数据代理
	   		 var setConfigFrameProxy = $.proxy(this.setConfigFrame,this);
	   		 var getConfigFrameProxy = $.proxy(this.getConfigFrame,this);
	   		//展示数据代理
	   		 var setShowFrameProxy = $.proxy(this.setShowFrame,this);
	   		 var getShowFrameProxy = $.proxy(this.getShowFrame,this);
	   		
        	//1，获取全部列表的行的值
	        	var frameRows = $("#rmconfig-frame-grid").grid("getCheckRows");
        	    var cache = this.options.cache;
        	    
        	    var selectedFrameIds = $("#rmconfig-frame-grid").grid('getGridParam', 'selarrrow');
                if (selectedFrameIds == null || selectedFrameIds.length == 0) {
                    fish.info("请至少选择一条记录！");
                    return;
                }
                
                var configResult;
                var getConfigFrameProxy = $.proxy(this.getConfigFrame,this);
                var frameConfig = getConfigFrameProxy();
                if(frameConfig==undefined || frameConfig==null){
                	configResult={}
                }else{
                	configResult=frameConfig.rsConfig.configResult;
                }
        	//2，拼装成json格式
        	    //2.1frame
        	    var rsConfig = {
        	    		"roomId":cache.roomId+"",//,300022
        	    		"roomName":cache.roomName+"",
        	    		"circuitId":cache.circuitId+"",
        	    		"configRequire":{
    	    				"totalNum": frameRows[frameRows.length-1].rsNum+"",
    	    				"configState": "1",
    	    				"requireNum": frameRows[frameRows.length-1].rsNum+"",
    	    				"requireRsType": frameRows[frameRows.length-1].rsTypeId+"",
    	    				"unitPower":frameRows[frameRows.length-1].unitPower+"",
    	    				"unitPowerName":frameRows[frameRows.length-1].unitPower+"",
    	    				"rate":null,
    	    				"rateName":null,
    	    				"allocationType":null,
    	    				"allocationTypeName":null
        	    		},
        	    		"configResult": configResult
        	    };
        	                              
        	    var rsUrl;
        	    var rsType = frameRows[frameRows.length-1].rsTypeId;
        	    if("CABINET_RS"==rsType){
        	    	rsUrl='modules/idcrm/rmconfig/views/FrameConfigView';
        	    }else if("UNIT_RS"==rsType){
        	    	rsUrl="modules/idcrm/rmconfig/views/FrameUnitConfigView";
        	    }
        	    //3，跳转至frame配置页面，并将json以参数形式传过去
        	    var pop =fish.popupView({url: rsUrl,
                    width: "80%",
                    viewOption: {
                        rsConfig: rsConfig
                    },
                    callback:function(popup,view){
                    	
                    	popup.result.then(function (e) {
                    	
                		var frame = getShowFrameProxy();
                    	
                    	//传入后台的配置数据进行拼装
                		setConfigFrameProxy(e);
                    	
                		var frameArray = [];
                		//拼装显示数据
                    	var frameList = e.rsConfig.configResult.frameResList;
                    	if(frameList!=null &&frameList!="" && frameList !=undefined){//有配置的值
                    		for(var i=0;i<frameList.length;i++){
                    			var frameRes = frameList[i];
                    			var newFrame = jQuery.extend(true, {}, frame[0]);
                    			newFrame.frameId=frameRes.frameId;
                    			newFrame.frameName=frameRes.frameName;
                    			newFrame.frameUnitId=frameRes.frameUnitId;
                    			newFrame.frameUnitName=frameRes.frameUnitName;
            					frameArray.push(newFrame);
                    		}
                    	}
                		
                    	//画图
                    	frameGridProxy(frameArray);
                    	
                		//setShowFrameProxy(frames);
                    	}, function (e) {
                            console.log('关闭了', e);
                        });
                    }
                });
        },
        
        rmconfigPortConfClick : function(){
        	//画图
       	 	var portsGridProxy = $.proxy(this.portsGrid,this);
       	 	//电路缓存
       	 	var setCacheProxy = $.proxy(this.setCache,this);
       	 	var getCacheProxy = $.proxy(this.getCache,this);
       	 	//已经配置的数据
	       	var setConfigPortProxy = $.proxy(this.setConfigPort,this);
	       	var getConfigPortProxy = $.proxy(this.getConfigPort,this);
	       	//要展示的数据
	    	var getShowPortProxy = $.proxy(this.getShowPort,this);
	    	var setShowPortProxy = $.proxy(this.setShowPort,this);
	    	//配置结果
       	 	var setConfigResultProxy = $.proxy(this.setConfigResult,this);
       	 	var getConfigResultProxy = $.proxy(this.getConfigResult,this);
       	 	
	    	
        	var portRows = $("#rmconfig-port-grid").grid("getCheckRows");
    	    var cache = this.options.cache;
    	    
    	    //往具体配置页面传送的已配置的对象
    	    var configResult;
            var getConfigPortProxy = $.proxy(this.getConfigPort,this);
            var PortConfig = getConfigPortProxy();
            if(PortConfig==undefined || PortConfig==null){
            	configResult={}
            }else{
            	if(PortConfig.DX100MConfig!=undefined){
            		configResult=PortConfig.DX100MConfig.rsConfig.configResult;
            	}else if(PortConfig.GX100MConfig!=undefined){
            		configResult=PortConfig.GX100MConfig.rsConfig.configResult;
            	}else if(PortConfig.DX1GConfig!=undefined){
            		configResult=PortConfig.DX1GConfig.rsConfig.configResult;
            	}else if(PortConfig.DX10GConfig!=undefined){
            		configResult=PortConfig.DX10GConfig.rsConfig.configResult;
            	}
            	
            }
    	    
    	    //2.2prots
    	    var rsConfig = {
    	    		"roomId":cache.roomId+"",
    	    		"roomName":cache.roomName+"",
    	    		"circuitId":cache.circuitId+"",
    	    		"configRequire":{
	    				"totalNum": portRows[portRows.length-1].rsNum+"",
	    				"configState": "1",
	    				"requireNum": portRows[portRows.length-1].rsNum+"",
	    				"requireRsType": portRows[portRows.length-1].rsTypeId+"",
	    				"unitPower":null ,
	    				"unitPowerName":null,
	    				"rate":portRows[portRows.length-1].rateId+"",
	    				"rateName": portRows[portRows.length-1].rateId+"",
	    				"allocationType":portRows[portRows.length-1].allocationType+"",
	    				"allocationTypeName":portRows[portRows.length-1].allocationType+"",
	    				"enumFlag":portRows[portRows.length-1].enumFlag+"",
    	    		},
    	    		"configResult": configResult
    	    };
    	    
    	    var pop =fish.popupView({url: 'modules/idcrm/rmconfig/views/PortConfigView',
                width: "80%",
                viewOption: {
                    rsConfig: rsConfig
                },
                callback:function(popup,view){
                	
                	popup.result.then(function (e) {
                		
                		var ports = getShowPortProxy();
                		var newPorts  =  $.extend([],ports);
                		var enumFlag = e.rsConfig.configRequire.enumFlag;
                		
                		//删除已经配置过的同类型数据以方便给重新覆盖
                		
                		//传入后台的配置数据进行拼装
                		var portList = getConfigPortProxy();
                		if(typeof(portList)=="undefined"){
                			portList = new Object();
                		}
                		if(enumFlag=="DX100M"){
                			portList.DX100M=1;
                			portList.DX100MConfig=e;
                		}else if(enumFlag=="GX100M"){
                			portList.GX100M=1;
                			portList.GX100MConfig=e;
                		}else if(enumFlag=="DX1G"){
                			portList.DX1G=1;
                			portList.DX1GConfig=e;
                		}else if(enumFlag=="DX10G"){
                			portList.DX10G=1;
                			portList.DX10GConfig=e;
                		}
                		setConfigPortProxy(portList);
                		
                		
                		var DX100MConfig=portList.DX100MConfig;
                		if(DX100MConfig!=null){
                			var rateResList =DX100MConfig.rsConfig.configResult.rateResList
            				if(rateResList!=null &&rateResList!="" && rateResList !=undefined){//有配置的值
                    			for(var i=0 ;i<rateResList.length;i++){
                        			var rateRes = rateResList[i];
                        			for(var j=0;j<ports.length;j++){
                        				var newPort = jQuery.extend(true, {}, ports[j]);
                        				if(newPort.enumFlag=="DX100M"){
                        					//ports.splice(jQuery.inArray(ports[j],ports),1);
                    						newPort.equipmentId=rateRes.equId;
                    						newPort.equipment=rateRes.equName;
                    						newPort.portId = rateRes.portId;
                    						newPort.portName = rateRes.portName;
                    						newPort.coverFlag="1";
                    						ports.push(newPort);
                    						break;
                        				}
                        			}
                        			
                        		};
                    		}
                		}
                		var GX100MConfig=portList.GX100MConfig;
                		if(GX100MConfig!=null){
                			var rateResList =GX100MConfig.rsConfig.configResult.rateResList
            				if(rateResList!=null &&rateResList!="" && rateResList !=undefined){//有配置的值
                    			for(var i=0 ;i<rateResList.length;i++){
                        			var rateRes = rateResList[i];
                        			for(var j=0;j<ports.length;j++){
                        				var newPort = jQuery.extend(true, {}, ports[j]);
                        				if(newPort.enumFlag=="GX100M"){
                        					//ports.splice(jQuery.inArray(ports[j],ports),1);
                    						newPort.equipmentId=rateRes.equId;
                    						newPort.equipment=rateRes.equName;
                    						newPort.portId = rateRes.portId;
                    						newPort.portName = rateRes.portName;
                    						newPort.coverFlag="1";
                    						ports.push(newPort);
                    						break;
                        				}
                        			}
                        			
                        		};
                    		}
                		}
                		var DX1GConfig=portList.DX1GConfig;
                		if(DX1GConfig!=null){
                			var rateResList =DX1GConfig.rsConfig.configResult.rateResList
            				if(rateResList!=null &&rateResList!="" && rateResList !=undefined){//有配置的值
                    			for(var i=0 ;i<rateResList.length;i++){
                        			var rateRes = rateResList[i];
                        			for(var j=0;j<ports.length;j++){
                        				var newPort = jQuery.extend(true, {}, ports[j]);
                        				if(newPort.enumFlag=="DX1G"){
                        					//ports.splice(jQuery.inArray(ports[j],ports),1);
                    						newPort.equipmentId=rateRes.equId;
                    						newPort.equipment=rateRes.equName;
                    						newPort.portId = rateRes.portId;
                    						newPort.portName = rateRes.portName;
                    						newPort.coverFlag="1";
                    						ports.push(newPort);
                    						break;
                        				}
                        			}
                        			
                        		};
                    		}
                		}
                		var DX10GConfig=portList.DX10GConfig;
                		if(DX10GConfig!=null){
                			var rateResList =DX10GConfig.rsConfig.configResult.rateResList
            				if(rateResList!=null &&rateResList!="" && rateResList !=undefined){//有配置的值
                    			for(var i=0 ;i<rateResList.length;i++){
                        			var rateRes = rateResList[i];
                        			for(var j=0;j<ports.length;j++){
                        				var newPort = jQuery.extend(true, {}, ports[j]);
                        				if(newPort.enumFlag=="DX10G"){
                        					//ports.splice(jQuery.inArray(ports[j],ports),1);
                    						newPort.equipmentId=rateRes.equId;
                    						newPort.equipment=rateRes.equName;
                    						newPort.portId = rateRes.portId;
                    						newPort.portName = rateRes.portName;
                    						newPort.coverFlag="1";
                    						ports.push(newPort);
                    						break;
                        				}
                        			}
                        			
                        		};
                    		}
                		}
                		
                		var DX100MNum = 0;
                		var GX100MNum = 0;
                		var DX1GNum = 0;
                		var DX10GNum = 0;
                		//删除ports中配置为空的数据
                		for(var i=0;i<ports.length;i++){
                			var p = ports[i];
                			if(p.enumFlag=="DX100M"){
                				DX100MNum++;
                    		}else if(p.enumFlag=="GX100M"){
                    			GX100MNum++;
                    		}else if(p.enumFlag=="DX1G"){
                    			DX1GNum++;
                    		}else if(p.enumFlag=="DX10G"){
                    			DX10GNum++;
                			}
                		}
                		
                		//删除portId为空的对象，为了删除是不影响for循环所以增加了一个deletePorts
                		var deletePorts = $.extend([],ports);
                		for(var i=0;i<ports.length;i++){
                			var p = ports[i];
                			if(p.enumFlag=="DX100M"){
                				if(DX100MNum>1&&p.portId==null){
                					deletePorts.splice(jQuery.inArray(p,deletePorts),1);
                				}
                    		}else if(p.enumFlag=="GX100M"){
                    			if(GX100MNum>1&&p.portId==null){
                    				deletePorts.splice(jQuery.inArray(p,deletePorts),1);
                				}
                    		}else if(p.enumFlag=="DX1G"){
                    			if(DX1GNum>1&&p.portId==null){
                    				deletePorts.splice(jQuery.inArray(p,deletePorts),1);
                				}
                    		}else if(p.enumFlag=="DX10G"){
                    			if(DX10GNum>1&&p.portId==null){
                    				deletePorts.splice(jQuery.inArray(p,deletePorts),1);
                				}
                			}
                		}
                		//画图
                		portsGridProxy(deletePorts);
                		
                		setShowPortProxy(newPorts);
                		
                	}, function (e) {
                        console.log('关闭了', e);
                    });
                }
            });
    	    
        },
        
        rmconfigIpConfClick : function(){
        	
        	//画图
        	var ipGridProxy = $.proxy(this.ipGrid,this);
        	//cache
       	 	var setCacheProxy = $.proxy(this.setCache,this);
       	 	var getCacheProxy = $.proxy(this.getCache,this);
       	 	//配置数据
	       	var setConfigIpProxy = $.proxy(this.setConfigIp,this);
	    	var getConfigIpProxy = $.proxy(this.getConfigIp,this);
	    	//展示数据
	    	var setShowIpProxy = $.proxy(this.setShowIp,this);
	    	var getShowIpProxy = $.proxy(this.getShowIp,this);
	    	
       	 	
       	 	
        	var ipRows = $("#rmconfig-ip-grid").grid("getCheckRows");
        	var cache = this.options.cache;
        	
        	
        	var configResult;
            var getConfigIpProxy = $.proxy(this.getConfigIp,this);
            var ipConfig = getConfigIpProxy();
            if(ipConfig==undefined || ipConfig==null){
            	configResult={}
            }else{
            	configResult=ipConfig.rsConfig.configResult;
            }
        	
        	//2.3 ips
    	    var rsConfig = {
    	    		"roomId":cache.roomId+"",//cache.roomId,2+""
    	    		"roomName":cache.roomName+"",
    	    		"circuitId":cache.circuitId+"",
    	    		"configRequire":{
    	    			"totalNum": ipRows[ipRows.length-1].rsNum+"",
    	    			"configState": "1",
    	    			"requireNum": ipRows[ipRows.length-1].rsNum+"",
    	    			"requireRsType": ipRows[ipRows.length-1].rsTypeId+"",
    	    			"unitPower":null,
    	    			"unitPowerName":null,
    	    			"rate":null,
    	    			"rateName":null,
    	    			"allocationType":null,
    	    			"allocationTypeName":null
    	    		},
    	    		"configResult": configResult
    	    };
    	    
    	    var pop =fish.popupView({url: 'modules/idcrm/rmconfig/views/IPConfigView',
                width: "80%",
                viewOption: {
                    rsConfig: rsConfig
                },
                callback:function(popup,view){
                	
                	popup.result.then(function (e) {
                		
                		var ips = getShowIpProxy();
                		//保存配置数据
                		setConfigIpProxy(e);
                		
                		var ipResList = e.rsConfig.configResult.ipResList;
                		var ipArray = [];
                		//展示数据中的配置数据进行拼装
                		if(ipResList!=null &&ipResList!="" && ipResList !=undefined){//有配置的值
                			for(var i=0 ;i<ipResList.length;i++){
                    			var ipRes = ipResList[i];
                    			var newIp = jQuery.extend(true, {}, ips[0]);
                    			newIp.segmentId=ipRes.ipSegId;
                    			newIp.segmentName=ipRes.ipSegName;
                    			newIp.ipId = ipRes.ipId;
                    			newIp.ipName = ipRes.ipName;
                    			ipArray.push(newIp);
                    		}
                		}
                		
                		//画图
                		ipGridProxy(ipArray);
                		
                		//setShowIpProxy(ipArray);
                		
                	}, function (e) {
                        console.log('关闭了', e);
                    });
                }//callback
            });
        },
        

        //保存机房数据
        setCache : function(cache){
        	this.options.cache = cache;
        	
        },
        
        getCache : function(){
        	return this.options.cache;
        },
        
        //保存frame配置数据
        setConfigFrame : function(configFrame){
        	this.options.configFrame = configFrame;
        	
        },
        
        getConfigFrame: function(){
        	return this.options.configFrame;
        },
        
        //保存Port配置数据
        setConfigPort : function(configPort){
        	this.options.configPort = configPort;
        	
        },
        
        getConfigPort: function(){
        	return this.options.configPort;
        },
        
        //保存Ip配置数据
        setConfigIp : function(configIp){
        	this.options.configIp = configIp;
        	
        },
        
        getConfigIp: function(){
        	return this.options.configIp;
        },
        
		//---------------展示数据保存--------------------
      //保存frame展示数据
        setShowFrame : function(showFrame){
        	this.options.showFrame = showFrame;
        	
        },
        
        getShowFrame: function(){
        	return this.options.showFrame;
        },
        
        //保存Port展示数据
        setShowPort : function(showPort){
        	this.options.showPort = showPort;
        	
        },
        
        getShowPort: function(){
        	return this.options.showPort;
        },
        
        //保存Ip展示数据
        setShowIp : function(showIp){
        	this.options.showIp = showIp;
        	
        },
        
        getShowIp: function(){
        	return this.options.showIp;
        },
        //保存configResult展示数据
        setConfigResult : function(configResult){
        	this.options.configResult = configResult;
        	
        },
        
        getConfigResult: function(){
        	return this.options.configResult;
        },
        
        
              
		
	});
});