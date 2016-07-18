/**
 * Accordion Widget
 * @class fish.desktop.widget.Accordion
 * @extends fish.desktop.widget
 * <pre>
 *   $(element).accordion(option);
 * </pre>
 */
!function() {
    $.widget("ui.accordion", {
        options: {
            /**
             * @cfg {Number} active=false
             * 此属性为false时,collapsible=true时,默认不展开页签;collapsible=false时,默认展开第一个页签
             * 此属性为数值时,表示默认展开页签的索引,从0开始
             * The zero-based index of the panel that is active (open).
             * A negative value selects panels going backward from the last panel.
             * Setting active to false will collapse all panels. This requires the collapsible option to be true.
             */
            active: false,
            /**
             * @cfg {Object} animate={}
             * 可支持动画效果
             * settings with easing and duration properties.
             *   Multiple types supported:
             *   Boolean: A value of false will disable animations.
             *   Number: Duration in milliseconds with default easing.
             *   String: Name of easing to use with default duration.
             */
            animate: {}, //默认值可修改成null,取消默认动画效果
            /**
             * @cfg {Boolean} collapsible=true
             * 点击是否能够收缩已展开的面板
             * Whether all the sections can be closed at once. Allows collapsing the active section.
             */
            collapsible: true,
            /**
             * @cfg {String} event="click"
             * 默认为鼠标点击事件,支持mouseover
             * The event that accordion headers will react to in order to activate the associated panel. Multiple events can be specified, separated by a space.
             */
            event: "click",
            header: ".panel-heading", //含有panel-heading样式
            /**
             * @cfg {String} heightStyle="content"
             * panel的高度控制
             * Controls the height of the accordion and each panel. Possible values:
             * "auto": 设置所有面板为最高面板的高度.
             * "fill": 面板打开的高度是百叶窗父亲的高度减去其他面板的高度.
             * "content": 根据内容自适应高度.
             */
            heightStyle: "content",
            icons: {
                activeHeader: "glyphicon glyphicon-triangle-bottom",
                header: "glyphicon glyphicon-triangle-right"
            },
            // callbacks
            activate: null,
            beforeActivate: null
        },

        hideProps: {
            borderTopWidth: "hide",
            borderBottomWidth: "hide",
            paddingTop: "hide",
            paddingBottom: "hide",
            height: "hide"
        },

        showProps: {
            borderTopWidth: "show",
            borderBottomWidth: "show",
            paddingTop: "show",
            paddingBottom: "show",
            height: "show"
        },

        _create: function() {
            var options = this.options;
            this.prevShow = this.prevHide = $();
            this.element.addClass("ui-accordion").attr("role", "tablist");


            // don't allow collapsible: false and active: false / null
            if (!options.collapsible && (options.active === false || options.active == null)) {
                options.active = 0;
            }

            this._processPanels();
            // handle negative values
            if (options.active < 0) {
                options.active += this.headers.length;
            }
            this._refresh();
        },

        _getCreateEventData: function() {
            return {
                header: this.active,
                panel: !this.active.length ? $() : this.active.next()
            };
        },

        _createIcons: function() {
            var icons = this.options.icons;
            if (icons) {
                $("<span>")
                    .addClass(icons.header)
                    .prependTo(this.headers);
                this.active.children(":first")
                    .removeClass(icons.header)
                    .addClass(icons.activeHeader);
            }
        },

        _destroyIcons: function() {
            this.headers
                .children(":first-child")
                .remove();
        },

        _destroy: function() {
            var contents;

            // clean up main element
            this.element.removeClass("ui-accordion").removeAttr("role");

            // clean up headers
            this.headers
                .removeAttr("role")
                .removeAttr("aria-expanded")
                .removeAttr("aria-selected")
                .removeAttr("aria-controls")
                .removeAttr("tabIndex")
                .removeUniqueId();

            this._destroyIcons();

            // clean up content panels
            contents = this.headers.next()
                .removeClass("ui-accordion-content-active")
                .css("display", "")
                .removeAttr("role")
                .removeAttr("aria-hidden")
                .removeAttr("aria-labelledby")
                .removeUniqueId();

            if (this.options.heightStyle !== "content") {
                contents.css("height", "");
            }
        },

        _setOption: function(key, value) {
            if (key === "active") {
                // _activate() will handle invalid values and update this.options
                this._activate(value);
                return;
            }

            if (key === "event") {
                if (this.options.event) {
                    this._off(this.headers, this.options.event);
                }
                this._setupEvents(value);
            }

            this._super(key, value);

            // setting collapsible: false while collapsed; open first panel
            if (key === "collapsible" && !value && this.options.active === false) {
                this._activate(0);
            }

            if (key === "icons") {
                this._destroyIcons();
                if (value) {
                    this._createIcons();
                }
            }

            // #5332 - opacity doesn't cascade to positioned elements in IE
            // so we need to add the disabled class to the headers and panels
            if (key === "disabled") {
                this.element
                    .toggleClass("ui-state-disabled", !!value)
                    .attr("aria-disabled", value);
                this.headers.add(this.headers.next())
                    .toggleClass("ui-state-disabled", !!value);
            }
        },

        _keydown: function(event) {
            if (event.altKey || event.ctrlKey) {
                return;
            }

            var keyCode = $.ui.keyCode,
                length = this.headers.length,
                currentIndex = this.headers.index(event.target),
                toFocus = false;

            switch (event.keyCode) {
                case keyCode.RIGHT:
                case keyCode.DOWN:
                    toFocus = this.headers[(currentIndex + 1) % length];
                    break;
                case keyCode.LEFT:
                case keyCode.UP:
                    toFocus = this.headers[(currentIndex - 1 + length) % length];
                    break;
                case keyCode.SPACE:
                case keyCode.ENTER:
                    this._eventHandler(event);
                    break;
                case keyCode.HOME:
                    toFocus = this.headers[0];
                    break;
                case keyCode.END:
                    toFocus = this.headers[length - 1];
                    break;
            }

            if (toFocus) {
                $(event.target).attr("tabIndex", -1);
                $(toFocus).attr("tabIndex", 0);
                toFocus.focus();
                event.preventDefault();
            }
        },

        _panelKeyDown: function(event) {
            if (event.keyCode === $.ui.keyCode.UP && event.ctrlKey) {
                $(event.currentTarget).prev().focus();
            }
        },

        refresh: function() {
            var options = this.options;
            this._processPanels();

            // was collapsed or no panel
            if ((options.active === false && options.collapsible === true) || !this.headers.length) {
                options.active = false;
                this.active = $();
                // active false only when collapsible is true
            } else if (options.active === false) {
                this._activate(0);
                // was active, but active panel is gone
            } else if (this.active.length && !$.contains(this.element[0], this.active[0])) {
                // all remaining panel are disabled
                if (this.headers.length === this.headers.find(".ui-state-disabled").length) {
                    options.active = false;
                    this.active = $();
                    // activate previous panel
                } else {
                    this._activate(Math.max(0, options.active - 1));
                }
                // was active, active panel still exists
            } else {
                // make sure active index is correct
                options.active = this.headers.index(this.active);
            }

            this._destroyIcons();

            this._refresh();
        },

        _processPanels: function() {
            var prevHeaders = this.headers,
                prevPanels = this.panels;

            this.headers = this.element.children(".panel").children(this.options.header);

            this.headers.next()
                .filter(":not(.ui-accordion-content-active)")
                .hide();

            // Avoid memory leaks (#10056)
            if (prevPanels) {
                this._off(prevHeaders.not(this.headers));
                this._off(prevPanels.not(this.panels));
            }
        },

        _refresh: function() {
            var maxHeight,
                options = this.options,
                heightStyle = options.heightStyle,
                parent = this.element.parent();

            this.active = this._findActive(options.active);
            this.active.next()
                .addClass("ui-accordion-content-active")
                .show();

            this.headers
                .attr("role", "tab")
                .each(function() {
                    var header = $(this),
                        headerId = header.uniqueId().attr("id"),
                        panel = header.next(),
                        panelId = panel.uniqueId().attr("id");
                    header.attr("aria-controls", panelId);
                    panel.attr("aria-labelledby", headerId);
                })
                .next()
                .attr("role", "tabpanel");

            this.headers
                .not(this.active)
                .attr({
                    "aria-selected": "false",
                    "aria-expanded": "false",
                    tabIndex: -1
                })
                .next()
                .attr({
                    "aria-hidden": "true"
                })
                .hide();

            // make sure at least one header is in the tab order
            if (!this.active.length) {
                this.headers.eq(0).attr("tabIndex", 0);
            } else {
                this.active.attr({
                        "aria-selected": "true",
                        "aria-expanded": "true",
                        tabIndex: 0
                    })
                    .next()
                    .attr({
                        "aria-hidden": "false"
                    });
            }

            this._createIcons();

            this._setupEvents(options.event);

            if (heightStyle === "fill") {
                maxHeight = parent.height();
                this.element.siblings(":visible").each(function() {
                    var elem = $(this),
                        position = elem.css("position");

                    if (position === "absolute" || position === "fixed") {
                        return;
                    }
                    maxHeight -= elem.outerHeight(true);
                });

                this.headers.each(function() {
                    maxHeight -= $(this).outerHeight(true);
                });

                this.headers.next()
                    .each(function() {
                        $(this).height(Math.max(0, maxHeight -
                            $(this).innerHeight() + $(this).height()));
                    })
                    .css("overflow", "auto");
            } else if (heightStyle === "auto") {
                maxHeight = 0;
                this.headers.next()
                    .each(function() {
                        maxHeight = Math.max(maxHeight, $(this).css("height", "").height());
                    })
                    .height(maxHeight);
            }
        },

        _activate: function(index) {
            var active = this._findActive(index)[0];

            // trying to activate the already active panel
            if (active === this.active[0]) {
                return;
            }

            // trying to collapse, simulate a click on the currently active header
            active = active || this.active[0];

            this._eventHandler({
                target: active,
                currentTarget: active,
                preventDefault: $.noop
            });
        },

        _findActive: function(selector) {
            return typeof selector === "number" ? this.headers.eq(selector) : $();
        },

        _setupEvents: function(event) {
            var events = {
                keydown: "_keydown"
            };
            if (event) {
                $.each(event.split(" "), function(index, eventName) {
                    events[eventName] = "_eventHandler";
                });
            }

            this._off(this.headers.add(this.headers.next()));
            this._on(this.headers, events);
            this._on(this.headers.next(), {
                keydown: "_panelKeyDown"
            });
            this._hoverable(this.headers);
            this._focusable(this.headers);
        },

        _eventHandler: function(event) {
            var options = this.options,
                active = this.active,
                clicked = $(event.currentTarget),
                clickedIsActive = clicked[0] === active[0],
                collapsing = clickedIsActive && options.collapsible,
                toShow = collapsing ? $() : clicked.next(),
                toHide = active.next(),
                eventData = {
                    oldHeader: active,
                    oldPanel: toHide,
                    newHeader: collapsing ? $() : clicked,
                    newPanel: toShow
                };

            event.preventDefault();

            if (
                // click on active header, but not collapsible
                (clickedIsActive && !options.collapsible) ||
                // allow canceling activation
                (this._trigger("beforeActivate", event, eventData) === false)) {
                return;
            }

            options.active = collapsing ? false : this.headers.index(clicked);

            // when the call to ._toggle() comes after the class changes
            // it causes a very odd bug in IE 8 (see #6720)
            this.active = clickedIsActive ? $() : clicked;
            this._toggle(eventData);

            // switch classes
            // corner classes on the previously active header stay after the animation
            if (options.icons) {
                active.children(":first")
                    .removeClass(options.icons.activeHeader)
                    .addClass(options.icons.header);
            }

            if (!clickedIsActive) {
                if (options.icons) {
                    clicked.children(":first")
                        .removeClass(options.icons.header)
                        .addClass(options.icons.activeHeader);
                }

                clicked
                    .next()
                    .addClass("ui-accordion-content-active");
            }
        },

        _toggle: function(data) {
            var toShow = data.newPanel,
                toHide = this.prevShow.length ? this.prevShow : data.oldPanel;

            // handle activating a panel during the animation for another activation
            this.prevShow.add(this.prevHide).stop(true, true);
            this.prevShow = toShow;
            this.prevHide = toHide;

            if (this.options.animate) {
                this._animate(toShow, toHide, data);
            } else {
                toHide.hide();
                toShow.show();
                this._toggleComplete(data);
            }

            toHide.attr({
                "aria-hidden": "true"
            });
            toHide.prev().attr({
                "aria-selected": "false",
                "aria-expanded": "false"
            });
            // if we're switching panels, remove the old header from the tab order
            // if we're opening from collapsed state, remove the previous header from the tab order
            // if we're collapsing, then keep the collapsing header in the tab order
            if (toShow.length && toHide.length) {
                toHide.prev().attr({
                    "tabIndex": -1,
                    "aria-expanded": "false"
                });
            } else if (toShow.length) {
                this.headers.filter(function() {
                        return parseInt($(this).attr("tabIndex"), 10) === 0;
                    })
                    .attr("tabIndex", -1);
            }

            toShow
                .attr("aria-hidden", "false")
                .prev()
                .attr({
                    "aria-selected": "true",
                    "aria-expanded": "true",
                    tabIndex: 0
                });
        },

        _animate: function(toShow, toHide, data) {
            var total, easing, duration,
                that = this,
                adjust = 0,
                boxSizing = toShow.css("box-sizing"),
                down = toShow.length &&
                (!toHide.length || (toShow.index() < toHide.index())),
                animate = this.options.animate || {},
                options = down && animate.down || animate,
                complete = function() {
                    that._toggleComplete(data);
                };

            if (typeof options === "number") {
                duration = options;
            }
            if (typeof options === "string") {
                easing = options;
            }
            // fall back from options to animation in case of partial down settings
            easing = easing || options.easing || animate.easing;
            duration = duration || options.duration || animate.duration;

            if (!toHide.length) {
                return toShow.animate(this.showProps, duration, easing, complete);
            }
            if (!toShow.length) {
                return toHide.animate(this.hideProps, duration, easing, complete);
            }

            total = toShow.show().outerHeight();
            toHide.animate(this.hideProps, {
                duration: duration,
                easing: easing,
                step: function(now, fx) {
                    fx.now = Math.round(now);
                }
            });
            toShow
                .hide()
                .animate(this.showProps, {
                    duration: duration,
                    easing: easing,
                    complete: complete,
                    step: function(now, fx) {
                        fx.now = Math.round(now);
                        if (fx.prop !== "height") {
                            if (boxSizing === "content-box") {
                                adjust += fx.now;
                            }
                        } else if (that.options.heightStyle !== "content") {
                            fx.now = Math.round(total - toHide.outerHeight() - adjust);
                            adjust = 0;
                        }
                    }
                });
        },

        _toggleComplete: function(data) {
            var toHide = data.oldPanel;

            toHide
                .removeClass("ui-accordion-content-active");

            // Work around for rendering bug in IE (#5421)
            if (toHide.length) {
                toHide.parent()[0].className = toHide.parent()[0].className;
            }
            this._trigger("activate", null, data);
        }
    });

}();

