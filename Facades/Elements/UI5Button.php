<?php
namespace exface\UI5Facade\Facades\Elements;

use exface\Core\Widgets\DialogButton;
use exface\Core\Interfaces\Actions\ActionInterface;
use exface\Core\Facades\AbstractAjaxFacade\Elements\JqueryButtonTrait;
use exface\Core\Facades\AbstractAjaxFacade\Elements\AbstractJqueryElement;
use exface\Core\Widgets\Button;
use exface\Core\Interfaces\Actions\iShowDialog;
use exface\Core\Interfaces\Actions\iRunFacadeScript;
use exface\Core\DataTypes\StringDataType;
use exface\UI5Facade\Facades\Elements\ServerAdapters\UI5FacadeServerAdapter;

/**
 * Generates jQuery Mobile buttons for ExFace
 * 
 * @method Button getWidget()
 *
 * @author Andrej Kabachnik
 *        
 */
class UI5Button extends UI5AbstractElement
{
    
    use JqueryButtonTrait {
        buildJsInputRefresh as buildJsInputRefreshViaTrait;
        buildJsClickCallServerAction as buildJsClickCallServerActionViaTrait;
    }
    
    /**
     * 
     * {@inheritDoc}
     * @see \exface\UI5Facade\Facades\Elements\UI5AbstractElement::buildJsConstructor()
     */
    public function buildJsConstructor($oControllerJs = 'oController') : string
    {
        // Get the java script required for the action itself
        $action = $this->getAction();
        if ($action) {
            // Actions with facade scripts may contain some helper functions or global variables.
            // Print the here first.
            if ($action && $action instanceof iRunFacadeScript) {
                $this->getController()->addOnInitScript($action->buildScriptHelperFunctions($this->getFacade()));
                foreach ($action->getIncludes($this->getFacade()) as $includePath) {
                    if (mb_stripos($includePath, '.css') !== false) {
                        $this->getController()->addExternalCss($includePath);                        
                    } else {
                        $moduleName = str_replace('/', '.', $includePath);
                        $varName = StringDataType::convertCaseUnderscoreToPascal(str_replace(['/', '.'], '_', $includePath));
                        $this->getController()->addExternalModule($moduleName, $includePath, $varName);
                    }
                }
            }
        }
        
        return <<<JS
new sap.m.Button("{$this->getId()}", { 
    {$this->buildJsProperties()}
})
JS;
    }
    
    public function buildJsProperties()
    {
        $widget = $this->getWidget();
        switch ($widget->getVisibility()) {
            case EXF_WIDGET_VISIBILITY_PROMOTED: 
                $visibility = 'type: "Emphasized", layoutData: new sap.m.OverflowToolbarLayoutData({priority: "High"}),'; break;
            case EXF_WIDGET_VISIBILITY_OPTIONAL: 
                $visibility = 'type: "Default", layoutData: new sap.m.OverflowToolbarLayoutData({priority: "AlwaysOverflow"}),'; break;
            case EXF_WIDGET_VISIBILITY_NORMAL: 
            default: $visibility = 'type: "Default",';
            
        }
        
        $handler = $this->buildJsClickViewEventHandlerCall();
        $press = $handler !== '' ? 'press: ' . $handler . ',' : '';
        $icon = $widget->getIcon() && $widget->getShowIcon(true) ? 'icon: "' . $this->getIconSrc($widget->getIcon()) . '",' : '';
        
        $options = <<<JS

    text: "{$this->getCaption()}",
    {$icon}
    {$visibility}
    {$press}
    {$this->buildJsPropertyTooltip()}
    {$this->buildJsPropertyVisibile()}

JS;
        return $options;
    }
    
    /**
     * Returns the JS to call the press event handler from the view.
     * 
     * Typical output would be `[oController.onPressXXX, oController]`.
     * 
     * Use buildJsClickEventHandlerCall() to get the JS to use in a controller.
     * 
     * Use buildJsClickFunctionName() to the name of the handler within the controller (e.g.
     * just `onPressXXX`);
     * 
     * @see buildJsClickFunctionName()
     * @see buildJsClickEventHandlerCall()
     * 
     * @return string
     */
    public function buildJsClickViewEventHandlerCall(string $default = '') : string
    {
        $controller = $this->getController();
        $clickJs = $this->buildJsClickFunction();
        $controller->addOnEventScript($this, 'press', ($clickJs ? $clickJs : $default));
        return $this->getController()->buildJsEventHandler($this, 'press');        
    }
    
