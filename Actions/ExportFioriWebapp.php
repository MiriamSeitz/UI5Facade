<?php
namespace exface\UI5Facade\Actions;

use exface\Core\Interfaces\Tasks\TaskInterface;
use exface\UI5Facade\UI5FacadeApp;
use exface\Core\Interfaces\Model\UiPageInterface;
use exface\Core\Factories\UiPageFactory;
use exface\Core\CommonLogic\Filemanager;
use exface\Core\Interfaces\AppInterface;
use exface\Core\DataTypes\StringDataType;
use exface\UI5Facade\Webapp;
use exface\UI5Facade\Facades\UI5Facade;
use exface\Core\CommonLogic\Constants\Icons;
use exface\Core\Factories\FacadeFactory;
use exface\Core\Interfaces\Selectors\AliasSelectorInterface;
use exface\Core\Exceptions\RuntimeException;
use exface\Core\Exceptions\Facades\FacadeRuntimeError;
use exface\Core\Interfaces\WidgetInterface;
use exface\Core\Interfaces\Widgets\iTriggerAction;
use exface\Core\Interfaces\DataSources\DataTransactionInterface;
use exface\Core\CommonLogic\AbstractAction;
use exface\Core\Interfaces\Tasks\ResultInterface;
use exface\Core\Factories\ResultFactory;
use exface\Core\Factories\DataSheetFactory;
use exface\Core\DataTypes\DateTimeDataType;
use exface\Core\Interfaces\Actions\iModifyData;
use exface\Core\Interfaces\Actions\iShowWidget;
use exface\Core\CommonLogic\UxonObject;

/**
 * Generates the code for a selected Fiori Webapp project.
 * 
 * @author Andrej Kabachnik
 * 
 * @method UI5FacadeApp getApp()
 *
 */
class ExportFioriWebapp extends AbstractAction implements iModifyData
{
    private $facadeSelectorString = 'exface\\UI5Facade\\Facades\\UI5Facade';
    
    protected function init()
    {
        parent::init();
        $this->setInputRowsMin(1);
        $this->setInputRowsMax(1);
        $this->setInputObjectAlias('exface.UI5Facade.FIORI_WEBAPP');
        $this->setIcon(Icons::HDD_O);
    }
    
    protected function perform(TaskInterface $task, DataTransactionInterface $transaction) : ResultInterface
    {
        // Export app
        $input = $this->getInputDataSheet($task);
        $columns = $input->getColumns();
        $columns->addFromExpression('root_page_alias');
        $columns->addFromExpression('export_folder');
        $columns->addFromExpression('current_version');
        $columns->addFromExpression('ui5_min_version');
        $columns->addFromExpression('ui5_source');
        $columns->addFromExpression('ui5_theme');
        $columns->addFromExpression('ui5_app_control');
        $columns->addFromExpression('app_id');
        $columns->addFromExpression('app_title');
        $columns->addFromExpression('app_subTitle');
        $columns->addFromExpression('app_shortTitle');
        $columns->addFromExpression('app_info');
        $columns->addFromExpression('app_description');
        $columns->addFromExpression('MODIFIED_ON');
        
        if (! $input->isFresh()) {
            $input->addFilterFromColumnValues($input->getUidColumn());
            $input->dataRead();
        }
        
        $row = $input->getRows()[0];
        $row['component_path'] = str_replace('.', '/', $row['app_id']);
        $row['assets_path'] = './';
        $row['use_combined_viewcontrollers'] = 'false';
        
        $rootPage = UiPageFactory::createFromCmsPage($this->getWorkbench()->getCMS(), $row['root_page_alias']);
        $facade = FacadeFactory::createFromString($this->facadeSelectorString, $this->getWorkbench());
        
        // Always use oData server adapter
        $facade->getConfig()->setOption('DEFAULT_SERVER_ADAPTER_CLASS', $facade->getConfig()->getOption('WEBAPP_EXPORT.SERVER_ADAPTER_CLASS'));
        // Disable all global actions as they cannot be used with the oData adapter
        $facade->getWorkbench()->getConfig()->setOption('WIDGET.DATATOOLBAR.GLOBAL_ACTIONS', new UxonObject());
        
        $webappFolder = $this->exportWebapp($rootPage, $facade, $row);
        
        // Update build-timestamp
        $updSheet = DataSheetFactory::createFromObject($input->getMetaObject());
        $updSheet->addRow([
            $input->getMetaObject()->getUidAttributeAlias() => $row[$input->getUidColumn()->getName()],
            'current_version_date' => DateTimeDataType::now(),
            'MODIFIED_ON' => $row['MODIFIED_ON']
        ]);
        // Do not pass the transaction to the update to force autocommit
        $updSheet->dataUpdate(false);
        
        return ResultFactory::createMessageResult($task, 'Exported to ' . $webappFolder);
    }
    
