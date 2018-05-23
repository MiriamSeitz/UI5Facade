<?php
namespace exface\OpenUI5Template\Templates\Elements;

use exface\Core\Templates\AbstractAjaxTemplate\Elements\AbstractJqueryElement;
use exface\OpenUI5Template\Templates\OpenUI5Template;
use exface\Core\CommonLogic\Constants\Icons;
use exface\Core\Interfaces\Widgets\iHaveValue;
use exface\Core\Factories\UiPageFactory;
use exface\Core\DataTypes\StringDataType;
use exface\OpenUI5Template\Templates\Interfaces\ui5ControllerInterface;
use exface\Core\Exceptions\LogicException;
use exface\OpenUI5Template\Templates\Interfaces\ui5ViewInterface;

/**
 *
 * @method OpenUI5Template getTemplate()
 *        
 * @author Andrej Kabachnik
 *        
 */
abstract class ui5AbstractElement extends AbstractJqueryElement
{
    private $jsVarName = null;
    
    private $useWidgetId = true;
    
    private $controller = null;
    
    /**
     * 
     * @var array [ event_name => [code, code, ...] ]
     */
    private $pseudo_events = [];
    
    /**
     * Returns the JS constructor for this element (without the semicolon!): e.g. "new sap.m.Button()" etc.
     * 
     * For complex widgets (e.g. requireing a model, init-scripts, etc.) you can use the following approaches:
     * - create custom controller methods via $this->getController()->add...
     * - add code to the onInit-method of the controller via $this->getController()->addOnInitScript()  
     * - use an immediately invoked function expression like "function(){...}()" as constructor (not recommended!)
     * 
     * @see getController()
     *
     * @return string
     */
    public function buildJsConstructor($oControllerJs = 'oController') : string
    {
        return '';
    }
    
    /**
     * Returns a unique variable name for this element, that meets UI5 conventions: e.g. "oDataTableDataToolbarDataButton02".
     * 
     * @return string
     */
    public function buildJsVarName() : string
    {
        if (is_null($this->jsVarName)) {
            $this->jsVarName = 'o' . StringDataType::convertCaseUnderscoreToPascal($this->getId());
        }
        return $this->jsVarName;
    }
    
    protected function setJsVar($jsVarName)
    {
        $this->jsVarName = $jsVarName;
        return $this;
    }
    
    public function buildJsProperties()
    {
        return <<<JS

        {$this->buildJsPropertyVisibile()}

JS;
    }

    public function buildJsInlineEditorInit()
    {
        return '';
    }

    public function buildJsBusyIconShow($global = false)
    {
        if ($global) {
            return 'sap.ui.core.BusyIndicator.show(0);';
        } else {
            return 'sap.ui.getCore().byId("' . $this->getId() . '").setBusyIndicatorDelay(0).setBusy(true);';
        }
    }

    public function buildJsBusyIconHide($global = false)
    {
        if ($global) {
            return 'sap.ui.core.BusyIndicator.hide();';
        } else {
            return 'sap.ui.getCore().byId("' . $this->getId() . '").setBusy(false);';
        }
    }

    /**
     *
     * {@inheritdoc}
     *
     * @see \exface\Core\Templates\AbstractAjaxTemplate\Elements\AbstractJqueryElement::buildJsShowMessageError()
     */
    public function buildJsShowMessageError($message_body_js, $title = null)
    {
        $title = ($title ? $title : '"' . $this->translate('MESSAGE.ERROR_TITLE') . '"');
        return <<<JS
                var dialog = new sap.m.Dialog({
    				title: {$title},
    				type: 'Message',
    				state: 'Error',
    				content: new sap.m.Text({
    					text: {$message_body_js}
    				}),
    				beginButton: new sap.m.Button({
    					text: 'OK',
    					press: function () {
    						dialog.close();
    					}
    				}),
    				afterClose: function() {
    					dialog.destroy();
    				}
    			});
    
    			dialog.open();
JS;
    }