    /**
     * 
     * @param string $oControllerJsVar
     * @return string
     */
    public function buildJsClickEventHandlerCall(string $oControllerJsVar = null) : string
    {
        $methodName = $this->getController()->buildJsEventHandlerMethodName('press');
        if ($oControllerJsVar === null) {
            return $this->getController()->buildJsMethodCallFromController($methodName, $this, '');
        } else {
            return $this->getController()->buildJsMethodCallFromController($methodName, $this, '', $oControllerJsVar);
        }
        
    }
    
    /**
     * 
     * @return string
     */
    public function buildJsClickFunctionName()
    {
        $controller = $this->getController();
        return $controller->buildJsMethodName($controller->buildJsEventHandlerMethodName('press'), $this);
    }

    protected function buildJsClickShowDialog(ActionInterface $action, AbstractJqueryElement $input_element)
    {
        $widget = $this->getWidget();
        
        /* @var $prefill_link \exface\Core\CommonLogic\WidgetLink */
        $prefill = '';
        if ($prefill_link = $this->getAction()->getPrefillWithDataFromWidgetLink()) {
            if ($prefill_link->getTargetPageAlias() === null || $prefill_link->getPage()->is($widget->getPage())) {
                $prefill = ", prefill: " . $this->getFacade()->getElement($prefill_link->getTargetWidget())->buildJsDataGetter($this->getAction());
            }
        }
        
        $output = $this->buildJsRequestDataCollector($action, $input_element);
        $targetWidget = $widget->getAction()->getWidget();
        
        // Build the AJAX request
        $output .= <<<JS
                        {$this->buildJsBusyIconShow()}
                        var xhrSettings = {
							data: {
								data: requestData
								{$prefill}
							},
                            success: function(data, textStatus, jqXHR) {
                                {$this->buildJsCloseDialog($widget, $input_element)}
                            },
                            complete: function() {
                                {$this->buildJsBusyIconHide()}
                            }
						};

JS;
        
        // Load the view and open the dialog or page
        if ($this->opensDialogPage()) {
            // If the dialog is actually a UI5 page, just navigate to the respecitve view.
            $output .= <<<JS
                        this.navTo('{$targetWidget->getPage()->getAliasWithNamespace()}', '{$targetWidget->getId()}', xhrSettings);

JS;
        } else {
            // If it's a dialog, load the view and open the dialog after it has been loaded.
            
            // Note, that the promise resolves _before_ the content of the view is rendered,
            // so opening the dialog right away will make it appear blank. Instead, we use
            // setTimeout() to wait for the view to render completely.
            
            // Also make sure, the view model receives route parameters despite the fact, that
            // it was not actually handled by a router. This is importat as all kinds of on-show
            // handler will use route parameters (e.g. data, prefill, etc.) for their own needs.
            $output .= <<<JS
                        var sViewName = this.getViewName('{$targetWidget->getPage()->getAliasWithNamespace()}', '{$targetWidget->getId()}'); 
                        var sViewId = this.getViewId(sViewName);
                        var oComponent = this.getOwnerComponent();
                        
                        var jqXHR = this._loadView(sViewName, function(){ 
                            var oView = sap.ui.getCore().byId(sViewId);
                            if (oView === undefined) {
                                oComponent.runAsOwner(function(){
                                    return sap.ui.core.mvc.JSView.create({
                                        id: sViewId,
                                        viewName: "{$this->getFacade()->getViewName($targetWidget, $this->getController()->getWebapp()->getRootPage())}"
                                    }).then(function(oView){
                                        oView.getModel('view').setProperty("/_route", {params: xhrSettings.data});
                                        setTimeout(function() {
                                            var oDialog = oView.getContent()[0];
                                            oDialog.attachAfterClose(function() {
                                                {$this->buildJsInputRefresh($widget, $input_element)}
                                            });
                                            oDialog.open();
                                        });
                                    });
                                });
                            } else {
                                oView.getModel('view').setProperty("/_route", {params: xhrSettings.data});
                                oView.getContent()[0].open();
                            }
                        }, xhrSettings);
                        
JS;
        }
        
        return $output;
    }
    
    /**
     * 
     * {@inheritdoc}
     * @see \exface\Core\Facades\AbstractAjaxFacade\Elements\JqueryButtonTrait::buildJsNavigateToPage
     */
    protected function buildJsNavigateToPage(string $pageSelector, string $urlParams = '', AbstractJqueryElement $inputElement) : string
    {
        return <<<JS
						var sUrlParams = '{$urlParams}';
                        var oUrlParams = {};
                        var vars = sUrlParams.split('&');
                    	for (var i = 0; i < vars.length; i++) {
                    		var pair = vars[i].split('=');
                            if (pair[0]) {
                                var val = decodeURIComponent(pair[1]);
                                if (val.substring(0, 1) === '{') {
                                    try {
                                        val = JSON.parse(val);
                                    } catch (error) {
                                        // Do nothing, val will remain a string
                                    }
                                }
            		            oUrlParams[pair[0]] = val;
                            }
                    	} 
                        this.navTo("{$pageSelector}", '', {
                            data: oUrlParams,
                            success: function(){ 
                                {$inputElement->buildJsBusyIconHide()} 
                            },
                            error: function(){ 
                                {$inputElement->buildJsBusyIconHide()} 
                            }
                        });

JS;
    }
    