    protected function getExportPath(array $appData) : string
    {
        $path = $appData['export_folder'];
        $path = StringDataType::replacePlaceholders($path, $appData, true);
        $fm = $this->getWorkbench()->filemanager();
        if ($fm::pathIsAbsolute($path) === false) {
            $path = $fm::pathJoin([$fm->getPathToBaseFolder(), $path]);
        }
        
        return $path;
    }
    
    protected function exportWebapp(UiPageInterface $rootPage, UI5Facade $facade, array $appDataRow) : string
    {
        $appPath = $this->getExportPath($appDataRow);
        $webcontentPath = $appPath . DIRECTORY_SEPARATOR . 'WebContent';
        if (! file_exists($webcontentPath)) {
            Filemanager::pathConstruct($webcontentPath);
        } else {
            $this->getWorkbench()->filemanager()->emptyDir($webcontentPath);
        }
        
        $webcontentPath = $webcontentPath . DIRECTORY_SEPARATOR;
        /* @var $webapp \exface\UI5Facade\Webapp */ 
        $webapp = $facade->initWebapp($appDataRow['app_id'], $appDataRow);
        
        if (! file_exists($webcontentPath . 'view')) {
            Filemanager::pathConstruct($webcontentPath . 'view');
        }
        if (! file_exists($webcontentPath . 'controller')) {
            Filemanager::pathConstruct($webcontentPath . 'controller');
        }
        if (! file_exists($webcontentPath . 'libs')) {
            Filemanager::pathConstruct($webcontentPath . 'libs');
        }
        
        $this            
            ->exportFile($webapp, 'index.html', $webcontentPath)
            ->exportFile($webapp, 'Component.js', $webcontentPath)
            ->exportTranslations($rootPage->getApp(), $webapp, $webcontentPath)
            ->exportStaticViews($webapp, $webcontentPath)
            ->exportPages($webapp, $webcontentPath)
            ->exportFile($webapp, 'manifest.json', $webcontentPath);
        
        return $appPath;
    }
    
    protected function exportTranslations(AppInterface $app, Webapp $webapp, string $exportFolder) : ExportFioriWebapp
    {
        $defaultLang = $app->getLanguageDefault();
        $i18nFolder = $exportFolder . 'i18n' . DIRECTORY_SEPARATOR;
        if (! file_exists($i18nFolder)) {
            Filemanager::pathConstruct($i18nFolder);
        }
        
        foreach ($app->getLanguages() as $lang) {
            $i18nSuffix = (strcasecmp($lang, $defaultLang) === 0) ? '' : '_' . $lang;
            $i18nFile = $i18nFolder . 'i18n' . $i18nSuffix . '.properties';
            file_put_contents($i18nFile, $webapp->get($i18nFile));
        }
        return $this;
    }
    
    /**
     * 
     * @param Webapp $webapp
     * @param string $exportFolder
     * @return ExportFioriWebapp
     */
    protected function exportStaticViews(Webapp $webapp, string $exportFolder) : ExportFioriWebapp
    {
        foreach ($webapp->getBaseViews() as $route) {
            $this->exportFile($webapp, $route, $exportFolder);
        }
        foreach ($webapp->getBaseControllers() as $route) {
            $this->exportFile($webapp, $route, $exportFolder);
        }
        return $this;
    }
    