    /**
     *
     * {@inheritdoc}
     *
     * @see \exface\Core\Templates\AbstractAjaxTemplate\Elements\AbstractJqueryElement::buildJsShowError()
     */
    public function buildJsShowError($message_body_js, $title_js = null)
    {
        $title_js = $title_js ? $title_js : '"' . $this->translate('MESSAGE.ERROR_TITLE') . '"';
        return <<<JS
                var view = '';
                var errorBody = {$message_body_js};
                var viewMatch = errorBody.match(/sap.ui.jsview\("(.*)"/i);
                if (viewMatch !== null) {
                    view = viewMatch[1];
                    var randomizer = window.performance.now().toString();
                    errorBody = errorBody.replace(view, view+randomizer);
                    view = view+randomizer;
                    $('body').append(errorBody);
                    showDialog({$title_js}, sap.ui.view({type:sap.ui.core.mvc.ViewType.JS, viewName:view}), 'Error');
                } else {
                    showHtmlInDialog({$title_js}, errorBody, 'Error');
                }

JS;
    }

    /**
     *
     * {@inheritdoc}
     *
     * @see \exface\Core\Templates\AbstractAjaxTemplate\Elements\AbstractJqueryElement::buildJsShowMessageSuccess()
     */
    public function buildJsShowMessageSuccess($message_body_js, $title = null)
    {
        return <<<JS

        sap.m.MessageToast.show(function(){
            var tmp = document.createElement("DIV");
            tmp.innerHTML = {$message_body_js};
            return tmp.textContent || tmp.innerText || "";
        }());
JS;
    }

    public function escapeString($string)
    {
        return htmlentities($string, ENT_QUOTES);
    }

    /**
     * Returns the css classes, that define the grid width for the element (e.g.
     * col-xs-12, etc.)
     *
     * @return string
     */
    public function getWidthClasses()
    {
        if ($this->getWidget()->getWidth()->isRelative()) {
            switch ($this->getWidget()->getWidth()->getValue()) {
                case 1:
                    $width = 'col-xs-12 col-md-4';
                    break;
                case 2:
                    $width = 'col-xs-12 col-md-8';
                    break;
                case 3:
                case 'max':
                    $width = 'col-xs-12';
            }
        }
        return $width;
    }

    public function prepareData(\exface\Core\Interfaces\DataSheets\DataSheetInterface $data_sheet)
    {
        // apply the formatters
        foreach ($data_sheet->getColumns() as $name => $col) {
            if ($formatter = $col->getFormatter()) {
                $expr = $formatter->toString();
                $function = substr($expr, 1, strpos($expr, '(') - 1);
                // FIXME the next three lines seem obsolete... Not sure though, since everything works fine right now
                $formatter_class_name = 'formatters\'' . $function;
                if (class_exists($class_name)) {
                    $formatter = new $class_name($y);
                }
                // See if the formatter returned more results, than there were rows. If so, it was also performed on
                // the total rows. In this case, we need to slice them off and pass to set_column_values() separately.
                // This only works, because evaluating an expression cannot change the number of data rows! This justifies
                // the assumption, that any values after count_rows() must be total values.
                $vals = $formatter->evaluate($data_sheet, $name);
                if ($data_sheet->countRows() < count($vals)) {
                    $totals = array_slice($vals, $data_sheet->countRows());
                    $vals = array_slice($vals, 0, $data_sheet->countRows());
                }
                $data_sheet->setColumnValues($name, $vals, $totals);
            }
        }
        
        $data = array();
        $data['data'] = array_merge($data_sheet->getRows(), $data_sheet->getTotalsRows());
        $data['recordsFiltered'] = $data_sheet->countRowsAll();
        $data['recordsTotal'] = $data_sheet->countRowsAll();
        if (! is_null($data_sheet->getRowsOnPage())) {
            $data['recordsLimit'] = $data_sheet->getRowsOnPage();
            $data['recordsOffset'] = $data_sheet->getRowOffset();
        }
        $data['recordsTotal'] = $data_sheet->countRowsAll();
        
        $data['footerRows'] = count($data_sheet->getTotalsRows());
        return $data;
    }
    
    /**
     * Returns the SAP icon URI (e.g. "sap-icon://edit") for the given icon name
     * 
     * @param string $icon_name
     * @return string
     */
    protected function getIconSrc($icon_name)
    {
        $path = Icons::isDefined($icon_name) ? 'font-awesome/' : '';
        return 'sap-icon://' . $path . $icon_name;
    }
    
    public function buildCssIconClass($icon)
    {
        return $icon ? $this->getIconSrc($icon) : '';
    }
    
    /**
     *
     * {@inheritDoc}
     * @see \exface\Core\Templates\AbstractAjaxTemplate\Elements\AbstractJqueryElement::buildJsValueGetter()
     */
    public function buildJsValueGetter()
    {
        $widget = $this->getWidget();
        if ($widget instanceof iHaveValue) {
            return "sap.ui.getCore().byId('{$this->getId()}').{$this->buildJsValueGetterMethod()}";
        } else {
            return '""';
        }
    }
    
    /**
     * 
     * {@inheritDoc}
     * @see \exface\Core\Templates\AbstractAjaxTemplate\Elements\AbstractJqueryElement::buildJsValueGetterMethod()
     */
    public function buildJsValueGetterMethod()
    {
        return "getValue()";
    }
    
    /**
     * 
     * {@inheritDoc}
     * @see \exface\Core\Templates\AbstractAjaxTemplate\Elements\AbstractJqueryElement::buildJsValueSetter()
     */
    public function buildJsValueSetter($valueJs)
    {
        $widget = $this->getWidget();
        if ($widget instanceof iHaveValue) {
            return "sap.ui.getCore().byId('{$this->getId()}').{$this->buildJsValueSetterMethod($valueJs)}";
        } else {
            return '""';
        }
    }
    
    /**
     * 
     * {@inheritDoc}
     * @see \exface\Core\Templates\AbstractAjaxTemplate\Elements\AbstractJqueryElement::buildJsValueSetterMethod()
     */
    public function buildJsValueSetterMethod($valueJs)
    {
        return "setValue(" . $valueJs . ")";
    }
        
    protected function escapeJsTextValue($text)
    {
        return str_replace(['"', '\u', "\n"], ['\"', '&#92;u', "\\n"], $text);
    }
    
    /**
     * Returns "visible: false," if the element is not visible (e.g. widget has visibility=hidden).
     * 
     * NOTE: The returned string is either empty or ends with a comma
     * 
     * @return string
     */
    protected function buildJsPropertyVisibile()
    {
        if (! $this->isVisible()) {
            return 'visible: false, ';
        }
        return '';
    }
    
    /**
     * Returns TRUE if the element is visible and FALSE otherwise
     * @return boolean
     */
    protected function isVisible()
    {
        return ! $this->getWidget()->isHidden();
    }
    
    /**
     * Returns the JS code adding pseudo event handlers to a control: e.g. .addEventDelegate(...).
     * 
     * NOTE: the string is either empty or starts with a leading dot and ends with a closing
     * brace (no semicolon!)
     * 
     * @see addPseudoEventHandler()
     * 
     * @return string
     */
    protected function buildJsPseudoEventHandlers()
    {
        $js = '';
        foreach ($this->pseudo_events as $event => $code_array) {
            $code = implode("\n", $code_array);
            $js .= <<<JS
            
            {$event}: function(oEvent) {
                {$code}
            },
            
JS;
        }
        
        if ($js) {
            $js = <<<JS
            
        .addEventDelegate({
            {$js}
        })
        
JS;
        }
        
        return $js;
    }
    
    /**
     * Registers the given JS code to be executed on a specified pseudo event for this control.
     * 
     * Note: the event fired will be available via the oEvent javascript variable.
     * 
     * Example: ui5Input::addPseudoEventHandler('onsapenter', 'console.log("Enter pressed:", oEvent)')
     * 
     * @link https://openui5.hana.ondemand.com/#/api/jQuery.sap.PseudoEvents
     * 
     * @param string $event_name
     * @param string $js
     * @return \exface\OpenUI5Template\Templates\Elements\ui5AbstractElement
     */
    public function addPseudoEventHandler($event_name, $js)
    {
        $this->pseudo_events[$event_name][] = $js;
        return $this;
    }
    
    protected function buildJsPropertyTooltip()
    {
        $widget = $this->getWidget();
        return 'tooltip: "' . $this->escapeJsTextValue($widget->getHint() ? $widget->getHint() : $widget->getCaption()) . '",';
    }
    
    public function setUseWidgetId($true_or_false)
    {
        $this->useWidgetId = $true_or_false;
        return $this;
    }
    
    public function getUseWidgetId()
    {
        return $this->useWidgetId;
    }
    
    /**
     * 
     * {@inheritDoc}
     * @see \exface\Core\Templates\AbstractAjaxTemplate\Elements\AbstractJqueryElement::getId()
     */
    public function getId()
    {
        if ($this->getUseWidgetId() === false) {
            return '';
        }
        
        return parent::getId();
    }
    
    /**
     * UI5-Elements do not have a general buildJs() method, because there is no place in the controller
     * where it's global variables and methods can be defined in "regular" JS syntax. E.g. instead of
     * "function ... () {}" a controller method must be defined as "...: function(){}", etc.
     * 
     * Making this method final makes sure, no element makes use of it unintentionally (e.g.
     * via trait).
     * 
     * @see \exface\Core\Templates\AbstractAjaxTemplate\Elements\AbstractJqueryElement::buildJs()
     */
    public final function buildJs()
    {
        return '';
    }
    
    /**
     * UI5-Elements do not produce HTML, but rather views in JS/XML.
     * 
     * Making this method final makes sure, no element makes use of it unintentionally (e.g.
     * via trait). 
     * 
     * @see \exface\Core\Templates\AbstractAjaxTemplate\Elements\AbstractJqueryElement::buildHtml()
     */
    public final function buildHtml()
    {
        return '';
    }
    
    public function getController() : ui5ControllerInterface
    {
        if ($this->controller === null) {
            if ($this->getWidget()->hasParent()) {
                return $this->getTemplate()->getElement($this->getWidget()->getParent())->getController();
            } else {
                throw new LogicException('No controller was initialized for page "' . $this->getWidget()->getPage()->getAliasWithNamespace() . '"!');
            }
        }
        return $this->controller;
    }
    
    public function getView() : ui5ViewInterface
    {
        return $this->controller->getView();
    }
    
    public function setController(ui5ControllerInterface $controller) : ui5AbstractElement
    {
        if (! $this->controller === null) {
            throw new LogicException('Cannot change the controller of a UI5 element after it had been set initially!');
        }
        $this->controller = $controller;
        return $this;
    }
    
    public final function buildHtmlHeadTags()
    {
        return [];
    }
}
?>