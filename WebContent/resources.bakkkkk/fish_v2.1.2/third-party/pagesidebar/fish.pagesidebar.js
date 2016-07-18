/**
 * @class fish.desktop.widget.PageSideBar PageSideBar
 * 页面边控制条
 * 依赖'jquery.slimScroll.js'(滚动条)
 * <pre>
 *  $('.pagesidebar').pagesidebar({data:data});
 * </pre>
 */

!function () {
  'use strict';

  $.widget('ui.pagesidebar', {
    options: {
      /**
       * @cfg {Number} 宽度
       */
      width: 200,    
      /**
       * @cfg {Number} 缩起来的宽度
       */
      minWidth: 50,           
      /**
       * @cfg {Array} 数据源
       */
      data: [],
      /**
       * @cfg {Boolean} [openFirst=false] 自动打开第一个菜单，如果第一个为目录则，打开子菜单中第一个;
       * 如果location.hash已经有值则忽略openFirst参数
       */
      openFirst: false,
      /**
       * @cfg {Boolean} [autoScroll=true] 显示时是否滚动到指定的菜单
       */
      autoScroll: true,
      /**
       * @cfg {Boolean} [keepExpand=false] 是否保持菜单一直展开，默认false
       */
      keepExpand: false,
      /**
       * @cfg {Boolean} [fixed=false] 是否固定pagesidebar，默认false
       */
      fixed: false,
      /**
       * @cfg {String} [position=left] 边框位置
       */
      position: 'left', //left or right
      /**
       * @cfg {Number} [zIndex=1000] z-index
       */
      zIndex: 1000,
      /**
       * @cfg {String} [customClass=''] 自定义样式，默认为空
       */
      customClass: '',


      //event
      /**
       * @event expand pagesidebar隐藏与显示
       */
      expand: $.noop,
      /**
       * @event slideUp pagesidebar菜单向上收起事件
       */
      slideUp: $.noop,
      /**
       * @event slideDown pagesidebar菜单向下展开事件
       */
      slideDown: $.noop,
      /**
       * @event select pagesidebar菜单选中事件
       */
      select : $.noop
    },

    _create: function () {
      this._createUI();
      this._bindEvents();
      this._action();
    },
    /**
     * 创建骨架
     */
    _createUI: function () {
      var data = this.options.data, $el = this.element;
      if(!$el.hasClass("ui-sidebar-wrapper")){
	      $el.addClass('ui-sidebar-wrapper ' + this.options.customClass).css('z-index', this.options.zIndex);
	
	      var $sidebar = $('<div class="ui-sidebar"></div>');
	      var $menus = $('<ul class="ui-sidebar-menu"></ul>');
	
	      // 1.create toggle button
	      $menus.append('<li class="ui-sidebar-toggler-wrapper clearfix"><span class="glyphicon glyphicon-align-justify ui-sidebar-toggler"></span></li>');
	
	      //TODO 2.create search
	      //if (this.options.showSearch === true) {
	      //  var searchTpl = '<li class="ui-sidebar-search-wrapper">'
	      //    + '<a href="javascript:;" class="remove">'
	      //    + '<i class="icon-close"></i>'
	      //    + '</a>'
	      //    + '<div class="input-group">'
	      //    + '<input type="text" class="form-control" placeholder="Search...">'
	      //    + '<span class="input-group-btn">'
	      //    + '<a href="javascript:;" class="btn submit"><i class="icon-magnifier"></i></a>'
	      //    + '</span>'
	      //    + '</div>';
	      //  $menus.append(searchTpl);
	      //}
	
	      // 3.create menu
	      if (data && data.length != 0) {
	        $.each(data, function (index, obj) {
	          var subMenus = obj.subMenus;
	          var $li = $('<li></li>');
	
	          if (index === 0) {
	            $li.addClass('start');
	          }
	          if (index === (data.length - 1)) {
	            $li.addClass('last');
	          }
	
	          var hash = obj.hash ? (obj.hash.charAt(0) === '#' ? obj.hash : '#' + obj.hash) : 'javascript:;';
	          var head = '<a id="pagesiderbar-item-' + index + '" href="' + hash + '">';
	          if (obj.icon && obj.icon.length !== 0) {
	            head += '<span  class="icon ' + obj.icon + '"></span>';
	          }
	          head += '<span class="title">' + (obj.title || '') + '</span>' + '<span class="selected"></span>';
	          if (subMenus && subMenus.length !== 0) {
	            head += '<span class="arrow glyphicon glyphicon-menu-right"></span>';
	          }
	          head += '</a>';
	
	          $li.append(head);
	
	          if (subMenus && subMenus.length !== 0) {
	            var ul = '<ul class="sub-menu">';
	            var parentIndex = index;
	            $.each(subMenus, function (index, obj) {
	              var hash = obj.hash ? (obj.hash.charAt(0) === '#' ? obj.hash : '#' + obj.hash) : 'javascript:;';
	              ul += '<li><a id="pagesiderbar-item-' + parentIndex + '-' + index + '" href="' + hash + '">';
	              if (obj.icon && obj.icon.length !== 0) {
	                ul += '<span  class="icon ' + obj.icon + '"></span>';
	              }
	              ul += obj.title + '</a></li>';
	            });
	            ul += '</ul>';
	            $li.append(ul);
	          } //end if
	
	          $menus.append($li);
	        });
	      }//end if (data && data.length !=0)
	
	      $el.append($sidebar.append($menus));
      }
      this._setWidth();
      this._setFixed();
      this._setPosition();
    },

    /**
     * 绑定事件
     * @private
     */
    _bindEvents: function () {
      var self = this, $el = this.element,
        $toggleBtn = $el.find('.ui-sidebar-toggler'),
        $sidebar = $el.find('.ui-sidebar'),
        $sidebarMenu = $el.find('.ui-sidebar-menu');

      //toggle按钮
      this._on($toggleBtn, {
        'click': function (e) {
          var $body = $('body');
          if ($body.hasClass("ui-sidebar-closed")) {
            $body.removeClass("ui-sidebar-closed");
            $sidebarMenu.removeClass("ui-sidebar-menu-closed");
            $sidebarMenu.css("width", self.options.width + "px");
            self._trigger('expand', null, {expand: true, $el: $el});
          } else {
            $body.addClass("ui-sidebar-closed");
            $sidebarMenu.addClass("ui-sidebar-menu-closed");
            if ($body.hasClass("ui-sidebar-fixed")) {
              $sidebarMenu.trigger("mouseleave");
            }
            $sidebarMenu.css("width", self.options.minWidth + "px");
            self._trigger('expand', null, {expand: false, $el: $el});
          }

        }
      });//end _on

      //一级菜单事件
      this._on($sidebar.find('li > a'), {
        click: function (e) {
          var $target = $(e.target);
          if ($target.is('span') || $target.is('img')) { //转成<a>
            $target = $target.parent();
          }
            var aId = $target.attr("id");  //aid string  eg. pagesiderbar-item-1
            if (aId && (aId.indexOf("pagesiderbar-item-") == 0)) {
                var dataIndex = aId.substring("pagesiderbar-item-".length);
                self._trigger('select', e, {originalData: self.options.data[dataIndex]});
            };

          if ($target.next().hasClass('sub-menu') === false) { //只有一级菜单，没有二级菜单
            $sidebarMenu.find('li.active').removeClass('active');
            $target.parent().addClass('active');
            //if ($target.parent().parent().hasClass('sub-menu') == false) {
            //  var aId = $target.attr("id");  //aid string  eg. pagesiderbar-item-1
            //  if (aId && (aId.indexOf("pagesiderbar-item-") == 0)) {
            //    var dataIndex = aId.substring("pagesiderbar-item-".length);
            //    self._trigger('select', e, {originalData: self.options.data[dataIndex]});
            //  };
            //}
            return;
          }

          if ($target.next().hasClass('sub-menu always-open')) {
            return;
          }

          var parent = $target.parent().parent();
          var the = $target; //<a>
          var $subMenus = $target.next();

          var autoScroll = this.options.autoScroll,
            slideSpeed = 200,
            keepExpand = this.options.keepExpand;

          if (keepExpand !== true) {
            parent.children('li.open').children('a').children('.arrow').removeClass('open').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-right');
            parent.children('li.open').children('.sub-menu:not(.always-open)').slideUp(slideSpeed);
            parent.children('li.open').removeClass('open');
          }

          var slideOffeset = -200;

          if ($subMenus.is(":visible")) {
            $('.arrow', $target).removeClass("open").removeClass('glyphicon-menu-down').addClass('glyphicon-menu-right');
            $target.parent().removeClass("open");
            $subMenus.slideUp(slideSpeed, function () {
              if (autoScroll === true) {
                scrollTo(the, slideOffeset);
              }
              self._trigger('slideUp', null, {$el: $el});
            });
          } else {
            $('.arrow', $target).addClass("open").removeClass('glyphicon-menu-right').addClass('glyphicon-menu-down');
            $target.parent().addClass("open");

            $subMenus.slideDown(slideSpeed, function () {
              if (autoScroll === true) {
                scrollTo(the, slideOffeset);
              }

              self._trigger('slideDown', null, {$el: $el});
            });
          }

          e.preventDefault();
        }
      });//end

      //二级菜单事件
      this._on($sidebar.find('li > ul > li > a'), {
        click: function (e) {
          var $target = $(e.target);
          if ($target.is('img')) {
            $target = $target.parent(); // <a>
          }

          // 移除选中(一级和二级)
          $sidebarMenu.find('li.active').removeClass('active');

          //激活(一级和二级)
          $target.parent().addClass('active');
          $target.parent().parent().parent().addClass('active');

          var aId = $target.attr("id");  //aid string  eg. pagesiderbar-item-1
          if (aId && (aId.indexOf("pagesiderbar-item-") == 0)) {
            var levelIndex = aId.substring("pagesiderbar-item-".length).split("-");
            if (levelIndex.length == 2) {
              var level1Data = self.options.data[levelIndex[0]];
              var level2Data = level1Data.subMenus[levelIndex[1]];
              self._trigger('select', e, {originalData: level2Data});              
            };
          };            
        }
      });//end 二级菜单

    },
    _action: function () {
      this._openFirst();
      this._detectHash();
    },

    /**
     * 判断是否自动打开第一个菜单，如果第一个菜单为目录，则打开子菜单中的第一个
     * @private
     */
    _openFirst: function () {
      if (this.options.openFirst !== true) {
        return;
      }
      if (this.options.data == null || this.options.data.length == 0) {
        return;
      }
      //已经有hash
      if (location.hash.length > 1) {
        return;
      }

      var $el = this.element, $sidebar = $el.find('.ui-sidebar'), $sidebarMenu = $el.find('.ui-sidebar-menu');
      //查找一级菜单
      var $firstA = $sidebar.find('ul.ui-sidebar-menu>li>a:eq(0)');
      var hash = $firstA[0]['hash'];
      if (hash.charAt(0) === '#') {
        location.hash = hash;
      } else {
        var $secondA = $sidebar.find('ul.ui-sidebar-menu>li>ul.sub-menu>li>a:eq(0)');
        var hash = $secondA[0]['hash'];
        if (hash.charAt(0) === '#') {
          location.hash = hash;
        }
      }

    },

    /**
     * 检测当前的页面的hash
     * @private
     */
    _detectHash: function () {
      var self = this;
      var hash = location.hash;
      if (hash && hash.length > 1) {
        setTimeout(function () {
          self.locate(hash);
        }, 100);
      }
    },

    /**
     * 动态支持属性设置
     * @param key
     * @param value
     * @private
     */
    _setOption: function (key, value) {
      this._super( key, value );
      switch (key) {
        case 'position':
          this._setPosition();
        case 'fixed':
          this._setFixed();
          break;
        case 'width':
          this._setWidth();
      }
      
    },

    /**
     * 固定控件
     * @private
     */
    _setWidth: function () {
        var $el = this.element;
        var $sidebarMenu = $el.find('.ui-sidebar-menu');
        $sidebarMenu.css("width", this.options.width + "px");      
    },

    /**
     * 固定控件
     * @private
     */
    _setFixed: function () {
      var self = this, $el = this.element,
        $sidebarMenu = $el.find('.ui-sidebar-menu'),
        $body = $('body');

      if (this.options.fixed === true) {
        $('body').addClass('ui-sidebar-fixed');
        $sidebarMenu.addClass("ui-sidebar-menu-fixed").removeClass("ui-sidebar-menu-default");


        if ($body.hasClass('ui-sidebar-fixed')) {
          this._on($sidebarMenu, {
            mouseenter: function (e) {
              if ($body.hasClass('ui-sidebar-closed')) {
                $sidebarMenu.removeClass('ui-sidebar-menu-closed');
              }
            },
            mouseleave: function (e) {
              if ($body.hasClass('ui-sidebar-closed')) {
                $sidebarMenu.addClass('ui-sidebar-menu-closed');
              }
            }
          });

        }

        this._setScroll();
      } else {
        $("body").removeClass("ui-sidebar-fixed");
        if ($sidebarMenu.data('ui-slim-scroll-init')) {
          $sidebarMenu.slimScroll({destroy: true});
          $sidebarMenu.removeAttr('style');
        }

        $sidebarMenu.addClass("ui-sidebar-menu-default").removeClass("ui-sidebar-menu-fixed")
          .unbind('mouseenter').unbind('mouseleave');

        this._setWidth();
      }
    },
    /**
     * 设置边框位置
     * @private
     */
    _setPosition: function () {
      if (this.options.position === 'right') {
        $('body').removeClass("ui-sidebar-left").addClass('ui-sidebar-right');
      } else {
        $("body").removeClass("ui-sidebar-right").addClass('ui-sidebar-left');
      }
    },


    /**
     * 菜单滚动条显示
     * @private
     */
    _setScroll: function () {
      var self = this,
        $el = this.element,
        $sidebarMenu = $el.find('.ui-sidebar-menu');
      if ($sidebarMenu.data('ui-slim-scroll-init')) {
        //
        $sidebarMenu.slimScroll({destroy: true});
      }
      //var autoHeight = Math.min($sidebarMenu[0].scrollHeight, document.body.scrollHeight);
      var autoHeight = $sidebarMenu[0].scrollHeight;

      $sidebarMenu.slimScroll({
        allowPageScroll: true, // allow page scroll when the element scroll is ended
        size: '7px',
        position: 'right',
        height: autoHeight,
        alwaysVisible: false,
        railVisible: true,
        disableFadeOut: true
      });
      $sidebarMenu.data('ui-slim-scroll-init', true);

    },
    /**
     * 定位右边菜单
     */
    locate: function (hash) {
      var self = this, $el = this.element,
        $toggleBtn = $el.find('.ui-sidebar-toggler'),
        $sidebar = $el.find('.ui-sidebar'),
        $sidebarMenu = $el.find('.ui-sidebar-menu');

      var $a = $sidebarMenu.find('a');
      $a.each(function (index, a) {
        var $a = $(a);
        if (a.hash === $.trim(hash)) {
          var $ul = $a.parent().parent();
          if ($ul.hasClass('sub-menu')) { //二级菜单
            $sidebarMenu.find('li.active').removeClass('active');
            $a.parent().addClass('active');
            $a.parent().parent().parent().addClass('active');
          } else { //一级菜单
            $sidebarMenu.find('li.active').removeClass('active');
            $a.parent().addClass('active');
          }
          return false;
        }
      });


      this._on($sidebar.find('li > ul > li > a'), {
        click: function (e) {
          var $target = $(e.target);
          if ($target.is('img')) {
            $target = $target.parent(); // <a>
          }

          // 移除选中(一级和二级)
          $sidebarMenu.find('li.active').removeClass('active');

          //激活(一级和二级)
          $target.parent().addClass('active');
          $target.parent().parent().parent().addClass('active');
        }
      });//end 二级菜单
    },

    /**
     * 销毁组件，由widget.js destroy方法调用
     * 清空节点和样式
     * @private
     */
    _destroy: function () {
      var self = this, $el = self.element,
        $sidebarMenu = $el.find('.ui-sidebar-menu');
      if ($sidebarMenu.data('ui-slim-scroll-init')) {
        $sidebarMenu.slimScroll({destroy: true});
      }

      $el.removeClass('ui-sidebar-wrapper').removeClass(this.options.customClass).css('z-index', '').empty();
      $('body').removeClass('ui-sidebar-left ui-sidebar-right ui-sidebar-fixed');
      $('body').removeClass('ui-sidebar-closed');
    }
  });

  function scrollTo(el, offeset) {
    var pos = (el && el.size() > 0) ? el.offset().top : 0;

    if (el) {
      pos = pos + (offeset ? offeset : -1 * el.height());
    }

    $('html,body').animate({scrollTop: pos}, 'slow');
  }


}();