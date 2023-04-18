function only_num() {
    sms_input.value = sms_input.value.replace(/[^\d]/g, '');
}

function getParam(name) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get(name);
}

function isNullOrEmpty(value) {
    return value === null || value === undefined || value === '';
}

function upload() {
    var sms_code = document.getElementById("sms_code").value;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.starrycraft.cn/mihoyo/set?uid=" + uid + "&sms_code=" + sms_code, false);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = null
            if (xhr.responseText) {
                data = JSON.parse(xhr.responseText);
            }
            if (data != null && data.retcode == 0) {
                button.textContent = "验证码上传成功";
                button.classList.toggle('success');
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

function main() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.starrycraft.cn/mihoyo/status", false);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var data = null
            if (xhr.responseText) {
                data = JSON.parse(xhr.responseText);
            }
            if (data != null && data.retcode == 0) {
                if (isNullOrEmpty(uid)) {
                    button.classList.toggle('error');
                    button.textContent = "缺少必要参数";
                } else {
                    button.textContent = "提交验证码";
                    button.addEventListener('click', function () {
                        upload()
                    });
                    sms_input.addEventListener("input", function () {
                        if (sms_input.value.length === 6) {
                            button.classList.toggle('ready');
                        } else {
                            button.classList.remove('ready')
                        }
                    });
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

const uid = getParam("uid");
const button = document.getElementById("button");
const sms_input = document.getElementById("sms_code");
main();
