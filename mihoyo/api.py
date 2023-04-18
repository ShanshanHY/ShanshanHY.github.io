from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import threading
import json
import time

data_base = {}

use_num = 0

class api(BaseHTTPRequestHandler):

    resp = {
        "retcode":0,
        "msg":"Success",
    }

    def do_GET(self):
        url_parse = urlparse(self.path)
        query_params = parse_qs(url_parse.query)
        params = {}
        for param in query_params:
            params[param] = query_params[param][0]
        if url_parse.path == "/get":
            resp_data = self.get_data(params)
        elif url_parse.path == "/set":
            resp_data = self.set_data(params)
        elif url_parse.path == "/clear":
            resp_data = self.clear_data(params)
        elif url_parse.path == "/status":
            resp_data = self.get_status()
        else:
            resp_data = self.no_api()
            self.send_response(404)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(resp_data.encode())
            return
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(resp_data.encode())

    def do_POST(self):
        # 处理 POST 请求
        if self.headers['Content-Length'] == None:
            return
        content_length = int(self.headers['Content-Length'])
        body_json = self.rfile.read(content_length).decode()
        body = json.loads(body_json)
        url_parse = urlparse(self.path)
        if url_parse.path == "/get":
            resp_data = self.get_data(body)
        elif url_parse.path == "/set":
            resp_data = self.set_data(body)
        elif url_parse.path == "/clear":
            resp_data = self.clear_data(body)
        elif url_parse.path == "/status":
            resp_data = self.get_status()
        else:
            resp_data = self.no_api()
            self.send_response(404)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-type', 'text/plain')
            self.send_header('Content-Length', str(len(resp_data)))
            self.end_headers()
            self.wfile.write(resp_data.encode())
            return
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Content-type', 'text/plain')
        self.send_header('Content-Length', str(len(resp_data)))
        self.end_headers()
        self.wfile.write(resp_data.encode())

    def get_data(self, params):
        resp_data = self.get_resp()
        if params.get("uid"):
            uid_value = data_base.get(params["uid"])
            if uid_value:
                data = {}
                data.update(uid_value)
                resp_data["retcode"] = 100
                if uid_value.get("validate"):
                    resp_data["retcode"] = 101
                if uid_value.get("sms_code"):
                    resp_data["retcode"] = 102
                del data["time"]
                resp_data["data"] = data
            else:
                resp_data["retcode"] = -1
                resp_data["msg"] = "No available value"
        else:
            resp_data["retcode"] = -401
            resp_data["msg"] = "Missing parameters"
        return json.dumps(resp_data)

    def set_data(self, params):
        resp_data = self.get_resp()
        resp_data["retcode"] = -401
        resp_data["msg"] = "Missing parameters"
        data = {}
        if data_base.get(params.get("uid")):
            data.update(data_base.get(params.get("uid")))
        if params.get("uid") and params.get("challenge") and params.get("gt"):
            data["challenge"] = params["challenge"]
            data["gt"] = params["gt"]
            data["time"] = now_time()
            data_base[params["uid"]] = data
            resp_data.update(self.get_resp())
        if params.get("uid") and params.get("sms_code"):
            data["sms_code"] = params["sms_code"]
            data["time"] = now_time()
            data_base[params["uid"]] = data
            resp_data.update(self.get_resp())
        if params.get("uid") and params.get("challenge") and params.get("validate"):
            data["challenge"] = params["challenge"]
            data["validate"] = params["validate"]
            data["time"] = now_time()
            data_base[params["uid"]] = data
            resp_data.update(self.get_resp())
        return json.dumps(resp_data)


    def clear_data(self, params):
        resp_data = self.get_resp()
        if data_base.get(params.get("uid")):
            del data_base[params["uid"]]
        return json.dumps(resp_data)

    def no_api(self):
        resp_data = self.get_resp()
        resp_data["retcode"] = -402
        resp_data["msg"] = "Api Not Find"
        return json.dumps(resp_data)

    def get_status(self):
        resp_data = self.get_resp()
        return json.dumps(resp_data)

    def get_resp(self):
        resp_data = {}
        resp_data.update(self.resp)
        return resp_data

def now_time():
    return int(time.time())

def cleanup():
    while True:
        time.sleep(60)
        now = now_time()
        expired_uids = [uid for uid, item in data_base.items() if now - item['time'] >= 180]
        for uid in expired_uids:
            del data_base[uid]

def user_add():
    global use_num
    use_num += 1
    print(f"调用set次数+1，当前共被调用{use_num}次")
    

if __name__ == '__main__':
    cleanup_thread = threading.Thread(target=cleanup, daemon=True)
    cleanup_thread.start()
    server_address = ('', 10890)
    httpd = HTTPServer(server_address, api)
    print('Serving HTTP on 0.0.0.0 port 10890...')
    httpd.serve_forever()
