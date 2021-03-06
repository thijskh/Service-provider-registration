<?php

namespace AppBundle\Controller;

use AppBundle\Entity\Subscription;
use AppBundle\Validator\SubscriptionValidator;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Class ProductionDraftController
 * @package AppBundle\Controller
 *
 * @Route("/production/subscription")
 */
final class ProductionDraftController extends Controller
{
    /**
     * @Method({"GET","POST"})
     * @Route("/{id}/draft", name="production_draft_edit")
     * @ParamConverter("subscription", converter="synchronized_subscription")
     */
    public function editAction(Subscription $subscription, Request $request)
    {
        SubscriptionValidator::create($subscription)
            ->isForEnvironment(Subscription::ENVIRONMENT_PRODUCTION)
            ->isOfStatus(Subscription::STATE_DRAFT);

        $originalSubscription = clone $subscription;

        $form = $this->get('subscription.form.factory')->buildForm($subscription, $request);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            if (!$this->get('lock.manager')->lock($subscription->getId())) {
                throw new BadRequestHttpException('Subscription is locked to another session');
            }

            $this->get('subscription.repository')->update(
                $originalSubscription,
                $subscription
            );
            return $this->redirectToRoute(
                'production_finish',
                array('id' => $subscription->getId())
            );
        }

        return $this->render(
            ':subscription/production:draft_edit.html.twig',
            array(
                'subscription' => $subscription,
                'form'         => $form->createView(),
                'locked'       => !$this->get('lock.manager')->lock($subscription->getId()),
            )
        );
    }

    /**
     * @Method({"POST"})
     * @Route("/{id}/draft/save", name="production_draft_save")
     * @ParamConverter("subscription", converter="synchronized_subscription")
     */
    public function saveAction(Subscription $subscription, Request $request)
    {
        SubscriptionValidator::create($subscription)
            ->isForEnvironment(Subscription::ENVIRONMENT_PRODUCTION)
            ->isOfStatus(Subscription::STATE_DRAFT);

        if (!$this->get('lock.manager')->lock($subscription->getId())) {
            throw new BadRequestHttpException('Subscription is locked to another session');
        }

        $originalSubscription = clone $subscription;

        $form = $this->get('subscription.form.factory')->buildForm($subscription, $request);
        $form->handleRequest($request);

        if (!$form->isSubmitted()) {
            return new Response();
        }

        $this->get('subscription.repository')->update(
            $originalSubscription,
            $subscription
        );

        return new Response();
    }
}
