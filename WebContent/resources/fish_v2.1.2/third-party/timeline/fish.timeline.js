/**
     * @class fish.desktop.widget.Timeline
     * timeline 时间轴组件
     * <pre>
     *   $('#timeline').timeline();
     * </pre>
     */

!function() {
    'use strict';
    
    $.widget("ui.timeline", {
        options: {
            /**
             * 数据源
             * @cfg {Object} params: ["date": "", "children": [{
             *       "title": "",
             *       "time": "",
             *       "content": ""
             *   }]
             *}]
             */
            params: [{
                "date": "",
                "children": [{
                    "title": "",
                    "time": "",
                    "content": ""
                }]
            }],
            /**
             * orientation显示方向
             * @cfg {String} orientation = 'vertical' || 'horizontal'
             */
            orientation: 'vertical'
        },
        _create: function() {
            var template =
                "{{#ifCond orientation '===' 'horizontal'}}" +
                "<ul class='timeline horizontal'>" +
                "{{/ifCond}}" +
                "{{#ifCond orientation '===' 'vertical'}}" +
                "<ul class='timeline'>" +
                "{{/ifCond}}" +
                "{{#each params}}" +
                "<li>" +
                "<div class='tldate'>{{date}}</div>" +
                "</li>" +
                "{{#each children}}" +
                "<li class='timeline'>" +
                "<div class='tl-time'>{{time}}</div>" +
                "<div class='tl-circ'></div>" +
                "<div class='timeline-panel'>" +
                "<div class='tl-heading'>" +
                "<h4>{{title}}</h4>" +
                "</div>" +
                "<div class='tl-body'>" +
                "<p>{{content}}</p>" +
                "</div>" +
                "</div>" +
                "</li>" +
                "{{/each}}" +
                "{{/each}}" +
                "</ul>";
            if (this.options.orientation !== 'vertical' && this.options.orientation !== 'horizontal') {
                throw new Error('orientation is incorrect');
            }
            this.element.append(fish.compile(template)(this.options));

        },

        _delegateEvent: function() {

        },

        _destroy: function() {
            this.element.children().remove();
        }
    })

}();