    protected function exportPages(Webapp $webapp, string $exportFolder) : ExportFioriWebapp
    {
        $this->exportPage($webapp, $webapp->getRootPage(), $exportFolder);
        return $this;
    }
    
    protected function exportPage(Webapp $webapp, UiPageInterface $page, string $exportFolder, int $linkDepth = 5) : ExportFioriWebapp
    {     
        try {
            $widget = $page->getWidgetRoot();
            $this->exportWidget($webapp, $widget, $exportFolder, $linkDepth);
        } catch (\Throwable $e) {
            throw new FacadeRuntimeError('Cannot export view for page "' . $page->getAliasWithNamespace() . '": ' . $e->getMessage(), null, $e);
        }
        
        return $this;
    }
    
    protected function exportWidget(Webapp $webapp, WidgetInterface $widget, string $exportFolder, int $linkDepth) : ExportFioriWebapp
    {
        try {
            //$widget = $webapp->handlePrefill($widget, $task);
            // IMPORTANT: generate the view first to allow it to add controller methods!
            $view = $webapp->getViewForWidget($widget);
            $controller = $view->getController();
            $viewJs = $view->buildJsView();
            $viewJs = $this->escapeUnicode($viewJs);
            $controllerJs = $controller->buildJsController();
            //$controllerJs = $this->escapeUnicode($controllerJs);
        } catch (\Throwable $e) {
            throw new FacadeRuntimeError('Cannot export view for widget "' . $widget->getId() . '" in page "' . $widget->getPage()->getAliasWithNamespace() . '": ' . $e->getMessage(), null, $e);
        }
        
        // Copy external includes and replace their paths in the controller
        $controllerJs = $this->exportExternalLibs($controllerJs, $exportFolder . DIRECTORY_SEPARATOR . 'libs');
        
        // Save view and controller as files
        $controllerFile = rtrim($exportFolder, "\\/") . DIRECTORY_SEPARATOR . $controller->getPath(true);
        $controllerDir = pathinfo($controllerFile, PATHINFO_DIRNAME);
        if (! is_dir($controllerDir)) {
            Filemanager::pathConstruct($controllerDir);
        }
        
        $viewFile = rtrim($exportFolder, "\\/") . DIRECTORY_SEPARATOR . $view->getPath(true);
        $viewDir = pathinfo($viewFile, PATHINFO_DIRNAME);
        if (! is_dir($viewDir)) {
            Filemanager::pathConstruct($viewDir);
        }
        
        file_put_contents($viewFile, $viewJs);
        file_put_contents($controllerFile, $controllerJs);
        
        if ($linkDepth > 0) {
            foreach ($this->findLinkedViewWidgets($widget) as $dialog) {
                $this->exportWidget($webapp, $dialog, $exportFolder, ($linkDepth-1));
            }
        }
        
        return $this;
    }
    
    protected function findLinkedViewWidgets(WidgetInterface $widget) : array
    {
        $results = [];
        foreach ($widget->getChildren() as $child) {
            if ($child instanceof iTriggerAction && $child->hasAction() && $child->getAction() instanceof iShowWidget) {
                $results[] = $child->getAction()->getWidget();
            } else {
                $results = array_merge($results, $this->findLinkedViewWidgets($child));
            }
        }
        return $results;
    }
    
    protected function exportExternalLibs(string $controllerJs, string $libsFolder) : string
    {
        $filemanager = $this->getWorkbench()->filemanager();
        
        // Process JS files
        $matches = [];
        preg_match_all('/jQuery\.sap\.registerModulePath\((?>[\'"].*[\'"], )?[\'"](.*)["\']\)/mi', $controllerJs, $matches);
        $jsIncludes = $matches[1];
        
        foreach ($jsIncludes as $path) {
            if ($this->isExternalUrl($path)) {
                continue;
            }
            $pathExported = $this->exportExternalLib($path . '.js', $libsFolder, $filemanager);
            $controllerJs = str_replace($path, substr($pathExported, 0, -3), $controllerJs);
        }
        
        // Process CSS files
        $matches = [];
        preg_match_all('/jQuery\.sap\.includeStyleSheet\((?>[\'"].*[\'"], )?[\'"](.*)["\']\)/mi', $controllerJs, $matches);
        $cssIncludes = $matches[1];
        
        foreach ($cssIncludes as $path) {
            if ($this->isExternalUrl($path)) {
                continue;
            }
            $pathExported = $this->exportExternalLib($path, $libsFolder, $filemanager);
            $controllerJs = str_replace($path, $pathExported, $controllerJs);
        }
        
        return $controllerJs;
    }
    