    /**
     * 
     * @param Button $widget
     * @param UI5AbstractElement $input_element
     * @return string
     */
    protected function buildJsInputRefresh(Button $widget, $input_element)
    {
        return <<<JS
    if (sap.ui.getCore().byId("{$this->getId()}") !== undefined) {
        {$this->buildJsInputRefreshViaTrait($widget, $input_element)}
    }

JS;
    }

    /**
     * Returns javascript code with global variables and functions needed for certain button types
     */
    protected function buildJsGlobals()
    {
        $output = '';
        /*
         * Commented out because moved to generate_js()
         * // If the button reacts to any hotkey, we need to declare a global variable to collect keys pressed
         * if ($this->getWidget()->getHotkey() == 'any'){
         * $output .= 'var exfHotkeys = [];';
         * }
         */
        return $output;
    }
    
    protected function buildJsCloseDialog($widget, $input_element)
    {
        if ($widget->getWidgetType() == 'DialogButton' && $widget->getCloseDialogAfterActionSucceeds()) {
            $dialogElement = $this->getFacade()->getElement($widget->getDialog());
            if ($dialogElement->isMaximized()) {
                return $this->getController()->buildJsControllerGetter($this) . '.onNavBack();';
            } else {
                return "try{ sap.ui.getCore().byId('{$input_element->getId()}').close(); } catch (e) { console.error('Could not close dialog: ' + e); }";
            }
        }
        return "";
    }
    
    protected function opensDialogPage()
    {
        $action = $this->getAction();
        
        if ($action instanceof iShowDialog) {
            return $this->getFacade()->getElement($action->getDialogWidget())->isMaximized();
        } 
        
        return false;
    }
   
    /**
     * 
     * {@inheritDoc}
     * @see \exface\UI5Facade\Facades\Elements\UI5AbstractElement::buildJsBusyIconShow()
     */
    public function buildJsBusyIconShow($global = false)
    {
        return parent::buildJsBusyIconShow(true);
    }
    
    /**
     * 
     * {@inheritDoc}
     * @see \exface\UI5Facade\Facades\Elements\UI5AbstractElement::buildJsBusyIconHide()
     */
    public function buildJsBusyIconHide($global = false)
    {
        return parent::buildJsBusyIconHide(true);
    }
    
    protected function buildJsClickCallServerAction(ActionInterface $action, AbstractJqueryElement $input_element)
    {
        $serverAdapter = $this->getServerAdapter();
        if ($serverAdapter instanceof UI5FacadeServerAdapter) {
            return $this->buildJsClickCallServerActionViaTrait($action, $input_element);
        }
        
        $widget = $this->getWidget();
        
        $onModelLoadedJs = <<<JS

                        function(data, textStatus) {
                            console.log("Data: ", data);
                            console.log("TextStatus: ", textStatus);
                            if (typeof data === 'object') {
                                response = data;
                            } else {
                                var response = {};
								try {
									response = $.parseJSON(data);
								} catch (e) {
									response.error = data;
								}
                            }
		                   	if (response.success || textStatus.statusCode === "200"){
								{$this->buildJsCloseDialog($widget, $input_element)}
								{$this->buildJsInputRefresh($widget, $input_element)}
		                       	{$this->buildJsBusyIconHide()}
		                       	$('#{$this->getId()}').trigger('{$action->getAliasWithNamespace()}.action.performed', [requestData, '{$input_element->getId()}']);
								if (response.success || response.undoURL){
		                       		{$this->buildJsShowMessageSuccess("response.success + (response.undoable ? ' <a href=\"{$this->buildJsUndoUrl($action, $input_element) }\" style=\"display:block; float:right;\">UNDO</a>' : '')")}
									if(response.redirect){
										if (response.redirect.indexOf('target=_blank') !== 0) {
											window.open(response.redirect.replace('target=_blank',''), '_newtab');
										}
										else {
											window.location.href = response.redirect;
										}
                   					}
								}
                                {$this->buildJsOnSuccessScript()}
		                    } else {
								{$this->buildJsBusyIconHide()}
								{$this->buildJsShowMessageError('response.error', '"Server error"')}
		                    }
						}

JS;
                                
        $onErrorJs = <<<JS

                        function(jqXHR, textStatus, errorThrown){
                            {$this->buildJsShowError('jqXHR.responseText', 'jqXHR.statusCode + " " + jqXHR.statusText')}
                            {$this->buildJsBusyIconHide()}
						}

JS;
        
        $onOfflineJs = '';
        
        $doAction = $this->getServerAdapter()->buildJsServerRequest(
            $action,
            'oModel',
            'params',
            $onModelLoadedJs,
            $onErrorJs,
            $onOfflineJs
        );		
		
        $output = $this->buildJsRequestDataCollector($action, $input_element);
        $output .= <<<JS
                
				if ({$input_element->buildJsValidator()}) {
					{$this->buildJsBusyIconShow()}
                    var oModel = new sap.ui.model.json.JSONModel();
                    var params = {
							action: "{$widget->getActionAlias()}",
							resource: "{$widget->getPage()->getAliasWithNamespace()}",
							element: "{$widget->getId()}",
							object: "{$widget->getMetaObject()->getId()}",
							data: requestData
					}
                    {$doAction}	    
				} else {
					{$input_element->buildJsValidationError()}
				}

JS;
                                
            return $output;
    }
}
    
