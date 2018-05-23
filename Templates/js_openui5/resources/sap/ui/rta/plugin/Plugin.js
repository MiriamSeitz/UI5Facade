/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/dt/Plugin','sap/ui/fl/Utils','sap/ui/fl/registry/ChangeRegistry','sap/ui/dt/OverlayRegistry','sap/ui/dt/OverlayUtil','sap/ui/dt/ElementOverlay','sap/ui/fl/changeHandler/JsControlTreeModifier'],function(P,F,C,O,a,E,J){"use strict";E.prototype._bElementHasStableId=undefined;E.prototype.getElementHasStableId=function(){return this._bElementHasStableId;};E.prototype.setElementHasStableId=function(h){this._bElementHasStableId=h;};E.prototype.hasElementStableId=function(){return this._bElementHasStableId?true:false;};var B=P.extend("sap.ui.rta.plugin.Plugin",{metadata:{"abstract":true,library:"sap.ui.rta",properties:{commandFactory:{type:"object",multiple:false}},events:{elementModified:{command:{type:"sap.ui.rta.command.BaseCommand"}}}}});B.prototype._isEditable=function(){};var _=function(e){var p=e.getParameters();var r;var o=sap.ui.getCore().byId(p.id);if((p.type==="propertyChanged"&&p.name==="visible")){r=this._getRelevantOverlays(o);this.evaluateEditable(r,{onRegistration:false});}else if(p.type==="overlayRendered"){this.evaluateEditable([o],{onRegistration:true});}else if(p.type==="insertAggregation"||p.type==="removeAggregation"){r=this._getRelevantOverlays(o,p.name);this.evaluateEditable(r,{onRegistration:false});}};B.prototype._detachReevaluationEditable=function(o){o.detachElementModified(_,this);};B.prototype._attachReevaluationEditable=function(o){var g=function(e){if(e.getSource().getGeometry()&&e.getSource().getGeometry().visible){this.evaluateEditable([o],{onRegistration:true});o.detachEvent('geometryChanged',g,this);}};o.attachElementModified(_,this);if(!o.getGeometry()||!o.getGeometry().visible){o.attachEvent('geometryChanged',g,this);}};B.prototype._getRelevantOverlays=function(o,A){var b=o.getRelevantOverlays();if(b.length===0){var r=a.findAllOverlaysInContainer(o);if(A){var c=o.getAggregationOverlay(A).getChildren();c=c.filter(function(d){return r.indexOf(d)===-1;});r=r.concat(c);}o.setRelevantOverlays(r);return r;}return b;};B.prototype.evaluateEditable=function(o,p){var e;o.forEach(function(b){var c=b.getElement();if(c&&a.isInAggregationBinding(b,c.sParentAggregationName)){e=false;}else{e=c&&b.getDesignTimeMetadata()&&this._isEditable(b,p);}if(e!==undefined&&e!==null){if(typeof e==="boolean"){this._modifyPluginList(b,e);}else{this._modifyPluginList(b,e["asChild"],false);this._modifyPluginList(b,e["asSibling"],true);}}}.bind(this));};B.prototype._modifyPluginList=function(o,i,b){if(i){this.addToPluginsList(o,b);}else{this.removeFromPluginsList(o,b);}};B.prototype._retrievePluginName=function(s){var n=this.getMetadata().getName();if(s!==undefined){n+=s?".asSibling":".asChild";}return n;};B.prototype._isEditableByPlugin=function(o,s){var p=this._retrievePluginName(s);var b=o.getEditableByPlugins();return b.indexOf(p)>-1;};B.prototype.registerElementOverlay=function(o){this.evaluateEditable([o],{onRegistration:true});this._attachReevaluationEditable(o);};B.prototype.deregisterElementOverlay=function(o){this.removeFromPluginsList(o);this.removeFromPluginsList(o,true);this.removeFromPluginsList(o,false);this._detachReevaluationEditable(o);};B.prototype.hasStableId=function(o){if(!o){return false;}if(!o.getDesignTimeMetadata()){return false;}if(o.getElementHasStableId()===undefined){var s=false;var e=o.getElement();var d=o.getDesignTimeMetadata();var g=d&&d.getData().getStableElements;if(g){var S=g(e);var u=S?S.some(function(v){var c=v.id||v;if(!F.checkControlId(c,v.appComponent)){return true;}}):true;s=!u;}else{s=F.checkControlId(e);}o.setElementHasStableId(s);}return o.hasElementStableId();};B.prototype.getVariantManagementReference=function(o,A,f,s){var e;if(!s){e=o.getElement();}else{e=s;}var r;if((A.changeOnRelevantContainer||f)&&!s){r=o.getRelevantContainer();}else{r=e;}var v;if(o.getVariantManagement&&this._hasVariantChangeHandler(A.changeType,r)){v=o.getVariantManagement();}return v;};B.prototype._hasVariantChangeHandler=function(c,e){var o=this._getChangeHandler(c,e);return(o&&o.revertChange);};B.prototype.checkAggregationsOnSelf=function(o,A){var d=o.getDesignTimeMetadata();var e=o.getElement();var i=false;var b=d.getActionDataFromAggregations(A,o.getElement())[0];var c=b?b.changeType:null;var f=b&&b.changeOnRelevantContainer;if(f){e=o.getRelevantContainer();}if(c&&this.hasChangeHandler(c,e)){i=true;}return i;};B.prototype.removeFromPluginsList=function(o,s){var n=this._retrievePluginName(s);o.removeEditableByPlugin(n);if(!o.getEditableByPlugins().length){o.setEditable(false);}};B.prototype.addToPluginsList=function(o,s){var n=this._retrievePluginName(s);var p=o.getEditableByPlugins();if(p.indexOf(n)===-1){o.addEditableByPlugin(n);o.setEditable(true);}};B.prototype.hasChangeHandler=function(c,e){return!!this._getChangeHandler(c,e);};B.prototype._getChangeHandler=function(c,e,s){if(!s){s=e.getMetadata().getName();}var l=this.getCommandFactory().getFlexSettings().layer;return C.getInstance().getChangeHandler(c,s,e,J,l);};return B;},true);