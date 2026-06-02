import urllib.request
import re

html = urllib.request.urlopen('https://inventory-order-management-frontend.vercel.app').read().decode()
js_files = re.findall(r'src="([^"]+\.js)"', html)
print("JS files:", js_files)
for f in js_files:
    url = 'https://inventory-order-management-frontend.vercel.app' + f
    js_content = urllib.request.urlopen(url).read().decode()
    urls = re.findall(r'https://[a-zA-Z0-9-]+\.onrender\.com', js_content)
    if urls:
        print("Found APIs:", set(urls))
