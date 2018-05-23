/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2018 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(['sap/ui/core/InvisibleText','sap/ui/core/Renderer','./InputBaseRenderer','sap/m/library'],function(I,R,a,l){"use strict";var b=l.InputType;var c=R.extend(a);c.addOuterClasses=function(r,C){r.addClass("sapMInput");if(C.getShowValueHelp()&&C.getEnabled()&&C.getEditable()){r.addClass("sapMInputVH");if(C.getValueHelpOnly()){r.addClass("sapMInputVHO");}}if(C.getDescription()){r.addClass("sapMInputDescription");}};c.addOuterStyles=function(r,C){};c.writeInnerAttributes=function(r,C){r.writeAttribute("type",C.getType().toLowerCase());if(C.getType()==b.Number&&sap.ui.getCore().getConfiguration().getRTL()){r.writeAttribute("dir","ltr");r.addStyle("text-align","right");}if(C.getShowSuggestion()){r.writeAttribute("autocomplete","off");}if((!C.getEnabled()&&C.getType()=="Password")||(C.getShowSuggestion()&&C._bUseDialog)||(C.getValueHelpOnly()&&C.getEnabled()&&C.getEditable()&&C.getShowValueHelp())){r.writeAttribute("readonly","readonly");}};c.addInnerClasses=function(r,C){};c.addWrapperStyles=function(r,C){if(C.getDescription()){r.addStyle("width",C.getFieldWidth()||"50%");}};c.writeDecorations=function(r,C){var i=C.getId(),d=C.getDescription();if(!d){this.writeValueHelpIcon(r,C);}else{r.write("<span>");this.writeValueHelpIcon(r,C);r.write('<span id="'+C.getId()+'-Descr" class="sapMInputDescriptionText">');r.writeEscaped(d);r.write("</span></span>");}if(sap.ui.getCore().getConfiguration().getAccessibility()){if(C.getShowSuggestion()&&C.getEnabled()&&C.getEditable()){r.write("<span id=\""+i+"-SuggDescr\" class=\"sapUiPseudoInvisibleText\" role=\"status\" aria-live=\"polite\"></span>");}}};c.writeValueHelpIcon=function(r,C){if(C.getShowValueHelp()&&C.getEnabled()&&C.getEditable()){r.write('<div class="sapMInputValHelp" tabindex="-1">');r.renderControl(C._getValueHelpIcon());r.write("</div>");}};c.addPlaceholderStyles=function(r,C){if(C.getDescription()){r.addStyle("width",C.getFieldWidth()||"50%");}};c.getAriaLabelledBy=function(C){var d=a.getAriaLabelledBy.call(this,C)||"";if(C.getDescription()){d=d+" "+C.getId()+"-Descr";}return d;};c.getAriaDescribedBy=function(C){var A=a.getAriaDescribedBy.apply(this,arguments);function d(s){A=A?A+" "+s:s;}if(C.getShowValueHelp()&&C.getEnabled()&&C.getEditable()){d(I.getStaticId("sap.m","INPUT_VALUEHELP"));if(C.getValueHelpOnly()){d(I.getStaticId("sap.m","INPUT_DISABLED"));}}if(C.getShowSuggestion()&&C.getEnabled()&&C.getEditable()){d(C.getId()+"-SuggDescr");}return A;};c.getAriaRole=function(C){return"";};c.getAccessibilityState=function(C){var A=a.getAccessibilityState.apply(this,arguments);if(C.getShowSuggestion()&&C.getEnabled()&&C.getEditable()){A.autocomplete="list";}return A;};return c;},true);