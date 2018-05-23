/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['jquery.sap.global','./Opa','./Opa5'],function($,O,a){"use strict";QUnit.testDone(function(d){var t=d.assertions.some(function(A){return!A.result&&A.message==="Test timed out";});if(t){O._stopQueue({qunitTimeout:QUnit.config.testTimeout/1000});}});var o=function(t,e,c,b){var d=O.config;if(!QUnit.config.testTimeout||QUnit.config.testTimeout===30000){QUnit.config.testTimeout=90000;}QUnit.config.reorder=false;QUnit.config.scrolltop=false;if(arguments.length===2){c=e;e=null;}if(QUnit.test.length===2&&b===true){throw new Error("Qunit >=2.0 is used, which no longer supports the 'async' parameter for tests.");}var f=function(g){var s=g.async();d.testName=t;O.assert=g;a.assert=g;if(QUnit.test.length===2&&e!==null){g.expect(e);}c.call(this,d.arrangements,d.actions,d.assertions);var p=O.emptyQueue();p.done(function(){O.assert=undefined;a.assert=undefined;s();});p.fail(function(h){g.ok(false,h.errorMessage);O.assert=undefined;a.assert=undefined;if(!h.qunitTimeout){setTimeout(s,0);}});};if(QUnit.test.length===2){return QUnit.test(t,f);}else{return QUnit.test(t,e,f,b);}};window.opaTest=o;QUnit.config.urlConfig.push({id:"opaExecutionDelay",value:{400:"fast",700:"medium",1000:"slow"},label:"Opa speed",tooltip:"Each waitFor will be delayed by a number of milliseconds. If it is not set Opa will execute the tests as fast as possible"});a._getEventProvider().attachEvent('onExtensionAfterInit',function(e){var p=e.getParameters();if(p.extension.getAssertions){var A=p.extension.getAssertions();$.each(A,function(n,f){QUnit.assert[n]=function(){var q=this;var b=f.bind(p.appWindow)(arguments).always(function(r){q.push(r.result,r.actual,r.expected,r.message);});O.config.assertions._schedulePromiseOnFlow(b);};});}});return o;});
