// 商品上传初始化
function init(data) {
    var $preview = $("#preview");
    //轮播图数组
    var imgs = [];
    /*
     *初始化
     */
    init_main(data);
    init_slide(data);
    init_PCAS(data);
    /*
     *商品分类三级联动
     */
    var $cate_1st = $("#cate_first");
    var $cate_2nd = $("#cate_second");
    // 获取一级菜单
    getCate_1st($cate_1st);
    // 获取二级菜单
    $cate_1st.change(function() {
        var selected = $(this).val();
        getCate_2nd($cate_2nd, selected);
    });
    // 获取三级菜单
    $cate_2nd.change(function() {
        var selected = $(this).val();
        getCate_2nd($("#cate_third"), selected);
    });

    /*
     *富文本编辑器
     */
    var $detail = $('#detail');
    var E = window.wangEditor;
    var editor = new E('#editor');
    editor.customConfig.onchange = function(html) {
        // 监控变化，同步更新到 textarea
        $detail.val(html);
    }
    // 配置服务器端地址
    editor.customConfig.uploadImgServer = '/api/upload/common/';
    //自定义 fileName
    editor.customConfig.uploadFileName = 'file';

    editor.create();
    // 初始化 textarea 的值
    $detail.html(editor.txt.html());

    /*
     *主图上传
     */

    // 主图数据初始化
    function init_main(data) {
        // 如果data数据存在
        if (data) {
            $(".pic_box").html('<img src="' + data.mdImg + '" />');
            //隐藏数据
            $("#lgImg").val(data.lgImg);
            $("#mdImg").val(data.mdImg);
        }
    }
    // 处理上传
    $("#fbtn").change(function() {
        var formData = new FormData();
        //file对象
        var oFile = $(this)[0].files[0];
        formData.append("file", oFile);
        $.ajax({
            type: "post",
            url: "/api/upload/img/",
            async: true,
            contentType: false,
            processData: false,
            data: formData,
            success: function(result) {
                if (result.status) {
                    $(".pic_box").html('<img src="' + result.mdImg + '" />');
                    //隐藏数据
                    $("#lgImg").val(result.lgImg);
                    $("#mdImg").val(result.mdImg);
                } else {
                    alert(result.msg);
                }
            }
        });
    });

    /*
     *轮播图初始化
     */

    function init_slide(data) {
        if (data) {
            imgs = data.slideImgs;
            $.each(imgs, function(index, item) {
                $preview.append('<div class="img pull-left relative"><img src="' + item + '" /><div class="delete glyphicon glyphicon-remove"></div></div>')
            });
        }
    }

    //轮播图上传
    $("#pic_add").change(function() {
        var formData = new FormData();
        //file对象
        var oFile = $(this)[0].files[0];
        formData.append("file", oFile);
        $.ajax({
            type: "post",
            url: "/api/upload/slideImg/",
            async: true,
            contentType: false,
            processData: false,
            data: formData,
            success: function(result) {
                if (result.status) {
                    $preview.append('<div class="img pull-left relative"><img src="' + result.slideImg + '" /><div class="delete glyphicon glyphicon-remove"></div></div>')
                    //隐藏数据
                    imgs.push(result.slideImg);
                } else {
                    alert(result.msg);
                }
            }
        });
    });
    //轮播图删除--事件委托
    $preview.on("click", ".delete", function() {
        //删除数组
        var index = $(this).parent().index();
        imgs.splice(index, 1);
        //删除DOM元素
        $(this).parent().remove();
    });

    /*
     *省市区三级联动
     */
    function init_PCAS(data) {
        if (data) {
            new PCAS("Province", "City", "Area", data.Province, data.City, data.Area);
        } else {
            new PCAS("Province", "City", "Area", "山东省", "青岛市", "市南区");
        }
    }

    /*
     *表单验证
     */
    $("#form").Validform({
        tiptype: 3,
        ajaxPost: true,
        datatype: {
            price: /(^[1-9]\d{0,6}$)|(^0\.\d{2}$)|(^[1-9]\d{0,6}\.\d{2}$)/
        },
        beforeSubmit: function($form) {
            // 序列化表单
            var data = serializeObject($form);
            data.slideImgs = imgs;
            $.post("/api/goods/release", data, function(result) {
                alert(result.msg);
            });
            return false;
        }
    });
}
// 获取菜单一级
function getCate_1st(element) {
    $.getJSON("/api/getCategory/first/", function(result) {
        if (!result.status) {
            alert(result.msg);
            return
        }
        var html = template("tmpl-option", result);
        element.html(html);
        // 执行回调函数
        var $next = element.next("select");
        if ($next.length > 0) {
            getCate_2nd($next, result.data[0].id);
        }
    });
}
// 获取菜单二级
function getCate_2nd(element, id) {
    $.getJSON("/api/getCategory/sub/", { pId: id }, function(result) {
        if (!result.status) {
            alert(result.msg);
            return
        }
        var html = template("tmpl-option", result);
        element.html(html);
        // 获取下一级菜单
        var $next = element.next("select");
        if ($next.length > 0) {
            getCate_2nd($next, result.data[0].id);
        }
    });
}

// 设置分类菜单一级
function setCate_1st(element, data) {
    $.getJSON("/api/getCategory/first/", function(result) {
        if (!result.status) {
            alert(result.msg);
            return;
        }
        // 如果传入data,说明获取详情，设置该值selected
        if (data.cateFirst) {
            result.selected = data.cateFirst;
        }
        var html = template("tmpl-option", result);
        element.html(html);
        // 执行回调函数
        var $next = element.next("select");
        if (!$next.length) {
            console.log('没有下一级菜单！');
            return;
        }
        // 如果传入data,说明获取详情，该值selected传给下一级菜单
        if (data.cateFirst) {
            setCate_2nd($next, data.cateFirst, data);
            return;
        }
        setCate_2nd($next, result.data[0].id);
    });
}
// 设置分类菜单二级
function setCate_2nd(element, id, data) {
    $.getJSON("/api/getCategory/sub/", { pId: id }, function(result) {
        if (!result.status) {
            alert(result.msg);
            return
        }
        var html = template("tmpl-option", result);
        element.html(html);
        // 获取下一级菜单
        var $next = element.next("select");
        if ($next.length > 0) {
            getCate_2nd($next, result.data[0].id);
        }
    });
}