var getParam = function (name) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get(name);
}

var isNullOrEmpty = function isNullOrEmpty(value) {
    return value === null || value === undefined || value === '';
}

var send_result = function (geetest_challenge, geetest_validate) {
    var xhr = new XMLHttpRequest();
    var url_params = "?uid=" + uid + "&challenge=" + geetest_challenge + "&validate=" + geetest_validate;
    xhr.open("GET", "https://api.starrycraft.cn/mihoyo/set" + url_params);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var status = -1
            if (xhr.responseText) {
                status = JSON.parse(xhr.responseText);
            } 
            if (status.retcode == 0) {
                button.classList.toggle('success');
                button.textContent = "验证成功";
            } else {
                button.classList.toggle('error');
                button.textContent = "数据上传失败";
            }
        } else if (xhr.readyState === 4 && xhr.status != 200) {
            button.classList.toggle('error');
            button.textContent = "后端连接失败";
        }
    };
}

var backend_status = function () {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.starrycraft.cn/mihoyo/status");
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var status = -1
            if (xhr.responseText) {
                status = JSON.parse(xhr.responseText);
            }
            if (status.retcode == 0) {
                if (isNullOrEmpty(gt) || isNullOrEmpty(challenge) || isNullOrEmpty(uid)) {
                    button.classList.toggle('error');
                    button.textContent = "缺少必要参数";
                } else {
                    captcha()
                }
            } else {
                button.classList.toggle('error');
                button.textContent = "后端内部错误";
            }
        } else if (xhr.readyState === 4 && xhr.status != 200) {
            button.classList.toggle('error');
            button.textContent = "后端连接失败";
        }
    }
}

var captcha = function () {
    initGeetest({
        gt: getParam("gt"),
        challenge: getParam("challenge"),
        offline: false,
        new_captcha: true,
        hideClose: true,
        hideRefresh: true,
        hideSuccess: true,
        api_server: 'api.geetest.com',
        product: 'bind',
    }, function (captchaObj) {
        captchaObj.appendTo('#button');
        captchaObj.onReady(function () {
            button.classList.toggle('ready');
            button.textContent = "点击按钮验证";
            const button_ready = document.getElementById('button');
            button_ready.addEventListener('click', function () {
                captchaObj.verify();
            });
        }).onSuccess(function () {
            button.classList.toggle('upload');
            button.textContent = "正在上传数据"
            var result = captchaObj.getValidate();
            send_result(result.geetest_challenge, result.geetest_validate)
        }).onError(function () {
            button.classList.toggle('error');
            button.textContent = "验证码加载失败";
        })
    });
}

var gt = getParam("gt");
var challenge = getParam("challenge");
var uid = getParam("uid");
var button = document.getElementById("button");
var run = backend_status();

