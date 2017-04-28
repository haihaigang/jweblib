/**
 * js报错记入服务器
 */
(function() {
    var onerror_count = 0;//发送错误计数，每个页面只发送一次

    /**
     * 记录错误日志
     * @param msg 错误描述
     * @param url 错误的文件地址
     * @param row 错误的行数
     * @param column 错误所在的列
     * @return
     */
    function handleErr(msg, url, row, column) {
        if (onerror_count >= 1) return

        var html = "<iframe src='/error.html' style='display: none' frameborder='0' height='0' width='0' id='iframe-error'></iframe>";
        $("body").append(html);
        var iframe = document.getElementById("iframe-error");
        var iframeDocument = iframe.contentWindow;
        iframeDocument.onload = function() {
            var form = iframeDocument.document.getElementById('inner-form')
            form.querySelector("[name=message]").value = msg;
            form.querySelector("[name=url]").value = url;
            form.querySelector("[name=row]").value = row;
            form.querySelector("[name=column]").value = column;
            form.querySelector("[name=host]").value = location.href;
            form.submit();

        }

        onerror_count++
    }

    window.onerror = handleErr;
})()
