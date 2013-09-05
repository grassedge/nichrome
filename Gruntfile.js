module.exports = function(grunt) {

    'use strict';

    [
        'grunt-contrib-jst',
        'grunt-contrib-less',
        'grunt-contrib-cssmin',
        'grunt-typescript',
        'grunt-contrib-uglify',
        'grunt-contrib-watch'
    ].forEach(function (name) {
        grunt.loadNpmTasks(name);
    });


    grunt.initConfig({

        jst: {
            options: {
                processName: function(filepath) {
                    return filepath.replace(/^views\//, '')
                        .replace(/\.(.*)$/, '')
                        .replace(/\//g, '-');
                }
            },
            compile: {
                files: {
                    "public/js/jst.js": "views/**/*.ejs"
                }
            }
        },

        typescript: {
            client: {
                src: ['src/nichrome/**/*.ts'],
                dest: 'public/js/src',
                options: {
                    module: 'commonjs',
                    target: 'es5',
                    base_path: 'src',
                    sourcemap: false,
                    fullSourceMapPath: false,
                    declaration: false,
                    ignoreTypeCheck: true,
                }
            }
        },

        uglify: {
            pc: {
                files: {
                    'public/js/nichrome.min.js': [
                        'public/js/src/**/*.js'
                    ]
                }
            },
        },

        less: {
            options: {
                compress: true
            },
            pc: {
                files: {
                    'public/css/nichrome.css': 'public/less/nichrome.less'
                }
            },
        },

        cssmin: {
            pc: {
                files: {
                    'public/css/nichrome.min.css': [
                        'public/css/nichrome.css'
                    ]
                }
            }
        },

        watch: {
            jst: {
                files: ['views/**/*.ejs'],
                tasks: ['jst']
            },
            less: {
                files: ['public/less/*.less'],
                tasks: ['less', 'cssmin']
            },
            typescript: {
                files: ['public/less/*.less'],
                tasks: ['typescript', 'uglify']
            }
        },
    });
}

