var LICENSE_TEMPLATE =
    '/**\n\
         * <%= pkg.name %> v<%= pkg.version %>\n\
         *\n\
         * Copyright 2013-2015, ZTESoft, Inc.\n\
         * All rights reserved.\n\
         *\n\
         * This source code is licensed under the LGPLV3-style license found in the\n\
         * LICENSE file in the root directory of this source tree. \n\
         *\n\
         */',
    config = require('./config.json');

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);
    grunt.file.defaultEncoding = 'utf8';
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        destDir: './modules/common/styles',//'./LESS/css/<%= pkg.name %>',
        iomDir: './resources/idc',
        clean: {
            dist: ['./LESS/css']
        },
        less: {
            options: {
                banner: LICENSE_TEMPLATE
            },
            compile: {
                files: {
                    '<%= destDir%>/<%= pkg.name %>-proj-all.css': 'LESS/cloud-proj/cloud-proj-all.less',
                    '<%= iomDir%>/idccommon.css': 'LESS/hniom-proj/hniom-proj-all.less',
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: config.autoprefixer.browsers
            },
            cssCloudProj: {
                src: '<%= destDir%>/<%= pkg.name %>-proj-all.css'
            },
            cssIOMProj: {
                src: '<%= iomDir%>/hniom-proj-all.css'
            }
        },
        cssmin: {
            options: {
                banner: LICENSE_TEMPLATE
            },
            cssCloudProj: {
                src: '<%= destDir%>/<%= pkg.name %>-proj-all.css',
                dest: '<%= destDir%>/<%= pkg.name %>-proj-all.min.css'
            },
            cssIOMProj: {
                src: '<%= iomDir%>/idccommon.css',
                dest: '<%= iomDir%>/idccommon.min.css'
            }
        }
    });
    
    grunt.registerTask('dist-css', ['less', 'autoprefixer', 'cssmin']); //, 'copy:fonts', 'copy:imgs'
    grunt.registerTask('default', ['dist-css']); // ['clean', 'dist-doc', 'dist-css', 'dist-js', 'dist-third-party']
};
