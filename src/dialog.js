/**
* 自定义提示框，依赖jquery
* 
* Dialog.showAlert('')
* Dialog.showConfirm('')
* Dialog.showAlert(options)
* Dialog.showConfirm(options)
*
* options说明
* {
*     type: '弹框类型',
*     tick: '自动关闭的时间，0不关闭，默认0',
*     message: '提示正文内容，富文本',
*     okText: '确定按钮的文字',
*     cancelText: '取消按钮的文字',
*     showTitle: '是否显示标题，默认不显示',
*     titleText: '标题文字',
*     showTips: '是否显示提示，默认不显示',
*     tipsText: '提示文字',
*     className: '追加的内容样式名称',
*     yesCallback: '点击确定按钮的回调',
*     noCallback: '点击取消按钮的回调',
*     tipCallback: '点击提示信息的回调'
* }
*
* 依赖的dom结构，示例用
* <div class="dialog" id="tj-panel">
      <div class="dialog-content">
          <div class="panel-content">
              <div class="panel-cell">
                  <h3 class="panel-title">xxx</h3>
                  <div class="panel-text">xxx</div>
              </div>
          </div>
          <div class="panel-buttons">
              <div class="options">
                  <a href="javascript:;" class="btn btn-default">取消</a>
                  <a href="javascript:;" class="btn btn-primary">确定</a>
              </div>
              <div class="panel-tips">xxx</div>
          </div>
      </div>
  </div>
**/
(function() {
    var that = this,
        preventDefault, panel, panelBg, delay, count = 0,
        toastPanel, temp;

    //自定义提示框
    var Dialog = function(el, options) {
        var that = this;

        that.panel = el || $('#tj-panel');
        that.panelBg = panelBg || $('#tj-panel-bg');
        that.dialogContent = that.panel.find('.dialog-content');
        that.panelContent = that.panel.find('.panel-content');
        that.panelTitle = that.panel.find('.panel-title');
        that.panelTips = that.panel.find('.panel-tips');
        that.panelButtons = that.panel.find('.panel-buttons');
        that.btnOk = that.panel.find('.btn-primary');
        that.btnCancel = that.panel.find('.btn-default');
        that.panelText = that.panel.find('.panel-text');
        that.panelTick = that.panel.find('.panel-tick');
        that.panelInput = that.panel.find('.panel-input');

        that.commitPanel = el || $('#tj-commit-panel');
        that.commitDialogContent = that.commitPanel.find('.commit-dialog-content');

        that.options = {
            type: 'error',
            tick: 0,
            okText: '确定',
            cancelText: '取消',
            showTitle: false,
            showTips: false,
            textAlign: 'center',
        };

        //关闭
        that.panel.on('click', '.btn-primary', function(e) {
            e.preventDefault();
            that.hide(true);
        });

        //取消
        that.panel.on('click', '.btn-default', function(e) {
            e.preventDefault();
            that.hide();
        });

        if (that.panel.length > 0) {
            that.panel[0].addEventListener('touchmove', function(e){
                e.preventDefault();
            }, true);
        }
    };

    Dialog.prototype = {
        delay: undefined,
        count: 0,
        setOptions: function(options) {
            var that = this;

            for (i in options) that.options[i] = options[i];

            if (that.options.showTitle) {
                that.panelTitle.show();
            } else {
                that.panelTitle.hide();
            }
            if (that.options.showTips) {
                that.panelTips.show();
            } else {
                that.panelTips.hide();
            }
            if (that.options.panelInput) {
                that.panelInput.show();
            } else {
                that.panelInput.hide();
            }
            if (that.options.okText) {
                that.btnOk.text(that.options.okText);
            }
            if (that.options.cancelText) {
                that.btnCancel.text(that.options.cancelText);
            }
            if (that.options.tipsText) {
                that.panelTips.html(that.options.tipsText);
            }
            if (that.options.titleText) {
                that.panelTitle.text(that.options.titleText);
            }
            if (that.options.type == 'confirm') {
                that.btnOk.show();
                that.btnCancel.show();
            } else if (that.options.type == 'prompt') {
                that.btnOk.show();
                that.btnCancel.show();
            } else {
                that.btnOk.show();
                that.btnCancel.hide();
            }
            if (that.options.className) {
                that.panelText.addClass(that.options.className);
            } else {
                that.panelText.removeClass(that.options.className);
            }

            that.panelText.html(that.options.message);
            that.panel.show();
            that.panelBg.show();

            //确定窗口位置
            if (that.dialogContent.height() > $(window).height()) {
                that.dialogContent.css({
                    'margin-top': 0,
                    'top': 0
                });
            } else {
                that.dialogContent.css({
                    'margin-top': -(that.dialogContent.height() / 2),
                    'top': '50%'
                });
            }


            //确定窗口位置
            // if (that.commitDialogContent.height() > $(window).height()) {
            //     that.commitDialogContent.css({
            //         'margin-top': 0,
            //         'top': 0
            //     });
            // } else {
            //     that.commitDialogContent.css({
            //         'margin-top': -(that.commitDialogContent.height() / 2),
            //         'top': '50%'
            //     });
            // }
            that.panelContent.css('max-height', ($(window).height() - that.panelButtons.height()));
            // document.addEventListener('touchmove', prevent, true);

            if (that.options.tick > 1000) {
                that.panelTick.text(that.options.tick / 1000);
                that.delay = setInterval(function() {
                    if (that.count < that.options.tick - 1000) {
                        that.count = count + 1000;
                        that.panelTick.text((that.options.tick - count) / 1000);
                    } else {
                        that._end();
                        that.count = 0;
                        clearInterval(that.delay);
                    }
                }, 1000);
            } else if (that.options.tick <= 1000 && that.options.tick > 0) {
                that.delay = setTimeout(function() {
                    that._end();
                }, that.options.tick);
            }
        },
        _end: function() {
            var that = this;

            that.panel.hide();
            that.panelBg.hide();

            if (typeof that.options.tipsCallback == 'function') {
                that.options.tipsCallback();
                that.options.tipsCallback = undefined;
            } else if (typeof that.options.yesCallback == 'function') {
                that.options.yesCallback();
                that.options.yesCallback = undefined;
            }
        },
        hide: function(yesClick) {
            var that = this;

            if (that.delay) {
                clearTimeout(that.delay);
            }
            if (!that.panel) {
                return;
            }
            that.panel.hide();
            that.panelBg.hide();

            if (yesClick) {
                typeof that.options.yesCallback == 'function' && that.options.yesCallback();
            } else {
                typeof that.options.noCallback == 'function' && that.options.noCallback();
            }
            that.options.yesCallback = undefined;
            that.options.noCallback = undefined;
            // document.removeEventListener('touchmove', prevent,true);
        },
        preventDefault: function(e) {
            e.preventDefault();
        },
        // 显示确认框
        showConfirm: function(msg, yesCallback, noCallback) {
            var opt = {};
            if (typeof msg == 'object') {
                opt = msg;
            } else {
                opt.message = msg;
                opt.yesCallback = yesCallback;
                opt.noCallback = noCallback;
            }
            opt.type = 'confirm';
            opt.showTitle = true;
            opt.showTip = false;
            opt.titleText = opt.titleText || '提示';
            opt.className = opt.className || 'text-c';

            panel = panel || new Dialog();
            panel.setOptions(opt);
        },
        // 显示提示
        showAlert: function(msg, tick, callback) {
            var opt = {};
            if (typeof msg == 'object') {
                opt = msg;
            } else {
                opt.message = msg;
                opt.tick = tick;
                opt.yesCallback = callback;
            }
            if (typeof opt.showTitle != 'boolean') {
                opt.showTitle = false;
            }
            opt.type = 'alert';

            panel = panel || new Dialog();
            panel.setOptions(opt);
        },
    }

    function prevent(e) {
        e.preventDefault();
    }

    window.Dialog = new Dialog();
})()