/**
 * @method refresh
 * Process any headers and panels that were added or removed directly in the DOM and recompute the height of the accordion panels. Results depend on the content and the heightStyle option.
 */

/**
 * Triggered after a panel has been activated (after animation completes).
 * If the accordion was previously collapsed, ui.oldHeader and ui.oldPanel will be empty jQuery objects.
 * If the accordion is collapsing, ui.newHeader and ui.newPanel will be empty jQuery objects.
 * Note: Since the activate event is only fired on panel activation, it is not fired for the initial panel when the accordion widget is created. If you need a hook for widget creation use the create event.
 * @event activate
 * @param  {Object} event
 * @param  {Object} ui ui.newHeader,The header that was just activated;ui.oldHeader,The header that was just deactivated;ui.newPanel,The panel that was just activated; ui.oldPanel,The panel that was just deactivated.
 */

/**
 * Triggered directly before a panel is activated.
 * Can be canceled to prevent the panel from activating.
 * If the accordion is currently collapsed, ui.oldHeader and ui.oldPanel will be empty jQuery objects. If the accordion is collapsing, ui.newHeader and ui.newPanel will be empty jQuery objects.
 * @event beforeActivate
 * @param  {Object} event
 * @param  {Object} ui ui.newHeader,The header that is about to be activated;ui.oldHeader,The header that is about to be deactivated;ui.newPanel,The panel that is about to be activated; ui.oldPanel,The panel that is about to be deactivated.
 */

/**
 * Triggered when the accordion is created.
 * If the accordion is collapsed, ui.header and ui.panel will be empty jQuery objects.
 * @event create
 * @param  {Object} event
 * @param  {Object} ui ui.header,The active header;ui.panel,The active panel.
 */
