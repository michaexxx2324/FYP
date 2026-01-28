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

poe api key:kyUmyep70nikyCi7RnLPIdPqanivHp6omXaV3-Y7MEk

vip deep mode:
1. 增加“添加剂等级划分” (Additive Classification)
不要只给一个 High/Low。深度模式应该能识别添加剂的类型。

建议方向：将添加剂细分为：人工色素、防腐剂、增味剂、甜味剂。

增强点：引用国际标准（如欧盟 E-numbers 或 FDA 标准）。

2. 引入“加工水平评估” (NOVA Classification)
这是目前营养学界非常流行的标准，用于判断食品是“天然”还是“超加工食品 (Ultra-processed foods)”。

深度点：识别该食品属于 NOVA 1（未加工）到 NOVA 4（超加工）中的哪一级。超加工食品通常与更高的健康风险挂钩。

3. 精确的“过敏原交叉比对” (Hidden Allergen Detection)
普通模式可能只看明显的单词，深度模式应能识别隐藏过敏原。

例子：如果用户对“牛奶”过敏，深度模式应能识别出 Casein (酪蛋白) 或 Whey (乳清) 也是危险的。

4. 营养配比建议 (Macronutrient Balance)
根据用户的身高体重，计算该食品占用户每日建议摄入量 (GDA/RDI) 的百分比。