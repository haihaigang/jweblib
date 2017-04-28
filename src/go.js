/**
 * 页面导航，依赖tools工具类、Jiao
 * 
 */
(function() {
    var go = {
        toHome: function() {
            if (Tools.isRbyAppBrowser()) {
                Jiao.toHome(2);
            } else {
                location.href = '../index.html';
            }
        },
        toGroup: function(pageId) {
            if (pageId) {
                url = '/group/activity.html?id=' + pageId;
            } else {
                url = '/group/activity.html';
            }
            url = Config.SHARE_HOST + url;

            if (Tools.isRbyAppBrowser()) {
                Jiao.toGroup(pageId ? url : '');
            } else {
                location.href = url;
            }
        },
        toDetail: function(productId) {
            if (Tools.isRbyAppBrowser()) {
                Jiao.toGoods(productId);
            } else {
                location.href = '../goods/goods-detail.html?productId=' + productId;
            }
        },
        toCheckout: function(addressId) {
            var param = {
                type: Tools._GET().type,
                targetId: Tools._GET().targetId,
                groupId: Tools._GET().groupId,
                addressId: addressId
            }
            var data = [];
            for (var i in param) {
                if (param[i])
                    data.push(i + '=' + param[i]);
            }
            if (Tools._GET().type == 'pin' || Tools._GET().type == 'mutiplePin') {
                location.href = '../shopping/pin-commit.html?' + data.join('&');
            } else {
                location.href = '../shopping/commit.html?' + data.join('&');
            }
        },
        toCategory: function(categoryId) {
            if (categoryId) {
                url = '/category/goods.html?categoryId=' + categoryId;
            } else {
                url = '/category/goods.html';
            }
            url = Config.SHARE_HOST + url;

            if (Tools.isRbyAppBrowser()) {
                Jiao.toCategory(categoryId ? url : '');
            } else {
                location.href = url;
            }
        },
        toBack: function() {
            // if (Tools.isRbyAppBrowser()) {
            // Jiao.toBack();
            // } else {
            history.back();
            // }
        }
    }
    window.Go = go;
})();
