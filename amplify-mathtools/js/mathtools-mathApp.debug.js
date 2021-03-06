
if (!window.mt) {
    window.mt = {};
}

window.mt.mathApp = {};

angular.module('mtMathApp', ['mtWorkspace', 'ui.router']);

(function (ns) {
    'use strict';

    angular.module('mtMathApp')
        .config(function ($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise('/workspace');

            $stateProvider
                .state('workspace', {
                    url: '/workspace',
                    templateUrl: 'templates/workspacePartial.html'
                });
        })
        // persist query params between state transitions
        // based on https://github.com/angular-ui/ui-router/issues/202
        .run(function ($rootScope, $location, eventingService) {
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                //save location.search so we can add it back after transition is done
                $rootScope.locationSearch = $location.search();

                //making lesson changes clear out our subscribers
                if(toParams.unitId !== fromParams.unitId || toParams.lessonId !== fromParams.lessonId) {
                    eventingService.removeAllSubscribers();
                }
            });

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                //restore all query string parameters back to $location.search
                $location.search($rootScope.locationSearch);
            });
        });

})(window.mt.mathApp);

(function (ns) {
    'use strict';

   angular.module('mtWorkspace').directive('mtGlobalToolbar', function ($stateParams, annotationService, roleService, globalMenuService, workspaceSelectionService, toolMenuService, mtTourService, workspaceAbstractService, undoService, mtHelpService) {
        return {
            restrict: 'E',
            templateUrl: 'templates/mtGlobalToolbarTemplate.html',
            replace: true,
            link: function(scope, element, attrs) {


                //exposing the pen service and calling into it directly from template
                scope.annotationService = annotationService;

                //exposing the global menu service and calling into it directly from template
                scope.globalMenuService = globalMenuService;

                //exposing the workspace selection service and calling into it directly from template
                scope.workspaceSelectionService = workspaceSelectionService;

                scope.hideNav = false;

                scope.menus = {
                    global: {
                        isOpen: false
                    },
                    settings: {
                        isOpen: false
                    }
                };

                scope.isContentAuthor = false;
                if(roleService.getRole() === mt.common.TEACHER_ROLE) {
                    scope.sectionTitle = 'Teacher Workspace';
                } else if(roleService.getRole() === mt.common.STUDENT_ROLE) {
                    scope.sectionTitle = 'Student Workspace';
                } else {
                    scope.sectionTitle = 'Authoring Workspace';
                    scope.isContentAuthor = true;
                }

                function deselectAll() {
                    annotationService.togglePenMenu(false);
                    workspaceSelectionService.toggleSelector(false);
                    annotationService.toggleActive(false);
                    toolMenuService.toggleToolListMenu(false);
                    scope.menus.settings.isOpen = false;
                    scope.menus.global.isOpen = false;
                }

                scope.toggleAnnotations = function (isHeld) {
                    isHeld = (isHeld === undefined)? !annotationService.isActive(): isHeld;
                    deselectAll();
                    annotationService.toggleActive(isHeld);
                };

                scope.toggleToolMenu = function () {
                    mtTourService.nextStep('workspace', 'openTool');
                    var setToolList = !toolMenuService.isToolListMenuOpen();
                    deselectAll();
                    toolMenuService.toggleToolListMenu(setToolList);
                };

                scope.isToolMenuOpen = function() {
                    return toolMenuService.isToolListMenuOpen();
                };

                scope.toggleHelpOverlay = function() {
                    mtHelpService.setActive(!mtHelpService.isActive());
                };

                function setSectionTitle(event, toState, toParams, fromState, fromParams) {
                    if (toParams.unitId !== undefined && toParams.lessonId !== undefined) {
                        scope.sectionTitle = _('Unit %s, Lesson %s').sprintf(toParams.unitId, toParams.lessonId);
                        if(roleService.getRole() === mt.common.TEACHER_ROLE) {
                            scope.sectionTitle += ': Teacher';
                        }
                    }
                }

                function setMenuState(menuId, isOpen) {
                    _(scope.menus).chain().keys().each(function (currentMenuId) {
                        var menu = scope.menus[currentMenuId];
                        menu.isOpen = (currentMenuId === menuId) && isOpen;
                    });
                }

                function toggleNav() {
                    scope.hideNav = !scope.hideNav;
                    scope.$broadcast('toggleNB');
                }

                scope.tapMenu = function (menuId) {
                    setMenuState(menuId, !scope.menus[menuId].isOpen);
                };

                scope.undo = function() {
                    undoService.undo();
                };

                scope.redo = function() {
                    undoService.redo();
                };

                // convenience wrapper to close all menus
                scope.closeMenu = _(setMenuState).partial(undefined, undefined);

                scope.$on('$stateChangeStart', setSectionTitle);

                scope.$on('toggleNav', toggleNav);

                scope.toggleAbstract = function() {
                    workspaceAbstractService.toggle();
                };

                scope.isAbstractOpen = function() {
                    return workspaceAbstractService.isOpen();
                };

                scope.submitWorkspace = function() {
                    workspaceAbstractService.submitWorkspace();
                };

                scope.abstractEnabled = workspaceAbstractService.isEnabled;

                //setSectionTitle(undefined, undefined, $stateParams, undefined, undefined);
            }
        };
    });
})(window.mt.mathApp);

