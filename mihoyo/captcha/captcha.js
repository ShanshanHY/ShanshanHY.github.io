function getParam(name) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get(name);
}

function isNullOrEmpty(value) {
    return value === null || value === undefined || value === '';
}

function send_result(geetest_challenge, geetest_validate) {
    var xhr = new XMLHttpRequest();
    var url_params = "?uid=" + uid + "&challenge=" + geetest_challenge + "&validate=" + geetest_validate;
    xhr.open("GET", "https://api.starrycraft.cn/mihoyo/set" + url_params);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = null
            if (xhr.responseText) {
                data = JSON.parse(xhr.responseText);
            }
            if (data != null && data.retcode == 0) {
                button.textContent = "验证通过，正在跳转";
                button.classList.toggle('success');
                setTimeout((window.location.href='../sms?uid='+uid), 3000);
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

function main() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.starrycraft.cn/mihoyo/status");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = null
            if (xhr.responseText) {
                data = JSON.parse(xhr.responseText);
            }
            if (data != null && data.retcode == 0) {
                if (isNullOrEmpty(gt) || isNullOrEmpty(challenge) || isNullOrEmpty(uid)) {
                    button.classList.toggle('error');
                    button.textContent = "缺少必要参数";
                } else {
                    button.textContent = "正在加载人机验证";
                    captcha()
                }
            } else {
                button.classList.toggle('error');
                button.textContent = "数据回传错误";
            }
        } else if (xhr.readyState === 4 && xhr.status != 200) {
            button.classList.toggle('error');
            button.textContent = "后端连接失败";
        }
    }
    xhr.send();
}

function captcha() {
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
            button.textContent = "人机验证加载失败";
        })
    });
}

const gt = getParam("gt");
const challenge = getParam("challenge");
const uid = getParam("uid");
const button = document.getElementById("button");
main();

