<?php

require '../sources/Workflow.php';

class WorkflowController extends RESTfulResponse
{
    private $API_VERSION = 1;    // Integer
    public $index = array();

    private $workflow;

    function __construct($db, $login)
    {
        $this->workflow = new Workflow($db, $login);
    }

    public function get($act)
    {
        $workflow = $this->workflow;

        $this->index['GET'] = new ControllerMap();
        $cm = $this->index['GET'];
        $this->index['GET']->register('workflow/version', function() {
            return $this->API_VERSION;
        });

        $this->index['GET']->register('workflow', function($args) use ($workflow) {
            $workflow->setWorkflowID($args[0]);
            return $workflow->getAllUniqueWorkflows();
        });
        
        $this->index['GET']->register('workflow/[digit]', function($args) use ($workflow) {
            $workflow->setWorkflowID($args[0]);
            return $workflow->getSteps();
        });

        $this->index['GET']->register('workflow/[digit]/route', function($args) use ($workflow) {
            $workflow->setWorkflowID($args[0]);
            return $workflow->getRoutes();
        });

        $this->index['GET']->register('workflow/[digit]/map/summary', function($args) use ($workflow) {
        	$workflow->setWorkflowID($args[0]);
        	return $workflow->getSummaryMap();
        });

        $this->index['GET']->register('workflow/[digit]/step/[digit]/[text]/events', function($args) use ($workflow) {
            $workflow->setWorkflowID($args[0]);
            return $workflow->getEvents($args[1], $args[2]);
        });

        $this->index['GET']->register('workflow/categories', function($args) use ($workflow) {
            return $workflow->getCategories();
        });
        
       	$this->index['GET']->register('workflow/categoriesUnabridged', function($args) use ($workflow) {
       		return $workflow->getCategoriesUnabridged();
       	});

		$this->index['GET']->register('workflow/dependencies', function($args) use ($workflow) {
			return $workflow->getAllDependencies();
		});

        $this->index['GET']->register('workflow/step/[digit]/dependencies', function($args) use ($workflow) {
            return $workflow->getDependencies($args[0]);
        });

		$this->index['GET']->register('workflow/actions', function($args) use ($workflow) {
			return $workflow->getActions();
		});

		$this->index['GET']->register('workflow/events', function($args) use ($workflow) {
			return $workflow->getAllEvents();
		});

		$this->index['GET']->register('workflow/steps', function($args) use ($workflow) {
			return $workflow->getAllSteps();
		});

        return $this->index['GET']->runControl($act['key'], $act['args']);
    }

    public function post($act)
    {
        $workflow = $this->workflow;

        $this->verifyAdminReferrer();

        $this->index['POST'] = new ControllerMap();
        $this->index['POST']->register('workflow', function($args) {
        });
        
        $this->index['POST']->register('workflow/[digit]', function($args) use ($workflow) {
            try {
                $workflow->modify($args[0]);
            } catch (Exception $e) {
                return $e->getMessage();
            }
            return true;
        });

		$this->index['POST']->register('workflow/new', function($args) use ($workflow) {
			return $workflow->newWorkflow($_POST['description']);
		});

        $this->index['POST']->register('workflow/[digit]/editorPosition', function($args) use ($workflow) {
        	$workflow->setWorkflowID($args[0]);
        	return $workflow->setEditorPosition($_POST['stepID'], $_POST['x'], $_POST['y']);
        });

		$this->index['POST']->register('workflow/[digit]/action', function($args) use ($workflow) {
			$workflow->setWorkflowID($args[0]);
			return $workflow->createAction($_POST['stepID'], $_POST['nextStepID'], $_POST['action']);
		});

		$this->index['POST']->register('workflow/[digit]/step', function($args) use ($workflow) {
			$workflow->setWorkflowID($args[0]);
			return $workflow->createStep($_POST['stepTitle'], $_POST['stepBgColor'], $_POST['stepFontColor']);
		});

		$this->index['POST']->register('workflow/[digit]/initialStep', function($args) use ($workflow) {
			$workflow->setWorkflowID($args[0]);
			return $workflow->setInitialStep($_POST['stepID']);
		});

		$this->index['POST']->register('workflow/step/[digit]', function($args) use ($workflow) {
			return $workflow->updateStep($args[0], $_POST['title']);
		});

		$this->index['POST']->register('workflow/step/[digit]/dependencies', function($args) use ($workflow) {
			return $workflow->linkDependency($args[0], $_POST['dependencyID']);
		});

		$this->index['POST']->register('workflow/step/[digit]/indicatorID_for_assigned_empUID', function($args) use ($workflow) {
			return $workflow->setDynamicApprover($args[0], $_POST['indicatorID']);
		});

		$this->index['POST']->register('workflow/step/[digit]/indicatorID_for_assigned_groupID', function($args) use ($workflow) {
			return $workflow->setDynamicGroupApprover($args[0], $_POST['indicatorID']);
		});

		$this->index['POST']->register('workflow/dependencies', function($args) use ($workflow) {
			return $workflow->addDependency($_POST['description']);
		});

		$this->index['POST']->register('workflow/dependency/[digit]', function($args) use ($workflow) {
			return $workflow->updateDependency($args[0], $_POST['description']);
		});

		$this->index['POST']->register('workflow/dependency/[digit]/privileges', function($args) use ($workflow) {
			return $workflow->grantDependencyPrivs($args[0], $_POST['groupID']);
		});

		$this->index['POST']->register('workflow/[digit]/step/[digit]/[text]/events', function($args) use ($workflow) {
			$workflow->setWorkflowID($args[0]);
			return $workflow->linkEvent($args[1], $args[2], $_POST['eventID']);
		});

        return $this->index['POST']->runControl($act['key'], $act['args']);
    }
    
    public function delete($act)
    {
    	$workflow = $this->workflow;

    	$this->verifyAdminReferrer();

    	$this->index['DELETE'] = new ControllerMap();
    	$this->index['DELETE']->register('workflow', function($args) {
    	});

    	$this->index['DELETE']->register('workflow/[digit]', function($args) use ($workflow) {
    		return $workflow->deleteWorkflow($args[0]);
    	});

		$this->index['DELETE']->register('workflow/[digit]/step/[digit]/[text]/[digit]', function($args) use ($workflow) {
			$workflow->setWorkflowID($args[0]);
			return $workflow->deleteAction($args[1], $args[3], $args[2]);
		});

		$this->index['DELETE']->register('workflow/step/[digit]/dependencies', function($args) use ($workflow) {
			return $workflow->unlinkDependency($args[0], $_GET['dependencyID']);
		});

		$this->index['DELETE']->register('workflow/dependency/[digit]/privileges', function($args) use ($workflow) {
			return $workflow->revokeDependencyPrivs($args[0], $_GET['groupID']);
		});

		$this->index['DELETE']->register('workflow/[digit]/step/[digit]/[text]/events', function($args) use ($workflow) {
			$workflow->setWorkflowID($args[0]);
			return $workflow->unlinkEvent($args[1], $args[2], $_GET['eventID']);
		});
		
		$this->index['DELETE']->register('workflow/step/[digit]', function($args) use ($workflow) {
			return $workflow->deleteStep($args[0]);
		});

		return $this->index['DELETE']->runControl($act['key'], $act['args']);
    }
}