/*    protected function buildJsClickCallServerAction(ActionInterface $action, AbstractJqueryElement $input_element)
    {
        $serverAdapter = $this->getServerAdapter();
        if ($serverAdapter instanceof UI5FacadeServerAdapter) {
            return $this->buildJsClickCallServerActionViaTrait($action, $input_element);
        }
        
        $widget = $this->getWidget();
        
        $oParamsJs = '';
        $onModelLoadedJs = '';
        
        $headers = ! empty($this->getAjaxHeaders()) ? 'headers: ' . json_encode($this->getAjaxHeaders()) . ',' : '';
        
        $output = $this->buildJsRequestDataCollector($action, $input_element);
        $output .= "
                console.log('Aktion: ', '{$widget->getActionAlias()}');
				if (" . $input_element->buildJsValidator() . ") {
					" . $this->buildJsBusyIconShow() . "
                    var oModel = new sap.ui.model.json.JSONModel();
					$.ajax({
						type: 'POST',
						url: '" . $this->getAjaxUrl() . "',
                        {$headers}
						data: {
							action: '" . $widget->getActionAlias() . "',
							resource: '" . $widget->getPage()->getAliasWithNamespace() . "',
							element: '" . $widget->getId() . "',
							object: '" . $widget->getMetaObject()->getId() . "',
							data: requestData
						},
						success: function(data, textStatus, jqXHR) {
                            if (typeof data === 'object') {
                                response = data;
                            } else {
                                var response = {};
								try {
									response = $.parseJSON(data);
								} catch (e) {
									response.error = data;
								}
                            }
		                   	if (response.success){
								" . $this->buildJsCloseDialog($widget, $input_element) . "
								" . $this->buildJsInputRefresh($widget, $input_element) . "
		                       	" . $this->buildJsBusyIconHide() . "
		                       	$('#" . $this->getId() . "').trigger('" . $action->getAliasWithNamespace() . ".action.performed', [requestData, '" . $input_element->getId() . "']);
								if (response.success || response.undoURL){
		                       		" . $this->buildJsShowMessageSuccess("response.success + (response.undoable ? ' <a href=\"" . $this->buildJsUndoUrl($action, $input_element) . "\" style=\"display:block; float:right;\">UNDO</a>' : '')") . "
									if(response.redirect){
										if (response.redirect.indexOf('target=_blank') !== 0) {
											window.open(response.redirect.replace('target=_blank',''), '_newtab');
										}
										else {
											window.location.href = response.redirect;
										}
                   					}
								}
                                {$this->buildJsOnSuccessScript()}
		                    } else {
								" . $this->buildJsBusyIconHide() . "
								" . $this->buildJsShowMessageError('response.error', '"Server error"') . "
		                    }
						},
						error: function(jqXHR, textStatus, errorThrown){
							" . $this->buildJsShowError('jqXHR.responseText', 'jqXHR.status + " " + jqXHR.statusText') . "
							" . $this->buildJsBusyIconHide() . "
						}
					});
                    
				} else {
					" . $input_element->buildJsValidationError() . "
				}
			";
                                        
        return $output;
        
        // insert at line 409: {$serverAdapter->buildJsServerRequest($action, 'oModel', $oParamsJs, $onModelLoadedJs)}
    }
}*/