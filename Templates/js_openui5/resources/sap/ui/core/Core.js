/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','sap/ui/Device','sap/ui/Global','sap/ui/base/BindingParser','sap/ui/base/DataType','sap/ui/base/EventProvider','sap/ui/base/Interface','sap/ui/base/Object','sap/ui/base/ManagedObject','./Component','./Configuration','./Control','./Element','./ElementMetadata','./FocusHandler','./RenderManager','./ResizeHandler','./ThemeCheck','./UIArea','./message/MessageManager','jquery.sap.act','jquery.sap.dom','jquery.sap.events','jquery.sap.mobile','jquery.sap.properties','jquery.sap.resources','jquery.sap.script','jquery.sap.sjax'],function(q,D,G,B,a,E,I,c,M,C,d,f,g,h,F,R,j,T,U,k){"use strict";function r(o,m){var b=sap.ui.require(m);return typeof b==='function'&&(o instanceof b);}var s=U._oRenderLog;var L={};var t={};var _;var u=c.extend("sap.ui.core.Core",{constructor:function(){if(sap.ui.getCore&&sap.ui.getCore()){return sap.ui.getCore();}var b=this,l=q.sap.log,e="sap.ui.core.Core";c.call(this);_=new E();["attachEvent","detachEvent","getEventingParent"].forEach(function(v){u.prototype[v]=_[v].bind(_);});this.bBooted=false;this.bInitialized=false;this.bDomReady=false;this.aPlugins=[];this.mLibraries={};this.mResourceBundles={};this.mUIAreas={};this.oModels={};this.oEventBus=null;this.mElements={};this.mObjects={"component":{},"template":{}};this.oRootComponent=null;this.aInitListeners=[];this.bInitLegacyLib=false;this._sRerenderTimer=this;this.aPrerenderingTasks=[];l.info("Creating Core",null,e);q.sap.measure.start("coreComplete","Core.js - complete");q.sap.measure.start("coreBoot","Core.js - boot");q.sap.measure.start("coreInit","Core.js - init");this.oConfiguration=new d(this);var o=this.oConfiguration["frameOptionsConfig"]||{};o.mode=this.oConfiguration.getFrameOptions();o.whitelistService=this.oConfiguration.getWhitelistService();this.oFrameOptions=new q.sap.FrameOptions(o);if(this.oConfiguration["bindingSyntax"]==="complex"){M.bindingParser=B.complexParser;}if(this.oConfiguration["xx-designMode"]==true){B._keepBindingStrings=true;}this._grantFriendAccess();var m=this.oConfiguration.modules;if(this.oConfiguration.getDebug()){m.unshift("sap.ui.debug.DebugEnv");}var i=m.indexOf("sap.ui.core.library");if(i!=0){if(i>0){m.splice(i,1);}m.unshift("sap.ui.core.library");}if(this.oConfiguration["xx-lesssupport"]&&m.indexOf("sap.ui.core.plugin.LessSupport")==-1){l.info("Including LessSupport into declared modules");m.push("sap.ui.core.plugin.LessSupport");}var p=this.oConfiguration.preload;if(window["sap-ui-debug"]===true){p="";}if(p==="auto"){p=window["sap-ui-optimized"]?"sync":"";}this.oConfiguration.preload=p;var n=p==="async";this.oConfiguration['xx-libraryPreloadFiles'].forEach(function(v){var k1=String(v).trim().split(/\s*:\s*/),l1=k1[0],m1=k1[1];if(k1.length===1){m1=l1;l1='';}if(/^(?:none|js|json|both)$/.test(m1)){w[l1]=m1;}});l.info("Declared modules: "+m,e);this._setupThemes();this._setupContentDirection();var $=q("html");this._setupBrowser($);this._setupOS($);this._setupLang($);this._setupAnimation($);sap.ui.getCore=q.sap.getter(this.getInterface());this.oRenderManager=new R();var N=q.sap.syncPoint("UI5 Document Ready",function(v,k1){b.bDomReady=true;b.init();});var O=N.startTask("document.ready");var P=N.startTask("preload and boot");q(function(){l.trace("document is ready");N.finishTask(O);});var Q=q.sap.syncPoint("UI5 Core Preloads and Bootstrap Script",function(v,k1){l.trace("Core loaded: open="+v+", failures="+k1);b._boot(n,function(){N.finishTask(P);q.sap.measure.end("coreBoot");});});var V=Q.startTask("create sp2 tasks task");if(this.oConfiguration["versionedLibCss"]){var W=Q.startTask("load version info");var X=function(v){if(v){l.trace("Loaded \"sap-ui-version.json\".");}else{l.error("Could not load \"sap-ui-version.json\".");}Q.finishTask(W);};var Y=sap.ui.getVersionInfo({async:n,failOnError:false});if(Y instanceof Promise){Y.then(X,function(v){l.error("Unexpected error when loading \"sap-ui-version.json\": "+v);Q.finishTask(W);});}else{X(Y);}}var Z=this.oConfiguration["xx-bootTask"];if(Z){var a1=Q.startTask("custom boot task");Z(function(v){Q.finishTask(a1,typeof v==="undefined"||v===true);});}this._polyfillFlexbox();var b1=Q.startTask("bootstrap script");this.boot=function(){if(this.bBooted){return;}this.bBooted=true;Q.finishTask(b1);};if(p==="sync"||p==="async"){var c1=m.reduce(function(v,k1){var l1=k1.search(/\.library$/);if(l1>=0){v.push(k1.slice(0,l1));}return v;},[]);var d1=this.loadLibraries(c1,{async:n,preloadOnly:true});if(n){var e1=Q.startTask("preload bootstrap libraries");d1.then(function(){Q.finishTask(e1);},function(){Q.finishTask(e1,false);});}}var f1=this.oConfiguration.getAppCacheBuster();if(f1&&f1.length>0){var g1=sap.ui.requireSync('sap/ui/core/AppCacheBuster');g1.boot(Q);}if(this.oConfiguration.getSupportMode()!==null){var h1=Q.startTask("support info script");var i1=function(v){v.initSupportRules(b.oConfiguration.getSupportMode());Q.finishTask(h1);};var j1=function(v){v.initializeSupportMode(b.oConfiguration.getSupportMode(),n);if(n){sap.ui.require(["sap/ui/support/Bootstrap"],i1);}else{i1(sap.ui.requireSync("sap/ui/support/Bootstrap"));}};if(n){sap.ui.require(["sap/ui/core/support/Support"],j1);}else{j1(sap.ui.requireSync("sap/ui/core/support/Support"));}}Q.finishTask(V);},metadata:{publicMethods:["boot","isInitialized","isThemeApplied","attachInitEvent","attachInit","getRenderManager","createRenderManager","getConfiguration","setRoot","createUIArea","getUIArea","getUIDirty","getElementById","getCurrentFocusedControlId","getControl","getComponent","getTemplate","lock","unlock","isLocked","attachEvent","detachEvent","applyChanges","getEventBus","applyTheme","setThemeRoot","attachThemeChanged","detachThemeChanged","getStaticAreaRef","attachThemeScopingChanged","detachThemeScopingChanged","fireThemeScopingChanged","notifyContentDensityChanged","registerPlugin","unregisterPlugin","getLibraryResourceBundle","byId","getLoadedLibraries","loadLibrary","loadLibraries","initLibrary","includeLibraryTheme","setModel","getModel","hasModel","isMobile","attachControlEvent","detachControlEvent","attachIntervalTimer","detachIntervalTimer","attachParseError","detachParseError","fireParseError","attachValidationError","detachValidationError","fireValidationError","attachFormatError","detachFormatError","fireFormatError","attachValidationSuccess","detachValidationSuccess","fireValidationSuccess","attachLocalizationChanged","detachLocalizationChanged","attachLibraryChanged","detachLibraryChanged","isStaticAreaRef","createComponent","getRootComponent","getApplication","setMessageManager","getMessageManager","byFieldGroupId","addPrerenderingTask"]}});u.M_EVENTS={ControlEvent:"ControlEvent",UIUpdated:"UIUpdated",ThemeChanged:"ThemeChanged",ThemeScopingChanged:"themeScopingChanged",LocalizationChanged:"localizationChanged",LibraryChanged:"libraryChanged",ValidationError:"validationError",ParseError:"parseError",FormatError:"formatError",ValidationSuccess:"validationSuccess"};var S="sap-ui-static";u.prototype._grantFriendAccess=function(){var b=this;h.prototype.register=function(m){b.registerElementClass(m);};g.prototype.register=function(){b.registerElement(this);};g.prototype.deregister=function(){b.deregisterElement(this);};g._updateFocusInfo=function(e){if(b.oFocusHandler){b.oFocusHandler.updateControlFocusInfo(e);}};C.prototype.register=function(){b.registerObject(this);};C.prototype.deregister=function(){var e=this.sId;for(var i in b.mElements){var o=b.mElements[i];if(o._sapui_candidateForDestroy&&o._sOwnerId===e&&!o.getParent()){q.sap.log.debug("destroying dangling template "+o+" when destroying the owner component");o.destroy();}}b.deregisterObject(this);};};u.prototype._setupThemes=function(){var l=q.sap.log,b="sap.ui.core.Core";var o=window["sap-ui-config"];if(this.oConfiguration.themeRoot){o=o||{};o.themeroots=o.themeroots||{};o.themeroots[this.oConfiguration.getTheme()]=this.oConfiguration.themeRoot;}if(o){if(o.themeroots){for(var e in o.themeroots){var i=o.themeroots[e];if(typeof i==="string"){this.setThemeRoot(e,i);}else{for(var m in i){if(m.length>0){this.setThemeRoot(e,[m],i[m]);}else{this.setThemeRoot(e,i[m]);}}}}}}this.sTheme=this.oConfiguration.getTheme();q(document.documentElement).addClass("sapUiTheme-"+this.sTheme);l.info("Declared theme "+this.sTheme,null,b);};u.prototype._setupContentDirection=function(){var l=q.sap.log,b="sap.ui.core.Core",e=this.oConfiguration.getRTL()?"rtl":"ltr";q(document.documentElement).attr("dir",e);l.info("Content direction set to '"+e+"'",null,b);};u.prototype._setupBrowser=function($){var l=q.sap.log,e="sap.ui.core.Core";$=$||q("html");var b=D.browser;var i=b.name;if(i===b.BROWSER.CHROME){q.browser.safari=false;q.browser.chrome=true;}else if(i===b.BROWSER.SAFARI){q.browser.safari=true;q.browser.chrome=false;if(b.mobile){i="m"+i;}}if(i){q.browser.fVersion=b.version;q.browser.mobile=b.mobile;i=i+(b.version===-1?"":Math.floor(b.version));$.attr("data-sap-ui-browser",i);l.debug("Browser-Id: "+i,null,e);}};u.prototype._setupOS=function($){$=$||q("html");$.attr("data-sap-ui-os",D.os.name+D.os.versionStr);var o=null;switch(D.os.name){case D.os.OS.IOS:o="sap-ios";break;case D.os.OS.ANDROID:o="sap-android";break;case D.os.OS.BLACKBERRY:o="sap-bb";break;case D.os.OS.WINDOWS_PHONE:o="sap-winphone";break;}if(o){$.addClass(o);}};u.prototype._setupLang=function($){$=$||q("html");var b=function(){var l=this.oConfiguration.getLocale();if(l){$.attr("lang",l.toString());}else{$.removeAttr("lang");}};b.call(this);this.attachLocalizationChanged(b,this);};u.prototype._setupAnimation=function($){if(this.oConfiguration){$=$||q("html");var b=this.oConfiguration.getAnimation();$.attr("data-sap-ui-animation",b?"on":"off");q.fx.off=!b;var e=this.oConfiguration.getAnimationMode();$.attr("data-sap-ui-animation-mode",e);}};u.prototype._polyfillFlexbox=function(){var b=new q.sap.Version(this.oConfiguration.getCompatibilityVersion("flexBoxPolyfill"));if(b.compareTo("1.16")>=0){q.support.useFlexBoxPolyfill=false;}else if(!q.support.flexBoxLayout&&!q.support.newFlexBoxLayout&&!q.support.ie10FlexBoxLayout){q.support.useFlexBoxPolyfill=true;}else{q.support.useFlexBoxPolyfill=false;}};u.prototype._boot=function(b,e){var i=this.oConfiguration['preloadLibCss'];if(i&&i.length>0&&!i.appManaged){this.includeLibraryTheme("sap-ui-merged",undefined,"?l="+i.join(","));}if(b){return this._requireModulesAsync().then(function(){e();});}var l=this;this.oConfiguration.modules.forEach(function(n){var m=n.match(/^(.*)\.library$/);if(m){l.loadLibrary(m[1]);}else{q.sap.require(n);}});e();};u.prototype._requireModulesAsync=function(){var l=[],b=[];this.oConfiguration.modules.forEach(function(e){var m=e.match(/^(.*)\.library$/);if(m){l.push(m[1]);}else{b.push(q.sap.getResourceName(e,""));}});return Promise.all([this.loadLibraries(l),new Promise(function(e){sap.ui.require(b,function(){e(Array.prototype.slice.call(arguments));});})]);};u.prototype.applyTheme=function(b,e){b=this.oConfiguration._normalizeTheme(b,e);if(e){this.setThemeRoot(b,e);}if(b&&this.sTheme!=b){var i=this.sTheme;this._updateThemeUrls(b,true);this.sTheme=b;this.oConfiguration._setTheme(b);q(document.documentElement).removeClass("sapUiTheme-"+i).addClass("sapUiTheme-"+b);if(this.oThemeCheck){this.oThemeCheck.fireThemeChangedEvent(false);}}};u.prototype._updateThemeUrl=function(l,b,e){var i=l.id.slice(13),Q=l.href.search(/[?#]/),m,n,o="library",p=this.oConfiguration.getRTL()?"-RTL":"",v,N;if(Q>-1){m=l.href.substring(0,Q);n=l.href.substring(Q);}else{m=l.href;n="";}m=m.substring(m.lastIndexOf("/")+1);if((N=i.indexOf("-["))>0){o+=i.slice(N+2,-1);i=i.slice(0,N);}if(m===(o+".css")||m===(o+"-RTL.css")){m=o+p+".css";}v=this._getThemePath(i,b)+m+n;if(v!=l.href){if(e){l.setAttribute("data-sap-ui-foucmarker",l.id);}q.sap.includeStyleSheet(v,l.id);}};u.prototype._updateThemeUrls=function(b,e){var i=this;q("link[id^=sap-ui-theme-]").each(function(){i._updateThemeUrl(this,b,e);});};u.prototype._ensureThemeRoot=function(l,b){if(this._mThemeRoots){var p=this._mThemeRoots[b+" "+l]||this._mThemeRoots[b];if(p){p=p+l.replace(/\./g,"/")+"/themes/"+b+"/";q.sap.registerModulePath(l+".themes."+b,p);}}};u.prototype._getThemePath=function(l,b){this._ensureThemeRoot(l,b);return q.sap.getModulePath(l+".themes."+b,"/");};u.prototype.setThemeRoot=function(b,l,e){if(!this._mThemeRoots){this._mThemeRoots={};}if(e===undefined){e=l;l=undefined;}e=e+(e.slice(-1)=="/"?"":"/");if(l){for(var i=0;i<l.length;i++){var m=l[i];this._mThemeRoots[b+" "+m]=e;}}else{this._mThemeRoots[b]=e;}return this;};u.prototype.init=function(){if(this.bInitialized){return;}var l=q.sap.log,b="sap.ui.core.Core.init()";this.boot();l.info("Initializing",null,b);this.oFocusHandler=new F(document.body,this);this.oRenderManager._setFocusHandler(this.oFocusHandler);this.oResizeHandler=new j(this);this.oThemeCheck=new T(this);l.info("Initialized",null,b);q.sap.measure.end("coreInit");this.bInitialized=true;l.info("Starting Plugins",null,b);this.startPlugins();l.info("Plugins started",null,b);this._createUIAreas();this.oThemeCheck.fireThemeChangedEvent(true);this._executeOnInit();this._setupRootComponent();this._setBodyAccessibilityRole();this._executeInitListeners();if(this.isThemeApplied()||!this.oConfiguration['xx-waitForTheme']){this.renderPendingUIUpdates("during Core init");}else{s.debug("delay initial rendering until theme has been loaded");_.attachEventOnce(u.M_EVENTS.ThemeChanged,function(){setTimeout(this.renderPendingUIUpdates.bind(this,"after theme has been loaded"),D.browser.safari?50:0);},this);}q.sap.measure.end("coreComplete");};u.prototype._createUIAreas=function(){var o=this.oConfiguration;if(o.areas){for(var i=0,l=o.areas.length;i<l;i++){this.createUIArea(o.areas[i]);}o.areas=undefined;}};u.prototype._executeOnInit=function(){var o=this.oConfiguration.onInit;if(o){if(typeof o==="function"){o();}else if(typeof o==="string"){var b=/^module\:((?:(?:[_$a-zA-Z][_$a-zA-Z0-9]*)\/?)*)$/.exec(o);if(b&&b[1]){setTimeout(sap.ui.require.bind(sap.ui,[b[1]]),0);}else{var e=q.sap.getObject(o);if(typeof e==="function"){e();}else{q.sap.globalEval(o);}}}this.oConfiguration.onInit=undefined;}};u.prototype._setupRootComponent=function(){var l=q.sap.log,b="sap.ui.core.Core.init()",o=this.oConfiguration;var e=o.getRootComponent();if(e){l.info("Loading Root Component: "+e,null,b);var i=sap.ui.component({name:e});this.oRootComponent=i;var m=o["xx-rootComponentNode"];if(m&&r(i,'sap/ui/core/UIComponent')){var n=q.sap.domById(m);if(n){l.info("Creating ComponentContainer for Root Component: "+e,null,b);var p=sap.ui.requireSync('sap/ui/core/ComponentContainer'),v=new p({component:i,propagateModel:true});v.placeAt(n);}}}else{var N=o.getApplication();if(N){l.warning("The configuration 'application' is deprecated. Please use the configuration 'component' instead! Please migrate from sap.ui.app.Application to sap.ui.core.Component.");l.info("Loading Application: "+N,null,b);q.sap.require(N);var O=q.sap.getObject(N);var P=new O();}}};u.prototype._setBodyAccessibilityRole=function(){var o=this.oConfiguration;var $=q("body");if(o.getAccessibility()&&o.getAutoAriaBodyRole()&&!$.attr("role")){$.attr("role","application");}};u.prototype._executeInitListeners=function(){var l=q.sap.log,b="sap.ui.core.Core.init()";var e=this.aInitListeners;this.aInitListeners=undefined;if(e&&e.length>0){l.info("Fire Loaded Event",null,b);e.forEach(function(i){i();});}};u.prototype.isInitialized=function(){return this.bInitialized;};u.prototype.isThemeApplied=function(){return T.themeLoaded;};u.prototype.attachInitEvent=function(b){if(this.aInitListeners){this.aInitListeners.push(b);}};u.prototype.attachInit=function(b){if(this.aInitListeners){this.aInitListeners.push(b);}else{b();}};u.prototype.lock=function(){this.bLocked=true;};u.prototype.unlock=function(){this.bLocked=false;};u.prototype.isLocked=function(){return this.bLocked;};u.prototype.getConfiguration=function(){return this.oConfiguration;};u.prototype.getRenderManager=function(){return this.createRenderManager();};u.prototype.createRenderManager=function(){var o=new R();o._setFocusHandler(this.oFocusHandler);return o.getInterface();};u.prototype.getCurrentFocusedControlId=function(){if(!this.isInitialized()){throw new Error("Core must be initialized");}return this.oFocusHandler.getCurrentFocusedControlId();};var w={};function x(l){var b='both';if(typeof l==='object'){if(l.json===true){b='json';}else if(l.json===false){b='js';}l=l.name;}var e=w[l]||w['']||'both';if(e==='both'){e=b;}else if(e!==b&&b!=='both'){e='none';}return{name:l,fileType:e};}function y(l){var b=this;l=x(l);var i=l.name,m=l.fileType,n=i.replace(/\./g,'/'),o=this.oConfiguration.getDepCache();if(m==='none'||q.sap.isResourceLoaded(n+'/library.js')){return Promise.resolve(true);}var v=t[i]||(t[i]={});if(v.promise){return v.promise;}v.pending=true;v.async=true;var p;if(m!=='json'){var P=n+(o?'/library-h2-preload.js':'/library-preload.js');p=q.sap._loadJSResourceAsync(P).then(function(){return A(i);},function(e){if(m!=='js'){q.sap.log.error("failed to load '"+P+"' ("+(e&&e.message||e)+"), falling back to library-preload.json");return H(i);}});}else{p=H(i);}v.promise=p.then(function(e){var N=[],O=z(i);if(e&&e.length){N=e.map(y.bind(b));}if(O&&q.sap.Version(O._version).compareTo("1.9.0")>=0){N.push(b.getLibraryResourceBundle(i,true));}return Promise.all(N).then(function(){v.pending=false;});});return v.promise;}function z(l){var m=l.replace(/\./g,'/')+'/manifest.json';if(q.sap.isResourceLoaded(m)){return q.sap.loadResource(m,{dataType:'json',async:false,failOnError:false});}}function A(l){var m=z(l);var b=m&&m["sap.ui5"]&&m["sap.ui5"].dependencies&&m["sap.ui5"].dependencies.libs;if(b){return Object.keys(b).reduce(function(e,i){if(!b[i].lazy){e.push(i);}return e;},[]);}}function H(l){var b=q.sap.getModulePath(l+".library-preload",".json");return Promise.resolve(q.ajax({dataType:"json",url:b})).then(function(e){if(e){e.url=b;q.sap.registerPreloadedModules(e);var i=e.dependencies;if(Array.isArray(i)){i=i.map(function(m){return m.replace(/\.library-preload$/,'');});}return i;}},function(e,i,m){q.sap.log.error("failed to load '"+b+"': "+(m||i));});}function J(l){l=x(l);var b=l.name,i=l.fileType,m=b.replace(/\./g,'/');if(i==='none'||q.sap.isResourceLoaded(m+'/library.js')){return;}var n=t[b]||(t[b]={});if(n.pending===false){return;}if(n.pending){if(n.async){q.sap.log.warning("request to load "+b+" synchronously while async loading is pending; this causes a duplicate request and should be avoided by caller");}else{q.sap.log.warning("request to load "+b+" synchronously while sync loading is pending (cycle, ignored)");return;}}n.pending=true;n.async=false;var o;n.promise=new Promise(function(v,N){o=v;});var p;if(i!=='json'){var P=m+'/library-preload';try{sap.ui.requireSync(P);p=A(b);}catch(e){q.sap.log.error("failed to load '"+P+"' ("+(e&&e.message||e)+")");if(e&&e.loadError&&i!=='js'){p=K(b);}}}else{p=K(b);}if(p&&p.length){p.forEach(J);}n.pending=false;o();}function K(l){var b=q.sap.getModulePath(l+".library-preload",".json");var e;q.ajax({dataType:"json",async:false,url:b,success:function(i){if(i){i.url=b;q.sap.registerPreloadedModules(i);e=i.dependencies;}},error:function(i,m,n){q.sap.log.error("failed to load '"+b+"': "+(n||m));}});if(Array.isArray(e)){e=e.map(function(i){return i.replace(/\.library-preload$/,'');});}return e;}u.prototype.loadLibrary=function(l,v){if(typeof v==='boolean'){v={async:v};}if(typeof v==='object'){if(v.async){if(v.url&&t[l]==null){q.sap.registerModulePath(l,v.url);}return this.loadLibraries([l]);}v=v.url;}if(!L[l]){var m=l+".library";if(v){q.sap.registerModulePath(l,v);}if(this.oConfiguration.preload==='sync'||this.oConfiguration.preload==='async'){J(l);}q.sap.require(m);if(!L[l]){q.sap.log.warning("library "+l+" didn't initialize itself");this.initLibrary(l);}if(this.oThemeCheck&&this.isInitialized()){this.oThemeCheck.fireThemeChangedEvent(true);}}return this.mLibraries[l];};u.prototype.loadLibraries=function(l,o){o=q.extend({async:true,preloadOnly:false},o);var b=this,p=this.oConfiguration.preload==='sync'||this.oConfiguration.preload==='async',e=o.async,i=!o.preloadOnly;function m(){return l.map(function(P){if(typeof P==='object'){P=P.name;}return P.replace(/\./g,"/")+"/library";});}function n(){if(b.oThemeCheck&&b.isInitialized()){b.oThemeCheck.fireThemeChangedEvent(true);}}function v(){return new Promise(function(P,Q){sap.ui.require(m(),function(){n();P();});});}function N(){m().forEach(sap.ui.requireSync);n();}if(e){var O=p?Promise.all(l.map(y.bind(this))):Promise.resolve(true);return i?O.then(v):O;}else{if(p){l.forEach(J);}if(i){N();}}};u.prototype.createComponent=function(v,b,i,m){if(typeof v==="string"){v={name:v,url:b};if(typeof i==="object"){v.settings=i;}else{v.id=i;v.settings=m;}}return sap.ui.component(v);};u.prototype.getRootComponent=function(){return this.oRootComponent;};u.prototype.initLibrary=function(l){var b=typeof l==='string';if(b){l={name:l};}var e=l.name,m=q.sap.log,n="sap.ui.core.Core.initLibrary()";if(b){m.error("[Deprecated] library "+e+" uses old fashioned initLibrary() call (rebuild with newest generator)");}if(!e||L[e]){return;}m.debug("Analyzing Library "+e,null,n);L[e]=true;function o(N,O){var P,V;for(P in O){V=O[P];if(V!==undefined){if(Array.isArray(N[P])){if(N[P].length===0){N[P]=V;}else{N[P]=q.sap.unique(N[P].concat(V));}}else if(N[P]===undefined){N[P]=V;}else if(P!="name"){q.sap.log.warning("library info setting ignored: "+P+"="+V);}}}return N;}q.sap.getObject(e,0);this.mLibraries[e]=l=o(this.mLibraries[e]||{name:e,dependencies:[],types:[],interfaces:[],controls:[],elements:[]},l);for(var i=0;i<l.dependencies.length;i++){var p=l.dependencies[i];m.debug("resolve Dependencies to "+p,null,n);if(L[p]!==true){m.warning("Dependency from "+e+" to "+p+" has not been resolved by library itself",null,n);this.loadLibrary(p);}}a.registerInterfaceTypes(l.interfaces);for(var i=0;i<l.types.length;i++){if(!/^(any|boolean|float|int|string|object|void)$/.test(l.types[i])){q.sap.declare(l.types[i]);}}var v=l.controls.concat(l.elements);for(var i=0;i<v.length;i++){sap.ui.lazyRequire(v[i],"new extend getMetadata");}if(!l.noLibraryCSS){this._ensureThemeRoot(e,this.sTheme);this._ensureThemeRoot(e,"base");if(this.oConfiguration['preloadLibCss'].indexOf(e)<0){var Q=this._getLibraryCssQueryParams(l);this.includeLibraryTheme(e,undefined,Q);}}l.sName=l.name;l.aControls=l.controls;this.fireLibraryChanged({name:e,stereotype:"library",operation:"add",metadata:l});};u.prototype.includeLibraryTheme=function(l,v,Q){if((l!="sap.ui.legacy")&&(l!="sap.ui.classic")){if(!v){v="";}var b=(this.oConfiguration.getRTL()?"-RTL":"");var e,i=l+(v.length>0?"-["+v+"]":v);if(l&&l.indexOf(":")==-1){e="library"+v+b;}else{e=l.substring(l.indexOf(":")+1)+v;l=l.substring(0,l.indexOf(":"));}var m="sap-ui-theme-"+i,o=document.getElementById(m);if(o){o.setAttribute("data-sap-ui-foucmarker",m);}var n=this._getThemePath(l,this.sTheme)+e+".css"+(Q?Q:"");q.sap.log.info("Including "+n+" -  sap.ui.core.Core.includeLibraryTheme()");q.sap.includeStyleSheet(n,m);var P=sap.ui.require("sap/ui/core/theming/Parameters");if(P){P._addLibraryTheme(i);}}};u.prototype._getLibraryCssQueryParams=function(l){var Q;if(this.oConfiguration["versionedLibCss"]&&l){Q="?version="+l.version;if(G.versioninfo){Q+="&sap-ui-dist-version="+G.versioninfo.version;}}return Q;};u.prototype.getLoadedLibraries=function(){return q.extend({},this.mLibraries);};u.prototype.getLibraryResourceBundle=function(l,b,e){var m,i,v,n;if(typeof l==="boolean"){e=l;l=undefined;b=undefined;}if(typeof b==="boolean"){e=b;b=undefined;}l=l||"sap.ui.core";b=b||this.getConfiguration().getLanguage();i=l+"/"+b;v=this.mResourceBundles[i];if(!v||(!e&&v instanceof Promise)){m=z(l);if(m&&q.sap.Version(m._version).compareTo("1.9.0")>=0){n=m["sap.ui5"]&&m["sap.ui5"].library&&m["sap.ui5"].library.i18n;}if(n!==false){v=q.sap.resources({url:sap.ui.resource(l,typeof n==="string"?n:'messagebundle.properties'),locale:b,async:e});if(v instanceof Promise){v=v.then(function(o){this.mResourceBundles[i]=o;return o;}.bind(this));}this.mResourceBundles[i]=v;}}return e?Promise.resolve(v):v;};u.prototype.setRoot=function(o,b){if(b){b.placeAt(o,"only");}};u.prototype.createUIArea=function(o){var b=this;if(!o){throw new Error("oDomRef must not be null");}if(typeof(o)==="string"){var i=o;if(i==S){o=this.getStaticAreaRef();}else{o=q.sap.domById(o);if(!o){throw new Error("DOM element with ID '"+i+"' not found in page, but application tries to insert content.");}}}if(!o.id||o.id.length==0){o.id=q.sap.uid();}var e=o.id;if(!this.mUIAreas[e]){this.mUIAreas[e]=new U(this,o);if(!q.isEmptyObject(this.oModels)){var p={oModels:q.extend({},this.oModels),oBindingContexts:{},aPropagationListeners:[]};b.mUIAreas[e]._propagateProperties(true,b.mUIAreas[e],p,true);}}else{this.mUIAreas[e].setRootNode(o);}return this.mUIAreas[e];};u.prototype.getUIArea=function(o){var i="";if(typeof(o)=="string"){i=o;}else{i=o.id;}if(i){return this.mUIAreas[i];}return null;};u.prototype.addInvalidatedUIArea=function(o){if(!this._sRerenderTimer){s.debug("Registering timer for delayed re-rendering");this._sRerenderTimer=q.sap.delayedCall(0,this,"renderPendingUIUpdates");}};u.MAX_RENDERING_ITERATIONS=20;u.prototype.renderPendingUIUpdates=function(b){s.debug("Render pending UI updates: start ("+(b||"by timer")+")");q.sap.measure.start("renderPendingUIUpdates","Render pending UI updates in all UIAreas");var e=false,l=u.MAX_RENDERING_ITERATIONS>0,i=0;this._bRendering=true;do{if(l){i++;if(i>u.MAX_RENDERING_ITERATIONS){this._bRendering=false;throw new Error("Rendering has been re-started too many times ("+i+"). Add URL parameter sap-ui-xx-debugRendering=true for a detailed analysis.");}if(i>1){s.debug("Render pending UI updates: iteration "+i);}}if(this._sRerenderTimer){if(this._sRerenderTimer!==this){q.sap.clearDelayedCall(this._sRerenderTimer);}this._sRerenderTimer=undefined;}this.runPrerenderingTasks();var m=this.mUIAreas;for(var n in m){e=m[n].rerender()||e;}}while(l&&this._sRerenderTimer);this._bRendering=false;if(e){this.fireUIUpdated();}s.debug("Render pending UI updates: finished");q.sap.measure.end("renderPendingUIUpdates");};u.prototype.getUIDirty=function(){return!!(this._sRerenderTimer||this._bRendering);};u.prototype.attachUIUpdated=function(b,l){_.attachEvent(u.M_EVENTS.UIUpdated,b,l);};u.prototype.detachUIUpdated=function(b,l){_.detachEvent(u.M_EVENTS.UIUpdated,b,l);};u.prototype.fireUIUpdated=function(p){_.fireEvent(u.M_EVENTS.UIUpdated,p);};u.prototype.notifyContentDensityChanged=function(){this.fireThemeChanged();};u.prototype.attachThemeChanged=function(b,l){_.attachEvent(u.M_EVENTS.ThemeChanged,b,l);};u.prototype.detachThemeChanged=function(b,l){_.detachEvent(u.M_EVENTS.ThemeChanged,b,l);};u.prototype.fireThemeChanged=function(p){q.sap.scrollbarSize(true);var P=sap.ui.require("sap/ui/core/theming/Parameters");if(P){P.reset(true);}p=p||{};if(!p.theme){p.theme=this.getConfiguration().getTheme();}var e=u.M_EVENTS.ThemeChanged;var o=q.Event(e);o.theme=p.theme;q.each(this.mElements,function(i,b){b._handleEvent(o);});q.sap.act.refresh();_.fireEvent(e,p);};u.prototype.attachThemeScopingChanged=function(b,l){_.attachEvent(u.M_EVENTS.ThemeScopingChanged,b,l);};u.prototype.detachThemeScopingChanged=function(b,l){_.detachEvent(u.M_EVENTS.ThemeScopingChanged,b,l);};u.prototype.fireThemeScopingChanged=function(p){_.fireEvent(u.M_EVENTS.ThemeScopingChanged,p);};u.prototype.attachLocalizationChanged=function(b,l){_.attachEvent(u.M_EVENTS.LocalizationChanged,b,l);};u.prototype.detachLocalizationChanged=function(b,l){_.detachEvent(u.M_EVENTS.LocalizationChanged,b,l);};u.prototype.fireLocalizationChanged=function(m){var e=u.M_EVENTS.LocalizationChanged,b=q.Event(e,{changes:m}),i=M._handleLocalizationChange;q.sap.log.info("localization settings changed: "+Object.keys(m).join(","),null,"sap.ui.core.Core");q.each(this.oModels,function(N,o){if(o&&o._handleLocalizationChange){o._handleLocalizationChange();}});function n(p){q.each(this.mUIAreas,function(){i.call(this,p);});q.each(this.mObjects["component"],function(){i.call(this,p);});q.each(this.mElements,function(){i.call(this,p);});}n.call(this,1);n.call(this,2);if(m.rtl!=undefined){q(document.documentElement).attr("dir",m.rtl?"rtl":"ltr");this._updateThemeUrls(this.sTheme);q.each(this.mUIAreas,function(){this.invalidate();});q.sap.log.info("RTL mode "+m.rtl?"activated":"deactivated");}q.each(this.mElements,function(l,o){this._handleEvent(b);});_.fireEvent(e,{changes:m});};u.prototype.attachLibraryChanged=function(b,l){_.attachEvent(u.M_EVENTS.LibraryChanged,b,l);};u.prototype.detachLibraryChanged=function(b,l){_.detachEvent(u.M_EVENTS.LibraryChanged,b,l);};u.prototype.fireLibraryChanged=function(p){_.fireEvent(u.M_EVENTS.LibraryChanged,p);};u.prototype.applyChanges=function(){this.renderPendingUIUpdates("forced by applyChanges");};u.prototype.registerElementClass=function(m){var n=m.getName(),l=m.getLibraryName()||"",o=this.mLibraries[l],b=f.prototype.isPrototypeOf(m.getClass().prototype)?'controls':'elements';if(!o){q.sap.getObject(l,0);o=this.mLibraries[l]={name:l,dependencies:[],types:[],interfaces:[],controls:[],elements:[]};}if(o[b].indexOf(n)<0){o[b].push(n);q.sap.log.debug("Class "+m.getName()+" registered for library "+m.getLibraryName());this.fireLibraryChanged({name:m.getName(),stereotype:m.getStereotype(),operation:"add",metadata:m});}};u.prototype.registerElement=function(e){var i=e.getId(),o=this.mElements[i];if(o&&o!==e){if(o._sapui_candidateForDestroy){q.sap.log.debug("destroying dangling template "+o+" when creating new object with same ID");o.destroy();}else{if(this.oConfiguration.getNoDuplicateIds()){q.sap.log.error("adding element with duplicate id '"+i+"'");throw new Error("Error: adding element with duplicate id '"+i+"'");}else{q.sap.log.warning("adding element with duplicate id '"+i+"'");}}}this.mElements[i]=e;};u.prototype.deregisterElement=function(e){delete this.mElements[e.getId()];};u.prototype.registerObject=function(o){var i=o.getId(),b=o.getMetadata().getStereotype(),e=this.getObject(b,i);if(e&&e!==o){q.sap.log.error("adding object \""+b+"\" with duplicate id '"+i+"'");throw new Error("Error: adding object \""+b+"\" with duplicate id '"+i+"'");}this.mObjects[b][i]=o;};u.prototype.deregisterObject=function(o){var i=o.getId(),b=o.getMetadata().getStereotype();delete this.mObjects[b][i];};u.prototype.byId=function(i){return i==null?undefined:this.mElements[i];};u.prototype.getControl=u.prototype.byId;u.prototype.getElementById=u.prototype.byId;u.prototype.getObject=function(b,i){return i==null?undefined:this.mObjects[b]&&this.mObjects[b][i];};u.prototype.getComponent=function(i){return this.getObject("component",i);};u.prototype.getTemplate=function(i){var b=sap.ui.requireSync('sap/ui/core/tmpl/Template');return b.byId(i);};u.prototype.getStaticAreaRef=function(){var o=q.sap.domById(S);if(!o){if(!this.bDomReady){throw new Error("DOM is not ready yet. Static UIArea cannot be created.");}var b={id:S};if(q("body").attr("role")!="application"){b.role="application";}var l=this.getConfiguration().getRTL()?"right":"left";o=q("<DIV/>",b).css({"height":"0","width":"0","overflow":"hidden","float":l}).prependTo(document.body)[0];this.createUIArea(o).bInitial=false;}return o;};u.prototype.isStaticAreaRef=function(o){return o&&(o.id===S);};u._I_INTERVAL=200;j.prototype.I_INTERVAL=u._I_INTERVAL;u.prototype.attachIntervalTimer=function(b,l){if(!this.oTimedTrigger){var e=sap.ui.requireSync("sap/ui/core/IntervalTrigger");this.oTimedTrigger=new e(u._I_INTERVAL);}this.oTimedTrigger.addListener(b,l);};u.prototype.detachIntervalTimer=function(b,l){if(this.oTimedTrigger){this.oTimedTrigger.removeListener(b,l);}};u.prototype.attachControlEvent=function(b,l){_.attachEvent(u.M_EVENTS.ControlEvent,b,l);};u.prototype.detachControlEvent=function(b,l){_.detachEvent(u.M_EVENTS.ControlEvent,b,l);};u.prototype.fireControlEvent=function(p){_.fireEvent(u.M_EVENTS.ControlEvent,p);};u.prototype._handleControlEvent=function(e,b){var o=q.Event(e.type);q.extend(o,e);o.originalEvent=undefined;this.fireControlEvent({"browserEvent":o,"uiArea":b});};u.prototype.getApplication=function(){return sap.ui.getApplication&&sap.ui.getApplication();};u.prototype.registerPlugin=function(p){if(!p){return;}for(var i=0,l=this.aPlugins.length;i<l;i++){if(this.aPlugins[i]===p){return;}}this.aPlugins.push(p);if(this.bInitialized&&p&&p.startPlugin){p.startPlugin(this);}};u.prototype.unregisterPlugin=function(p){if(!p){return;}var P=-1;for(var i=this.aPlugins.length;i--;i>=0){if(this.aPlugins[i]===p){P=i;break;}}if(P==-1){return;}if(this.bInitialized&&p&&p.stopPlugin){p.stopPlugin(this);}this.aPlugins.splice(P,1);};u.prototype.startPlugins=function(){for(var i=0,l=this.aPlugins.length;i<l;i++){var p=this.aPlugins[i];if(p&&p.startPlugin){p.startPlugin(this,true);}}};u.prototype.stopPlugins=function(){for(var i=0,l=this.aPlugins.length;i<l;i++){var p=this.aPlugins[i];if(p&&p.stopPlugin){p.stopPlugin(this);}}};u.prototype.setModel=function(m,n){var b=this,p;if(!m&&this.oModels[n]){delete this.oModels[n];if(q.isEmptyObject(b.oModels)&&q.isEmptyObject(b.oBindingContexts)){p=M._oEmptyPropagatedProperties;}else{p={oModels:q.extend({},b.oModels),oBindingContexts:{},aPropagationListeners:[]};}q.each(this.mUIAreas,function(i,o){if(m!=o.getModel(n)){o._propagateProperties(n,o,p,false,n);}});}else if(m&&m!==this.oModels[n]){this.oModels[n]=m;q.each(this.mUIAreas,function(i,o){if(m!=o.getModel(n)){var p={oModels:q.extend({},b.oModels),oBindingContexts:{},aPropagationListeners:[]};o._propagateProperties(n,o,p,false,n);}});}return this;};u.prototype.setMessageManager=function(m){this.oMessageManager=m;};u.prototype.getMessageManager=function(){if(!this.oMessageManager){this.oMessageManager=new k();}return this.oMessageManager;};u.prototype.byFieldGroupId=function(v){var b=[];for(var n in this.mElements){var e=this.mElements[n];if(e instanceof f&&e.checkFieldGroupIds(v)){b.push(e);}}return b;};u.prototype.getModel=function(n){return this.oModels[n];};u.prototype.hasModel=function(){return!q.isEmptyObject(this.oModels);};u.prototype.getEventBus=function(){if(!this.oEventBus){var b=sap.ui.requireSync('sap/ui/core/EventBus');var e=this.oEventBus=new b();this._preserveHandler=function(i){e.publish("sap.ui","__preserveContent",{domNode:i.domNode});};R.attachPreserveContent(this._preserveHandler);}return this.oEventBus;};u.prototype.attachValidationError=function(o,b,l){if(typeof(o)==="function"){l=b;b=o;o=undefined;}_.attachEvent(u.M_EVENTS.ValidationError,o,b,l);return this;};u.prototype.detachValidationError=function(b,l){_.detachEvent(u.M_EVENTS.ValidationError,b,l);return this;};u.prototype.attachParseError=function(o,b,l){if(typeof(o)==="function"){l=b;b=o;o=undefined;}_.attachEvent(u.M_EVENTS.ParseError,o,b,l);return this;};u.prototype.detachParseError=function(b,l){_.detachEvent(u.M_EVENTS.ParseError,b,l);return this;};u.prototype.attachFormatError=function(o,b,l){if(typeof(o)==="function"){l=b;b=o;o=undefined;}_.attachEvent(u.M_EVENTS.FormatError,o,b,l);return this;};u.prototype.detachFormatError=function(b,l){_.detachEvent(u.M_EVENTS.FormatError,b,l);return this;};u.prototype.attachValidationSuccess=function(o,b,l){if(typeof(o)==="function"){l=b;b=o;o=undefined;}_.attachEvent(u.M_EVENTS.ValidationSuccess,o,b,l);return this;};u.prototype.detachValidationSuccess=function(b,l){_.detachEvent(u.M_EVENTS.ValidationSuccess,b,l);return this;};u.prototype.fireParseError=function(m){_.fireEvent(u.M_EVENTS.ParseError,m);return this;};u.prototype.fireValidationError=function(m){_.fireEvent(u.M_EVENTS.ValidationError,m);return this;};u.prototype.fireFormatError=function(m){_.fireEvent(u.M_EVENTS.FormatError,m);return this;};u.prototype.fireValidationSuccess=function(m){_.fireEvent(u.M_EVENTS.ValidationSuccess,m);return this;};u.prototype.isMobile=function(){return D.browser.mobile;};u.prototype._getEventProvider=function(){return _;};u.prototype.addPrerenderingTask=function(p,b){if(b){this.aPrerenderingTasks.unshift(p);}else{this.aPrerenderingTasks.push(p);}this.addInvalidatedUIArea();};u.prototype.runPrerenderingTasks=function(){var b=this.aPrerenderingTasks.slice();this.aPrerenderingTasks=[];b.forEach(function(p){p();});};u.prototype.destroy=function(){R.detachPreserveContent(this._preserveHandler);this.oFocusHandler.destroy();_.destroy();c.prototype.destroy.call(this);};sap.ui.setRoot=function(o,b){sap.ui.getCore().setRoot(o,b);};return new u().getInterface();});
