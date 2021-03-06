<?php

use Symfony\Component\HttpKernel\Kernel;
use Symfony\Component\Config\Loader\LoaderInterface;

class AppKernel extends Kernel
{
    public function registerBundles()
    {
        $bundles = array(
            new Symfony\Bundle\FrameworkBundle\FrameworkBundle(),
            new Symfony\Bundle\SecurityBundle\SecurityBundle(),
            new Symfony\Bundle\TwigBundle\TwigBundle(),
            new Symfony\Bundle\MonologBundle\MonologBundle(),
            new Symfony\Bundle\SwiftmailerBundle\SwiftmailerBundle(),
            new Symfony\Bundle\AsseticBundle\AsseticBundle(),
            new Doctrine\Bundle\DoctrineBundle\DoctrineBundle(),
            new Sensio\Bundle\FrameworkExtraBundle\SensioFrameworkExtraBundle(),

            new Norzechowicz\AceEditorBundle\NorzechowiczAceEditorBundle(),
            new Doctrine\Bundle\DoctrineCacheBundle\DoctrineCacheBundle(),
            new Doctrine\Bundle\MigrationsBundle\DoctrineMigrationsBundle(),
            new Braincrafted\Bundle\BootstrapBundle\BraincraftedBootstrapBundle(),
            new APY\DataGridBundle\APYDataGridBundle(),
            new Misd\GuzzleBundle\MisdGuzzleBundle(),
            new Knp\Bundle\MenuBundle\KnpMenuBundle(),
            new Stof\DoctrineExtensionsBundle\StofDoctrineExtensionsBundle(),
            new Lexik\Bundle\TranslationBundle\LexikTranslationBundle(),
            new Doctrine\Bundle\FixturesBundle\DoctrineFixturesBundle(),
            new Stfalcon\Bundle\TinymceBundle\StfalconTinymceBundle(),
            new Exercise\HTMLPurifierBundle\ExerciseHTMLPurifierBundle(),
            new Ob\HighchartsBundle\ObHighchartsBundle(),
            new SmartCore\Bundle\AcceleratorCacheBundle\AcceleratorCacheBundle(),

            new AppBundle\AppBundle()
        );

        if (in_array($this->getEnvironment(), array('dev', 'test'))) {
            $bundles[] = new Symfony\Bundle\DebugBundle\DebugBundle();
            $bundles[] = new Symfony\Bundle\WebProfilerBundle\WebProfilerBundle();
            $bundles[] = new Sensio\Bundle\DistributionBundle\SensioDistributionBundle();
            $bundles[] = new Sensio\Bundle\GeneratorBundle\SensioGeneratorBundle();
        }

        return $bundles;
    }

    public function registerContainerConfiguration(LoaderInterface $loader)
    {
        $loader->load(__DIR__.'/config/config_'.$this->getEnvironment().'.yml');
    }

    public function getCacheDir()
    {
        if (in_array($this->environment, array('dev', 'test'))) {
            return '/dev/shm/app/cache/' . $this->environment;
        }

        return parent::getCacheDir();
    }

    public function getLogDir()
    {
        if (in_array($this->environment, array('dev', 'test'))) {
            return '/dev/shm/app/logs';
        }

        return parent::getLogDir();
    }
}
