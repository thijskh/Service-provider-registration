<?php
namespace AppBundle\Validator\Constraints;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

/**
 * Class ValidSSLCertificateValidator
 */
class ValidSSLCertificateValidator extends ConstraintValidator
{
    /**
     * @param mixed      $value
     * @param Constraint $constraint
     */
    public function validate($value, Constraint $constraint)
    {
        $cert = openssl_x509_parse($value);

        if ($cert === false) {
            $this->context->addViolation($constraint->message);

            return;
        }

        openssl_x509_export($value, $cert, false);

        if (!preg_match('~(\d+) bit~', $cert, $matches)) {
            $this->context->addViolation('Cannot determine key length');

            return;
        }

        if ($matches[1] < 2048) {
            $this->context->addViolation('Invalid key length');

            return;
        }
    }
}