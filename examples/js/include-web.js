(function () {
    var r = new RegExp("(^|(.*?\\/))(include-web\.js)(\\?|$)"),
        s = document.getElementsByTagName('script'), targetScript;
    for (var i = 0; i < s.length; i++) {
        var src = s[i].getAttribute('src');
        if (src) {
            var m = src.match(r);
            if (m) {
                targetScript = s[i];
                break;
            }
        }
    }

    function inputScript(url) {
        var script = '<script type="text/javascript" src="' + url + '"><' + '/script>';
        document.writeln(script);
    }

    function inputCSS(url) {
        var css = '<link rel="stylesheet" href="' + url + '">';
        document.writeln(css);
    }

    function inArray(arr, item) {
        for (i in arr) {
            if (arr[i] == item) {
                return true;
            }
        }
        return false;
    }

    /**
     * 得到根路径
     * @param from
     */
    function getBaseURL(){
        var from = targetScript.getAttribute("from");
        switch(from){
            case "index":
            case "download":
                return "./examples/";
            case "examples":
            case "editor":
                return "./";
            case "doc":
                return "../";
        }
    }

    //加载类库资源文件
    function load() {
        var includes = (targetScript.getAttribute('include') || "").split(",");
        var baseUrl=getBaseURL();
        if (inArray(includes, 'jquery')) {
           //  inputScript("https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js");
           inputScript(baseUrl+"js/jquery.min.3.2.1.js");
        }
        if (inArray(includes, 'bootstrap')) {
            //inputScript("https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js");
            inputScript(baseUrl+"js/jquery.min.3.2.1.js");
           // inputCSS("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css");
            inputCSS(baseUrl+"css/bootstrap.css");
           // inputScript("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js");
            inputScript(baseUrl+"js/bootstrap.min.js");
        }
        if (inArray(includes, 'bootstrap-css')) {
           // inputCSS("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css")
            inputCSS(baseUrl+"css/bootstrap.min.css");
        }

        if (inArray(includes, 'bootstrap-js')) {
           // inputScript("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js");
            inputScript(baseUrl+"js/bootstrap.min.js");
        }
        if (inArray(includes, 'template')) {
           // inputScript("http://iclient.supermap.io/libs/art-template/template-web.js");
            inputScript(baseUrl+"js/template-web.js");
        }

        if (inArray(includes, 'randomcolor')) {
            //inputScript("http://cdn.bootcss.com/randomcolor/0.5.2/randomColor.min.js");
            inputScript(baseUrl+"js/randomColor.min.js");
        }
        if (inArray(includes, 'papaparse')) {
           // inputScript("http://cdn.bootcss.com/PapaParse/4.3.2/papaparse.min.js");
            inputScript(baseUrl+"js/papaparse.min.js");
        }

        if (inArray(includes, 'moment')) {
           // inputScript("http://cdn.bootcss.com/moment.js/2.18.1/moment.min.js");
            inputScript(baseUrl+"js/moment.min.js");
           // inputScript("http://cdn.bootcss.com/moment.js/2.18.1/locale/zh-cn.js");
            inputScript(baseUrl+"js/zh-cn.js");
        }

        if (inArray(includes, 'bootstrap-datetimepicker')) {
           // inputCSS("http://cdn.bootcss.com/bootstrap-datetimepicker/4.17.47/css/bootstrap-datetimepicker.min.css");
            inputCSS(baseUrl+"css/bootstrap-datetimepicker.min.css");
           // inputScript("http://cdn.bootcss.com/bootstrap-datetimepicker/4.17.47/js/bootstrap-datetimepicker.min.js");
            inputScript(baseUrl+"js/bootstrap-datetimepicker.min.js");
        }
        if (inArray(includes, 'bootstrap-select')) {
            // inputCSS("http://cdn.bootcss.com/bootstrap-select/1.12.2/css/bootstrap-select.min.css");
           inputCSS(baseUrl+"js/bootstrap-select.min.css");
           // inputScript("http://cdn.bootcss.com/bootstrap-select/1.12.2/js/bootstrap-select.min.js");
            inputScript(baseUrl+"js/bootstrap-select.min.js");
        }
        if (inArray(includes, 'geohash')) {
           // inputScript("http://iclient.supermap.io/libs/geohash/geohash.js");
            inputScript(baseUrl+"js/geohash.js");
        }
        if (inArray(includes, 'dat-gui')) {
             //inputScript("http://cdn.bootcss.com/dat-gui/0.6.5/dat.gui.min.js");
           inputScript(baseUrl+"js/dat.gui.min.js");
        }
        if (inArray(includes, 'admin-lte')) {
           // inputCSS("http://cdn.bootcss.com/admin-lte/2.3.8/css/AdminLTE.min.css");
            inputCSS(baseUrl+"css/AdminLTE.min.css");
           // inputCSS("http://cdn.bootcss.com/admin-lte/2.3.8/css/skins/skin-blue.min.css");
            inputCSS(baseUrl+"css/skin-blue.min.css");
           // inputCSS("http://cdn.bootcss.com/font-awesome/4.7.0/css/font-awesome.min.css");
            inputCSS(baseUrl+"css/font-awesome.min.css");
           // inputScript("http://cdn.bootcss.com/admin-lte/2.3.8/js/app.min.js");
            inputScript(baseUrl+"js/app.min.js");
        }
        if (inArray(includes, 'jquery.scrollto')) {
           // inputScript("http://iclient.supermap.io/libs/jquery.scrollto/jquery.scrollTo.min.js");
            inputScript(baseUrl+"js/jquery.scrollTo.min.js");
        }
        if (inArray(includes, 'ace')) {
            //inputScript("http://cdn.bootcss.com/ace/1.2.6/ace.js");
            inputScript(baseUrl+"js/ace.js");
        }
        if (inArray(includes, 'widgets.alert')) {
           // inputScript("../js/widgets.js");
            inputScript(baseUrl+"js/widgets.js");
        }

        if (inArray(includes, 'widgets')) {
           // inputCSS("https://cdnjs.cloudflare.com/ajax/libs/css-loader/2.2.0/css-loader.css");
            inputCSS(baseUrl+"css/css-loader.css");
           // inputScript("../js/widgets.js");
            inputScript(baseUrl+"js/widgets.js");
        }

        if (inArray(includes, 'zTree')) {
            //inputCSS("https://cdnjs.cloudflare.com/ajax/libs/zTree.v3/3.5.29/css/zTreeStyle/zTreeStyle.min.css");
            inputCSS(baseUrl+"css/zTreeStyle.min.css");
            // inputScript("https://cdnjs.cloudflare.com/ajax/libs/zTree.v3/3.5.29/js/jquery.ztree.all.min.js");
           inputScript(baseUrl+"js/jquery.ztree.all.min.js");
        }
        if (inArray(includes, 'jquery-scontextMenu')) {
            // inputCSS("https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.6.3/jquery.contextMenu.min.css");
           inputCSS(baseUrl+"css/jquery.contextMenu.min.css");
            // inputScript("https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.6.3/jquery.contextMenu.min.js");
           inputScript(baseUrl+"js/jquery.contextMenu.min.js");
        }
        if (inArray(includes, 'colorpicker')) {
           // inputScript("http://iclient.supermap.io/libs/iclient8c/examples/js/jquery.js");
            inputScript(baseUrl+"js/jquery.min.js");
            // inputScript("http://iclient.supermap.io/libs/iclient8c/examples/js/jquery.colorpicker.js");
           inputScript(baseUrl+"js/jquery.colorpicker.js");
        }
        if (inArray(includes, 'fileupLoad')) {
           // inputScript("http://iclient.supermap.io/libs/iclient8c/examples/js/jquery.js");
            inputScript(baseUrl+"js/jquery.min.js");
           // inputScript("http://iclient.supermap.io/libs/iclient8c/examples/js/fileupLoad.js");
            inputScript(baseUrl+"js/fileupLoad.js");
        }
        if (inArray(includes, 'sticklr')) {
           // inputCSS("http://iclient.supermap.io/libs/iclient8c/examples/css/jquery-sticklr.css");
            inputCSS(baseUrl+"css/jquery-sticklr.css");
        }
        if (inArray(includes, 'responsive')) {
           // inputCSS("http://iclient.supermap.io/libs/iclient8c/examples/css/bootstrap-responsive.min.css");
            inputCSS(baseUrl+"css/bootstrap-responsive.min.css");
        }
        if (inArray(includes, 'lazyload')) {
            //inputScript("https://cdnjs.cloudflare.com/ajax/libs/jquery_lazyload/1.9.7/jquery.lazyload.min.js");
            inputScript(baseUrl+"js/jquery.lazyload.min.js");
        }
        if (inArray(includes, 'i18n')) {
           // inputScript("https://cdnjs.cloudflare.com/ajax/libs/i18next/10.0.7/i18next.js");
            inputScript(baseUrl+"js/i18next.js");
           // inputScript("https://cdnjs.cloudflare.com/ajax/libs/jquery-i18next/1.2.1/jquery-i18next.js");
            inputScript(baseUrl+"js/jquery-i18next.js");
           // inputScript("https://cdnjs.cloudflare.com/ajax/libs/i18next-xhr-backend/1.5.0/i18nextXHRBackend.min.js");
            inputScript(baseUrl+"js/i18nextXHRBackend.min.js");
        }
    }

    load();
    window.isLocal = false;
    window.server = "http://localhost:8090";
    window.version = "9.0.0";
})();
