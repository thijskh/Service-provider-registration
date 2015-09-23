<?php

namespace AppBundle\Controller\Admin;

use AppBundle\Entity\Subscription;
use AppBundle\Form\Admin\SubscriptionType;
use AppBundle\Model\Contact;
use APY\DataGridBundle\Grid\Action\RowAction;
use APY\DataGridBundle\Grid\Grid;
use APY\DataGridBundle\Grid\Row;
use APY\DataGridBundle\Grid\Source\Entity;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Class GridController
 *
 * @Route("/admin/subscriptions")
 */
class SubscriptionController extends Controller implements SecuredController
{
    /**
     * @Route("/", name="admin.subscription.overview")
     *
     * @return Response
     */
    public function overviewAction()
    {
        return $this->render('admin/subscription/overview.html.twig');
    }

    /**
     * @Route("/grid", name="admin.subscription.grid")
     *
     * @return Response
     */
    public function gridAction()
    {
        return $this->buildGrid()->getGridResponse('admin/subscription/grid.html.twig');
    }

    /**
     * @Route("/new", name="admin.subscription.new")
     *
     * @param Request $request
     *
     * @return Response
     */
    public function newAction(Request $request)
    {
        $subscription = new Subscription();

        $form = $this->createForm(
            new SubscriptionType(),
            $subscription,
            array()
        );

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->get('subscription.manager')->saveSubscription($subscription);

            $this->get('mail.manager')->sendInvitation($subscription);
            $this->get('mail.manager')->sendCreatedNotification($subscription);

            return $this->redirect($this->generateUrl('admin.subscription.overview'));
        }

        return $this->render(
            'admin/subscription/new.html.twig',
            array(
                'subscription' => $subscription,
                'form'         => $form->createView(),
            )
        );
    }

    /**
     * @Route("/{id}", name="admin.subscription.view")
     *
     * @param string $id
     *
     * @return Response
     */
    public function viewAction($id)
    {
        $subscription = $this->get('subscription.manager')->getSubscription($id);

        if (empty($subscription)) {
            throw $this->createNotFoundException();
        }

        return $this->render(
            'admin/subscription/view.html.twig',
            array(
                'subscription' => $subscription,
            )
        );
    }

    /**
     * @Route("/{id}/delete", name="admin.subscription.delete")
     *
     * @param string $id
     *
     * @return Response
     */
    public function deleteAction($id)
    {
        $subscription = $this->get('subscription.manager')->getSubscription($id);

        if (empty($subscription)) {
            throw $this->createNotFoundException();
        }

        $this->get('subscription.manager')->deleteSubscription($subscription);

        return $this->redirect($this->generateUrl('admin.subscription.overview'));
    }

    /**
     * @Route("/{id}/finish", name="admin.subscription.finish")
     *
     * @param string $id
     *
     * @return Response
     */
    public function finishAction($id)
    {
        $subscription = $this->get('subscription.manager')->getSubscription($id);

        if (empty($subscription)) {
            throw $this->createNotFoundException();
        }

        $subscription->finish();

        $this->get('subscription.manager')->updateSubscription($subscription);

        return $this->redirect($this->generateUrl('admin.subscription.overview'));
    }

    /**
     * @Route("/{id}/draft", name="admin.subscription.draft")
     *
     * @param string $id
     *
     * @return Response
     */
    public function draftAction($id)
    {
        $subscription = $this->get('subscription.manager')->getSubscription($id);

        if (empty($subscription)) {
            throw $this->createNotFoundException();
        }

        $subscription->draft();

        $this->get('subscription.manager')->updateSubscription($subscription);

        return $this->redirect($this->generateUrl('admin.subscription.overview'));
    }

    /**
     * @return Grid
     */
    private function buildGrid()
    {
        $grid = $this->get('grid');

        $source = new Entity('AppBundle:Subscription');
        $source->manipulateRow(
            function (Row $row) {
                if ($row->getField('status') == Subscription::STATE_FINISHED) {
                    $row->setClass('success');
                }

                if ($row->getField('status') == Subscription::STATE_PUBLISHED) {
                    $row->setClass('info');
                }

                return $row;
            }
        );
        $grid->setSource($source);

        $grid->getColumn('contact')->manipulateRenderCell(
            function (Contact $contact) {
                $name = trim($contact->getFirstName() . ' ' . $contact->getLastName());

                $email = $contact->getEmail();
                if (!empty($email)) {
                    return $name . ' (' . $email . ')';
                }

                return $name;
            }
        );

        $grid->getColumn('status')->manipulateRenderCell(
            function ($status) {
                switch ($status) {
                    case Subscription::STATE_FINISHED:
                        return 'Finished';

                    case Subscription::STATE_PUBLISHED:
                        return 'Published';

                    case Subscription::STATE_DRAFT:
                        return 'Draft';

                    default:
                        return 'Unknown';
                }
            }
        );

        $this->addRowActions($grid);

        $grid->setId('adminGrid');
        $grid->setRouteUrl($this->generateUrl('admin.subscription.grid'));

        $grid->setDefaultOrder('created', 'desc');
        $grid->setLimits(array(5 => 5, 10 => 10, 15 => 15, 25 => 25, 50 => 50, 99999 => 'all'));

        $grid->setActionsColumnTitle('');
        $grid->setPersistence(true);

        return $grid;
    }

    private function addRowActions(Grid $grid)
    {
        $rowAction = new RowAction('view', 'admin.subscription.view');
        $grid->addRowAction($rowAction);

        $rowAction = new RowAction('delete', 'admin.subscription.delete', true);
        $grid->addRowAction($rowAction);

        $rowAction = new RowAction('edit', 'form', false, '_blank');
        $rowAction->manipulateRender(
            function (RowAction $action, Row $row) {
                if ($row->getField('status') == Subscription::STATE_FINISHED) {
                    return null;
                }

                return $action;
            }
        );
        $grid->addRowAction($rowAction);

        $rowAction = new RowAction('finish', 'admin.subscription.finish');
        $rowAction->manipulateRender(
            function (RowAction $action, Row $row) {
                if ($row->getField('status') !== Subscription::STATE_DRAFT) {
                    return null;
                }

                return $action;
            }
        );
        $grid->addRowAction($rowAction);

        $rowAction = new RowAction('draft', 'admin.subscription.draft');
        $rowAction->manipulateRender(
            function (RowAction $action, Row $row) {
                if ($row->getField('status') !== Subscription::STATE_FINISHED) {
                    return null;
                }

                return $action;
            }
        );
        $grid->addRowAction($rowAction);
    }
}