    protected function exportExternalLib(string $includePath, string $libsFolder, Filemanager $filemanager) : string
    {
        $pathInVendorFolder = Filemanager::pathNormalize(StringDataType::substringAfter($includePath, 'vendor/'));
        $file = $filemanager->getPathToVendorFolder() . DIRECTORY_SEPARATOR . $pathInVendorFolder;
        if (! file_exists($file)) {
            throw new RuntimeException('Cannot export external library with path "' . $includePath . '": file "' . $file . '" not found!');
        }
        $pathParts = explode('/', $pathInVendorFolder);
        $folder = $pathParts[0] . DIRECTORY_SEPARATOR . $pathParts[1];
        if (! file_exists($libsFolder . DIRECTORY_SEPARATOR . $folder)) {
            if (strcasecmp($folder, $this->getApp()->getDirectory()) === 0) {
                $jsFolder = '/Facades/js';
                $filemanager->copyDir($filemanager->getPathToVendorFolder() . DIRECTORY_SEPARATOR . $folder . $jsFolder, $libsFolder . DIRECTORY_SEPARATOR . $folder);
            } else {
                $filemanager->copyDir($filemanager->getPathToVendorFolder() . DIRECTORY_SEPARATOR . $folder, $libsFolder . DIRECTORY_SEPARATOR . $folder);
            }
        }
        
        if (strcasecmp($folder, $this->getApp()->getDirectory()) === 0) {
            $pathInVendorFolder = str_replace('/Facades/js', '', $pathInVendorFolder);
        }
        
        return pathinfo($libsFolder, PATHINFO_BASENAME) . '/' . $pathInVendorFolder;
    }
    
    protected function isExternalUrl(string $uri) : bool
    {
        return StringDataType::startsWith($uri, 'https:', false) || StringDataType::startsWith($uri, 'http:', false) || StringDataType::startsWith($uri, 'ftp:', false);
    }
    
    protected function buildPathToPageAsset(UiPageInterface $page, string $exportFolder, string $assetType = 'view') : string
    {
        $subfolder = str_replace(AliasSelectorInterface::ALIAS_NAMESPACE_DELIMITER, DIRECTORY_SEPARATOR, $page->getNamespace());
        $destination = $exportFolder . $assetType . DIRECTORY_SEPARATOR . ($subfolder ? $subfolder . DIRECTORY_SEPARATOR : '');
        if (! file_exists($destination)) {
            Filemanager::pathConstruct($destination);
        }
        return $destination;
    }
    
    protected function exportFile(Webapp $webapp, string $route, string $exportFolder) : ExportFioriWebapp
    {
        file_put_contents($exportFolder . $route, $webapp->get($route));
        return $this;
    }
    
    /**
     * Converts non-ASCII characters into unicode escape sequences (\uXXXX).
     * 
     * @param string $str
     * @return string
     */
    protected function escapeUnicode(string $str) : string
    {
        // json_encode automatically escapes unicode, but it also escapes lots of other things
        $string = json_encode($str);
        // convert unicode escape sequences to their HTML equivalents, so they survive json_decode()
        $string = preg_replace('/\\\u([0-9a-f]{4})/i', '&#x$1;', $string);
        // decode JSON to remove all other escaped stuff (newlines, etc.)
        $string = json_decode($string);
        // convert HTML unicode back to \uXXXX notation.
        $string = preg_replace('/&#x([0-9a-f]{4});/i', '\u$1', $string);
        
        return $string;
    }
    
}