angular.module('mtMathApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/mtGlobalToolbarTemplate.html',
    "<div class=mt-global-toolbar ng-class=\"{'mt-hidden': hideNav}\"><div class=\"mt-nav-section mt-nav-section-left\"><div class=mt-global-icon ng-show=abstractEnabled() ng-class=\"{'mt-global-icon-toggled':isAbstractOpen()}\" hm-tap=toggleAbstract()><svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=64px height=44px viewbox=\"0 0 64 44\" xml:space=preserve aria-labeledby=\"abstractTitle abstractDesc\" role=img><title id=abstractTitle>Lesson abstract button</title><desc id=abstractDesc>A button that opens the lesson abstract to provide context in the workbook.</desc><rect x=21 y=13 width=1 height=11></rect><circle cx=42 cy=16 r=2></circle><polygon points=\"17,10 17,27 35,27 35,25 19,25 19,12 35,12 35,14 37,14 37,10 \"></polygon><g><path d=\"M48,24c0,1.542-1.458,3-3,3h-4c-0.553,0-1-0.447-1-1s0.447-1,1-1h4c0.448,0,1-0.551,1-1h-3.021H41\n" +
    "                        c-1.103,0-2,0.896-2,2s0.897,2,2,2h5v9.5c0,0.828-0.672,1.5-1.5,1.5H43v-1.994V31c0-0.553-0.447-1-1-1s-1,0.447-1,1v6.5\n" +
    "                        c0,0.828-0.672,1.5-1.5,1.5H38v-3.994V24c-5.655,0-6.854-4.395-6.948-4.678c-0.175-0.524,0.108-1.09,0.632-1.265\n" +
    "                        c0.524-0.174,1.063,0.111,1.261,0.619c0.084,0.216,0.552,1.97,3.648,1.97c1.595,0,2.907-1.642,5.407-1.646\n" +
    "                        C45,18.995,48,20.719,48,24z\"></path></g></svg></div><div class=mt-global-separator ng-show=abstractEnabled()></div><div class=mt-nav-text><svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=185px height=44px xml:space=preserve aria-labeledby=\"navTextTitle navTextDesc\" role=text><title id=navTextTitle>Role Text</title><desc id=navTextDesc>Gray text that identifies which workspace you are currently in.</desc><text ng-bind=sectionTitle x=0 y=30px></text></svg></div></div><div class=\"mt-nav-section mt-nav-section-center\"><div class=mt-global-icon ng-class=\"{'mt-global-icon-toggled':isToolMenuOpen()}\" hm-tap=toggleToolMenu()><svg class=mt-global-icon-tools version=1.1 id=toolSelect xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=64px height=44px viewbox=\"0 0 64 44\" xml:space=preserve aria-labeledby=\"toolMenuTitle toolMenuDesc\" role=img><title id=toolMenuTitle>Tool list menu button</title><desc id=toolMenuDesc>This button opens the menu that lists out the available tools for selection.</desc><path d=\"M48.5,13h-18c-1.381,0-2.5,1.119-2.5,2.5V36h23V15.5C51,14.119,49.881,13,48.5,13z M49,34H30V19h19V34z\"></path><path d=\"M22,18h-5v-5c0-0.552-0.447-1-1-1s-1,0.448-1,1v5h-5c-0.553,0-1,0.448-1,1s0.447,1,1,1h5v5\n" +
    "                c0,0.553,0.447,1,1,1s1-0.447,1-1v-5h5c0.553,0,1-0.448,1-1S22.553,18,22,18z\"></path></svg></div><div class=mt-global-icon ng-class=\"{'mt-global-icon-toggled':annotationService.isActive()}\"><svg class=mt-global-icon-pen hm-tap=toggleAnnotations() xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=64px height=44px viewbox=\"0 0 64 44\" xml:space=preserve aria-labeledby=\"penTitle penDesc\" role=img><title id=penTitle>Annotation button</title><desc id=penDesc>A pencil that allows you to draw or write on the workbook.</desc><g><path d=\"M42.311,19.338l-10.665-7.109l4.077-6.115l10.664,7.109L42.311,19.338z M34.419,11.674l7.336,4.891\n" +
    "                        l1.858-2.787l-7.336-4.891L34.419,11.674z\"></path><path d=\"M22,37V26.697l8.536-12.805l10.664,7.11L32.643,33.84L22,37z M24,27.303V34l7.358-1.84l7.068-10.604\n" +
    "                        l-7.336-4.891L24,27.303z\"></path></g></svg></div></div><div class=\"mt-nav-section mt-nav-section-right\"><div class=mt-global-icon><svg class=mt-global-icon-redo hm-tap=redo() version=1.1 id=redo xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=64px height=44px viewbox=\"0 0 64 44\" xml:space=preserve aria-labeledby=\"redoTitle redoDesc\" role=img><title id=redoTitle>Redo button</title><desc id=redoDesc>A handy button that reverses an undo action.</desc><path d=\"M45.707,29.293l-8-8c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414L42.586,29H28\n" +
    "                    c-4.411,0-8-3.589-8-8s3.589-8,8-8h14c0.553,0,1-0.448,1-1s-0.447-1-1-1H28c-5.514,0-10,4.486-10,10c0,5.514,4.486,10,10,10h14.586\n" +
    "                    l-6.293,6.293c-0.391,0.391-0.391,1.023,0,1.414C36.488,38.902,36.744,39,37,39s0.512-0.098,0.707-0.293l8-8\n" +
    "                    C46.098,30.316,46.098,29.684,45.707,29.293z\"></path></svg></div><div class=mt-global-icon><svg class=mt-global-icon-undo hm-tap=undo() version=1.1 id=undo xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=64px height=44px viewbox=\"0 0 64 44\" xml:space=preserve aria-labeledby=\"undoTitle undoDesc\" role=img><title id=undoTitle>Undo button</title><desc id=undoDesc>A handy button that reverses the most recent action.</desc><path d=\"M18.293,15.707l8,8c0.391,0.391,1.023,0.391,1.414,0s0.391-1.023,0-1.414L21.414,16H36c4.411,0,8,3.589,8,8\n" +
    "                    s-3.589,8-8,8H22c-0.553,0-1,0.447-1,1s0.447,1,1,1h14c5.514,0,10-4.486,10-10c0-5.514-4.486-10-10-10H21.414l6.293-6.293\n" +
    "                    c0.391-0.391,0.391-1.023,0-1.414C27.512,6.098,27.256,6,27,6s-0.512,0.098-0.707,0.293l-8,8\n" +
    "                    C17.902,14.684,17.902,15.316,18.293,15.707z\"></path></svg></div><div class=mt-global-icon ng-show=abstractEnabled() hm-tap=submitWorkspace()><svg version=1.1 xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=66px height=44px xml:space=preserve aria-labeledby=\"submitTitle submitDesc\" role=text><title id=submitTitle>Submit Text</title><desc id=submitDesc>Gray text that submits the current workspace to the teacher.</desc><text x=0 y=30px font-size=20px>Submit</text></svg></div><div class=mt-global-icon><svg class=mt-global-help-overlay hm-tap=toggleHelpOverlay() version=1.1 id=help xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=64px height=44px viewbox=\"0 0 64 44\" xml:space=preserve aria-labeledby=\"helpTitle helpDesc\" role=img><title id=helpTitle>Help button</title><desc id=helpDesc>A button that toggles the help overlay.</desc><text x=25px y=30px font-size=24px>?</text></svg></div><div class=\"mt-global-settings-container mt-global-icon\" ng-class=\"{'mt-global-icon-toggled':menus.settings.isOpen}\"><svg class=mt-global-icon-settings hm-tap=\"tapMenu('settings')\" version=1.1 id=settings xmlns=http://www.w3.org/2000/svg xmlns:xlink=http://www.w3.org/1999/xlink x=0px y=0px width=64px height=44px viewbox=\"0 0 64 44\" xml:space=preserve aria-labeledby=\"settingsTitle settingsDesc\" role=img><title id=settingsTitle>Settings button</title><desc id=settingsDesc>A button that opens the settings menu in a dropdown list.</desc><g><g><path d=\"M46,25.256v-4.669l-4.115-1.335l-0.549-1.33l1.863-3.932l-3.29-3.295l-3.867,1.948l-1.321-0.546L33.249,8\n" +
    "                            h-4.643l-1.364,4.115l-1.32,0.55l-3.944-1.871l-3.306,3.312l1.979,3.845l-0.56,1.331L16,20.751v4.651l4.108,1.354l0.553,1.319\n" +
    "                            l-1.87,3.939l3.283,3.278l3.875-1.938l1.328,0.553L28.743,38h4.65l1.354-4.109l1.327-0.555l3.943,1.869l3.291-3.307l-1.96-3.851\n" +
    "                            l0.553-1.327L46,25.256z M40.776,31.5l-1.194,1.199l-3.452-1.635l-3.061,1.274L32,36l-2.061-0.014l-1.016-3.644l-3.062-1.272\n" +
    "                            l-3.362,1.713l-1.202-1.203l1.639-3.452l-1.279-3.052L18,24v-2l3.652-1.073l1.287-3.062l-1.722-3.37l1.194-1.195l3.455,1.64\n" +
    "                            l3.055-1.275L30,10h2l1.077,3.665l3.053,1.262l3.366-1.707l1.201,1.202l-1.633,3.443l1.268,3.063L44,22v2l-3.662,1.074\n" +
    "                            l-1.273,3.062L40.776,31.5z\"></path></g></g><path d=\"M31,28c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S33.757,28,31,28z M31,20c-1.654,0-3,1.346-3,3\n" +
    "                s1.346,3,3,3s3-1.346,3-3S32.654,20,31,20z\"></svg><mt-global-settings ng-show=menus.settings.isOpen></mt-global-settings></div></div></div>"
  );

}]);
