# FYP
install(expo)(need open a new folder and "cd" in then type this): 
"npx create-expo-app@latest --template blank ./"

To start: "npx expo start"
if scan error(clear the old cache and run): "npx expo start --tunnel --clear"
backend start(connect to the database):cd simple-backend; npm start

feat: 新增/修改功能 (feature)。
fix: 修補 bug (bug fix)。
docs: 文件 (documentation)。
style: 格式 (不影響程式碼運行的變動 white-space, formatting, missing semi colons, etc)。
refactor: 重構 (既不是新增功能，也不是修補 bug 的程式碼變動)。
perf: 改善效能 (A code change that improves performance)。
test: 增加測試 (when adding missing tests)。
chore: 建構程序或輔助工具的變動 (maintain)。
revert: 撤銷回覆先前的 commit 例如：revert: type(scope): subject (回覆版本：xxxx)。
i18n: 翻譯/多語言更新 (Internationalization and localization)。


//API_URL = 'http://192.168.50.124:3000/api/GetProduct'; 

//way to kill all the backend port:
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
