/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/rta/plugin/Plugin','sap/ui/dt/OverlayRegistry','sap/ui/rta/Utils'],function(P,O,U){"use strict";var C=P.extend("sap.ui.rta.plugin.Combine",{metadata:{library:"sap.ui.rta",properties:{},associations:{},events:{}}});C.prototype._isEditable=function(o){var c=this.getAction(o);if(c&&c.changeType&&c.changeOnRelevantContainer){return this.hasChangeHandler(c.changeType,o.getRelevantContainer())&&this.hasStableId(o);}else{return false;}};C.prototype._checkForSameRelevantContainer=function(s){var r=[];for(var i=0,n=s.length;i<n;i++){r[i]=s[i].getRelevantContainer();var c=this.getAction(s[i]);if(!c||!c.changeType){return false;}if(i>0){if((r[0]!==r[i])||(this.getAction(s[0]).changeType!==c.changeType)){return false;}}}return true;};C.prototype.isAvailable=function(o){var s=this.getSelectedOverlays();if(s.length<=1){return false;}return(this._isEditableByPlugin(o)&&this._checkForSameRelevantContainer(s));};C.prototype.isEnabled=function(o){var s=this.getSelectedOverlays();if(!this.isAvailable(o)||s.length<=1){return false;}var S=s.map(function(b){return b.getElement();});var a=s.every(function(b){var A=this.getAction(b);if(!A){return false;}if(typeof A.isEnabled!=="undefined"){if(typeof A.isEnabled==="function"){return A.isEnabled(S);}else{return A.isEnabled;}}return true;},this);return a;};C.prototype.handleCombine=function(c){var e=O.getOverlay(c);var d=e.getDesignTimeMetadata();var t=[];var s=this.getSelectedOverlays();for(var i=0;i<s.length;i++){var S=s[i].getElement();t.push(S);}var o=this.getAction(e);var v=this.getVariantManagementReference(e,o);var a=this.getCommandFactory().getCommandFor(c,"combine",{source:c,combineFields:t},d,v);this.fireElementModified({"command":a});};C.prototype.getMenuItems=function(o){return this._getMenuItems(o,{pluginId:"CTX_GROUP_FIELDS",rank:90});};C.prototype.getActionName=function(){return"combine";};C.prototype.handler=function(o,p){this.handleCombine(p.contextElement);};return C;},true);