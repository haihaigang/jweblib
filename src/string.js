/**
 * 自定义验证，用于简单的校验
 */
! function() {
    /**
     * 是否含有空格或换行字符
     * @return {Boolean} [description]
     */
    String.prototype.isSpaces = function() {
        for (var i = 0; i < this.length; i += 1) {
            var ch = this.charAt(i);
            if (ch != ' ' && ch != "\n" && ch != "\t" && ch != "\r") {
                return false;
            }
        }
        return true;
    };

    /**
     * 是否是正确的邮箱地址
     * @return
     */
    String.prototype.isEmail = function() {
        return /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(this);
    };

    /**
     * 是否是正确的手机号码，1开头的11位数字
     * @return
     */
    String.prototype.isPhone = function() {
        return /^1\d{10}?$/.test(this);
    };

    /**
     * 是否为空
     * @return
     */
    String.prototype.isEmpty = function() {
        return (/^\s*$/.test(this));
    };

    /**
     * 是否正确的邮政编码，六位数字
     * @return
     */
    String.prototype.isPostCode = function() {
        return /^\d{6}?$/.test(this);
    };

    /**
     * 是否含有中文字符
     * @return
     */
    String.prototype.isZh = function() {
        return /[\u4e00-\u9fa5]+/.test(this);
    }
}()
