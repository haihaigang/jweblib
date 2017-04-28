module.exports = function(grunt) {
    var jsConfig = ['src/config-dev.js'];
    var jsConfigPro = ['src/config-pro.js'];
    var jsArr = [
        'src/error.js',
        'src/config.js',
        'src/filter.js',
        'src/webp.js',
        'src/log.js',
        'src/ajax.js',
        'src/dialog.js',
        'src/cookie.js',
        'src/storage.js',
        'src/guid.js',
        'src/second-page.js',
        'src/string.js',
        'src/template-helper.js',
        'src/utils.js',
        'src/utils-date.js',
        'src/utils-currency.js',
        'src/utils-browser.js',
        'src/utils-device.js',
        'src/tools.js',
        'src/go.js',
        'src/wechat.js',
        'src/wechat-login.js',
        'src/wechat-share.js',
        'src/wechat-pay.js',
        'src/common.js',
        'src/html.js'
    ];

    function getJs(isPro) {
        if (isPro) {
            return jsConfig.concat(jsArr);
        } else {
            return jsConfigPro.concat(jsArr);
        }
    }
    

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            allBaseInOne: {
                src: getJs(),
                dest: 'dist/global.js'
            },
            allBaseInOnePro: {
                src: getJs(true),
                dest: 'dist/global.js'
            }
        },

        watch: {
            global: {
                files: ['src/*.js'],
                tasks: ['concat:allBaseInOne'],
                options: {
                    spawn: true,
                    interrupt: true,
                    livereload_bk: true
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');

    grunt.registerTask('dev', '合并文件、开启监听', function() {
        grunt.task.run([
            'concat:allBaseInOne',
            'watch'
        ]);
    });

};
