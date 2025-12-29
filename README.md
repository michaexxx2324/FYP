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
 ERROR  Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version. gluten

Call Stack
  construct (<native>)
  apply (<native>)
  _construct (node_modules\@babel\runtime\helpers\construct.js)
  Wrapper (node_modules\@babel\runtime\helpers\wrapNativeSuper.js)
  construct (<native>)
  _callSuper (node_modules\@babel\runtime\helpers\callSuper.js)
  NamelessError (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  captureCurrentStack (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  HMRClient.log (node_modules\@expo\metro-runtime\src\metroServerLogs.native.ts)
  console.level (node_modules\react-native\Libraries\Core\setUpDeveloperTools.js)
  runWithFiberInDEV$argument_1 (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  runWithFiberInDEV (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  warnOnInvalidKey (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  reconcileChildrenArray (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  reconcileChildFibersImpl (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  <anonymous> (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  reconcileChildren (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  beginWork (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  runWithFiberInDEV (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  performUnitOfWork (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  workLoopSync (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  renderRootSync (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  performWorkOnRoot (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  performSyncWorkOnRoot (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  flushSyncWorkAcrossRoots_impl (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  processRootScheduleInMicrotask (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)
  scheduleMicrotask$argument_0 (node_modules\react-native\Libraries\Renderer\implementations\ReactFabric-dev.js)

Call Stack
  allergiesList.map$argument_0 (app\settings.jsx)
  map (<native>)
  SettingsScreen (app\settings.jsx)
  BaseRoute (node_modules\expo-router\build\useScreens.js)
  SceneView (node_modules\@react-navigation\core\lib\module\SceneView.js)
  render (node_modules\@react-navigation\core\lib\module\useDescriptors.js)
  routes.reduce$argument_0 (node_modules\@react-navigation\core\lib\module\useDescriptors.js)
  reduce (<native>)
  useDescriptors (node_modules\@react-navigation\core\lib\module\useDescriptors.js)
  useNavigationBuilder (node_modules\@react-navigation\core\lib\module\useNavigationBuilder.js)
  NativeStackNavigator (node_modules\expo-router\build\fork\native-stack\createNativeStackNavigator.js)
  <anonymous> (node_modules\expo-router\build\layouts\withLayoutContext.js)
  Object.assign$argument_0 (node_modules\expo-router\build\layouts\StackClient.js)
  RootLayout (app\_layout.jsx)
  BaseRoute (node_modules\expo-router\build\useScreens.js)
  SceneView (node_modules\@react-navigation\core\lib\module\SceneView.js)
  render (node_modules\@react-navigation\core\lib\module\useDescriptors.js)
  routes.reduce$argument_0 (node_modules\@react-navigation\core\lib\module\useDescriptors.js)
  reduce (<native>)
  useDescriptors (node_modules\@react-navigation\core\lib\module\useDescriptors.js)
  useNavigationBuilder (node_modules\@react-navigation\core\lib\module\useNavigationBuilder.js)
  Content (node_modules\expo-router\build\ExpoRoot.js)
  ContextNavigator (node_modules\expo-router\build\ExpoRoot.js)
  ExpoRoot (node_modules\expo-router\build\ExpoRoot.js)
  App (node_modules\expo-router\build\qualified-entry.js)
  WithDevTools (node_modules\expo\src\launch\withDevTools.tsx) 建構程序或輔助工具的變動 (maintain)。
revert: 撤銷回覆先前的 commit 例如：revert: type(scope): subject (回覆版本：xxxx)。
i18n: 翻譯/多語言更新 (Internationalization and localization)。

ocr.space:k89557491788957
poe api key:kyUmyep70nikyCi7RnLPIdPqanivHp6omXaV3-Y7MEk
