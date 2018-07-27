<?php

declare(strict_types = 1);
include '../../LEAF_Request_Portal/db_mysql.php';
include '../../LEAF_Request_Portal/db_config.php';
use LEAFTest\LEAFClient;


/**
 * Tests LEAF_Request_Portal/api/?a=system API
 */
final class SystemControllerTest extends DatabaseTest
{
    private static $reqClient = null;
    private static $db;

    public static function setUpBeforeClass()
    {
        $db_config = new DB_Config();
        self::$db = new DB($db_config->dbHost, $db_config->dbUser, $db_config->dbPass, $db_config->dbName);
        self::$reqClient = LEAFClient::createRequestPortalClient();
    }

    protected function setUp()
    {
        $this->resetDatabase();
    }

    /**
     * Tests the `system/dbversion` endpoint.
     */
    public function testGetDatabaseVersion() : void
    {
        $version = self::$reqClient->get(array('a'=>'system/dbversion'));

        $this->assertNotNull($version);
        $this->assertEquals("3848", $version);
    }

    /**
     * Tests the `system/settings/heading` endpoint.
     */
    public function testHeading() : void
    {
        self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => "New Heading"));
        $fromDB = $this->getSetting("heading");
        $this->assertNotNull($fromDB);
        $this->assertEquals("New Heading", $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => "Heading that is too long for the field and this is very long"));
        $fromDB = $this->getSetting("heading");
        $this->assertNotNull($fromDB);
        $this->assertEquals("Heading that is too long for the field and this is", $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => "LEAF's Header"));
        $fromDB = $this->getSetting("heading");
        $this->assertNotNull($fromDB);
        $this->assertEquals("LEAF&#039;s Header", $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => NULL));
        $fromDB = $this->getSetting("heading");
        $this->assertNotNull($fromDB);
        $this->assertEquals("", $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => 'Header "Header" Header'));
        $fromDB = $this->getSetting("heading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('Header &quot;Header&quot; Header', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => 'HEADER > header'));
        $fromDB = $this->getSetting("heading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('HEADER &gt; header', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => 'HEADER < header'));
        $fromDB = $this->getSetting("heading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('HEADER &lt; header', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => ''));
        $fromDB = $this->getSetting("heading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => ' '));
        $fromDB = $this->getSetting("heading");
        $this->assertNotNull($fromDB);
        $this->assertEquals(' ', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => '  '));
        $fromDB = $this->getSetting("heading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('  ', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => '    '));
        $fromDB = $this->getSetting("heading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('    ', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => 0));
        $fromDB = $this->getSetting("heading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('0', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => 123456789));
        $fromDB = $this->getSetting("heading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('123456789', $fromDB);
    }

    /**
     * Tests the `system/settings/heading` endpoint.
     */
    public function testHeading_HTMLinput() : void
    {
        //tags that are sanitized or otherwise more complex than <TAG></TAG>
        $complexTags = array(

            '<script>Heading</script>' => '&lt;script&gt;Heading&lt;/script&gt;',
            "<a href='google.com'>H</a>" => '&lt;a href=&#039;google.com&#039;&gt;H&lt;/a&gt;',
            '<h1>Heading</h1>' => '&lt;h1&gt;Heading&lt;/h1&gt;',
            '<h2>Heading</h2>' => '&lt;h2&gt;Heading&lt;/h2&gt;',
            '<h3>Heading</h3>' => '&lt;h3&gt;Heading&lt;/h3&gt;',
            '<h4>Heading</h4>' => '&lt;h4&gt;Heading&lt;/h4&gt;',
            '<img>Heading</img>' => '&lt;img&gt;Heading&lt;/img&gt;',
            '<col>Heading</col>' => '&lt;col&gt;Heading&lt;/col&gt;',
            'Over<br />Under' => 'Over<br />Under',
            '<font color="red">Heading</font>' => '<font color="red">Heading</font>',
            '<table>Head</table>' => '<table class="table">Head</table>'

        );

        //tags that conform to <TAG></TAG>
        $simpleTags = array(
            'b', 
            'i', 
            'u', 
            'ol', 
            'ul', 
            'li', 
            'p',
            'span', 
            'strong',
            'em', 
            'center',
            'td', 
            'tr', 
            'thead', 
            'tbody', 
            'span', 
            'strong', 
            'em',
            'colgroup', 
        );

        foreach($complexTags as $unsanitized => $sanitized)
        {
            self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => $unsanitized));
            $fromDB = $this->getSetting("heading");
            $this->assertNotNull($fromDB);
            $this->assertEquals($sanitized, $fromDB);
        }
        
        foreach($simpleTags as $tag)
        {
            self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => "<$tag>Heading</$tag>"));
            $fromDB = $this->getSetting("heading");
            $this->assertNotNull($fromDB);
            $this->assertEquals("<$tag>Heading</$tag>", $fromDB);
        }

        foreach($simpleTags as $tag)
        {
            self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => "<$tag>Heading"));
            $fromDB = $this->getSetting("heading");
            $this->assertNotNull($fromDB);
            $this->assertEquals("<$tag>Heading</$tag>", $fromDB);
        }

        foreach($simpleTags as $tag)
        {
            self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => "Heading</$tag>"));
            $fromDB = $this->getSetting("heading");
            $this->assertNotNull($fromDB);
            $this->assertEquals("<$tag>Heading</$tag>", $fromDB);
        }

        foreach($simpleTags as $tag)
        {
            self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => "<$tag>New Heading"));
            $fromDB = $this->getSetting("heading");
            $this->assertNotNull($fromDB);
            $this->assertEquals("<$tag>New Heading</$tag>", $fromDB);
        }

        foreach($simpleTags as $tag)
        {
            self::$reqClient->post(array('a'=>'system/settings/heading'), array('heading' => "New Heading</$tag>"));
            $fromDB = $this->getSetting("heading");
            $this->assertNotNull($fromDB);
            $this->assertEquals("<$tag>New Heading</$tag>", $fromDB);
        }
    }

    /**
     * Tests the `system/settings/subHeading` endpoint.
     */
    public function testSubHeading() : void
    {
        self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => "New Heading"));
        $fromDB = $this->getSetting("subheading");
        $this->assertNotNull($fromDB);
        $this->assertEquals("New Heading", $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => "Heading that is too long for the field and this is very long"));
        $fromDB = $this->getSetting("subheading");
        $this->assertNotNull($fromDB);
        $this->assertEquals("Heading that is too long for the field and this is", $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => "LEAF's Header"));
        $fromDB = $this->getSetting("subheading");
        $this->assertNotNull($fromDB);
        $this->assertEquals("LEAF&#039;s Header", $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => NULL));
        $fromDB = $this->getSetting("subheading");
        $this->assertNotNull($fromDB);
        $this->assertEquals("", $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => 'Header "Header" Header'));
        $fromDB = $this->getSetting("subheading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('Header &quot;Header&quot; Header', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => 'HEADER > header'));
        $fromDB = $this->getSetting("subheading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('HEADER &gt; header', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => 'HEADER < header'));
        $fromDB = $this->getSetting("subheading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('HEADER &lt; header', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => ''));
        $fromDB = $this->getSetting("subheading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => ' '));
        $fromDB = $this->getSetting("subheading");
        $this->assertNotNull($fromDB);
        $this->assertEquals(' ', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => '  '));
        $fromDB = $this->getSetting("subheading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('  ', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => '    '));
        $fromDB = $this->getSetting("subheading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('    ', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => 0));
        $fromDB = $this->getSetting("subheading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('0', $fromDB);

        self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => 123456789));
        $fromDB = $this->getSetting("subheading");
        $this->assertNotNull($fromDB);
        $this->assertEquals('123456789', $fromDB);
    }

    /**
     * Tests the `system/settings/subHeading` endpoint.
     */
    public function testSubHeading_HTMLinput() : void
    {
        //tags that are sanitized or otherwise more complex than <TAG></TAG>
        $complexTags = array(

            '<script>Heading</script>' => '&lt;script&gt;Heading&lt;/script&gt;',
            "<a href='google.com'>H</a>" => '&lt;a href=&#039;google.com&#039;&gt;H&lt;/a&gt;',
            '<h1>Heading</h1>' => '&lt;h1&gt;Heading&lt;/h1&gt;',
            '<h2>Heading</h2>' => '&lt;h2&gt;Heading&lt;/h2&gt;',
            '<h3>Heading</h3>' => '&lt;h3&gt;Heading&lt;/h3&gt;',
            '<h4>Heading</h4>' => '&lt;h4&gt;Heading&lt;/h4&gt;',
            '<img>Heading</img>' => '&lt;img&gt;Heading&lt;/img&gt;',
            '<col>Heading</col>' => '&lt;col&gt;Heading&lt;/col&gt;',
            'Over<br />Under' => 'Over<br />Under',
            '<font color="red">Heading</font>' => '<font color="red">Heading</font>',
            '<table>Head</table>' => '<table class="table">Head</table>'

        );

        //tags that conform to <TAG></TAG>
        $simpleTags = array(
            'b', 
            'i', 
            'u', 
            'ol', 
            'ul', 
            'li', 
            'p',
            'span', 
            'strong',
            'em', 
            'center',
            'td', 
            'tr', 
            'thead', 
            'tbody', 
            'span', 
            'strong', 
            'em',
            'colgroup', 
        );

        foreach($complexTags as $unsanitized => $sanitized)
        {
            self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => $unsanitized));
            $fromDB = $this->getSetting("subheading");
            $this->assertNotNull($fromDB);
            $this->assertEquals($sanitized, $fromDB);
        }
        
        foreach($simpleTags as $tag)
        {
            self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => "<$tag>Heading</$tag>"));
            $fromDB = $this->getSetting("subheading");
            $this->assertNotNull($fromDB);
            $this->assertEquals("<$tag>Heading</$tag>", $fromDB);
        }

        foreach($simpleTags as $tag)
        {
            self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => "<$tag>Heading"));
            $fromDB = $this->getSetting("subheading");
            $this->assertNotNull($fromDB);
            $this->assertEquals("<$tag>Heading</$tag>", $fromDB);
        }

        foreach($simpleTags as $tag)
        {
            self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => "Heading</$tag>"));
            $fromDB = $this->getSetting("subheading");
            $this->assertNotNull($fromDB);
            $this->assertEquals("<$tag>Heading</$tag>", $fromDB);
        }

        foreach($simpleTags as $tag)
        {
            self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => "<$tag>New Heading"));
            $fromDB = $this->getSetting("subheading");
            $this->assertNotNull($fromDB);
            $this->assertEquals("<$tag>New Heading</$tag>", $fromDB);
        }

        foreach($simpleTags as $tag)
        {
            self::$reqClient->post(array('a'=>'system/settings/subHeading'), array('subHeading' => "New Heading</$tag>"));
            $fromDB = $this->getSetting("subheading");
            $this->assertNotNull($fromDB);
            $this->assertEquals("<$tag>New Heading</$tag>", $fromDB);
        }
    }

    public function getSetting($settingName){
        $settings = self::$db->query_kv("SELECT * FROM settings WHERE setting = '$settingName'", 'setting', 'data');

        return $settings[$settingName];
    }
}
