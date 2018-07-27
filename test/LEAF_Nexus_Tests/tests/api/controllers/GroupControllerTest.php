<?php

declare(strict_types = 1);

use LEAFTest\LEAFClient;

/**
 * Tests the LEAF_Nexus/api/?a=group API
 */
class GroupControllerTest extends DatabaseTest
{
    private static $client = null;

    protected function setUp()
    {
        $this->resetDatabase();
        self::$client = LEAFClient::createNexusClient();
    }

    /**
     * Tests the `group/<id>/employees/detailed` endpoint
     */
    public function testListGroupEmployees() : void
    {
        $results = self::$client->get('?a=group/1/employees/detailed');

        $users = $results['users'];
        $meta = $results['querymeta'];

        $this->assertNotNull($users);
        $this->assertNotNull($meta);

        $this->assertEquals(1, $meta['totalusers']);

        $this->assertEquals(1, count($users));

        $emp1 = $users[0];
        $this->assertEquals(1, $emp1['empUID']);
        $this->assertEquals(1, $emp1['groupID']);
        $this->assertEquals('tester', $emp1['userName']);
        $this->assertNotNull($emp1['data']);
        $this->assertEquals(7, count($emp1['data']));
        $this->assertNotNull($emp1['positions']);
    }

    /**
     * Tests the `group/[digit]` endpoint.
     */
    public function testNewGroup() : void
    {
        $group = self::$client->get('?a=group/14');
        // group with id 14 does not exist, so it's title will be false
        $this->assertFalse($group['title']);

        $newGroup = array(
            'title' => "NEWTESTGROUPTITLE<script lang='javascript'>alert('hi')</script>",
        );

        self::$client->postEncodedForm('?a=group', $newGroup);

        $group = self::$client->get('group/14');

        $this->assertNotNull($group['title']);
        $this->assertEquals('NEWTESTGROUPTITLEalert(&#039;hi&#039;)', $group['title']);
    }

    /**
     * Tests the `group/[digit]/title` endpoint.
     */
    public function testEditTitle() : void
    {
        $group = self::$client->get('group/13');
        $this->assertEquals('Test Group Title 2', $group['title']);

        self::$client->postEncodedForm('?a=group/13/title', array('title' => "NEWTITLE<script lang='javascript'>alert('hi')</script>"));

        $group = self::$client->get('group/13');
        $this->assertEquals('NEWTITLEalert(&#039;hi&#039;)', $group['title']);
    }

    /**
    * Tests the `group/[digit]/tag` endpoint.
    */
    public function testEditTag() : void
    {
        $group = self::$client->get('?a=group/tag&tag=TESTTAG');
        $this->assertEquals(0, count($group));

        self::$client->postEncodedForm('?a=group/13/tag', array('tag' => "TESTTAG"));

        $group = self::$client->get('?a=group/tag&tag=TESTTAG');
        $this->assertEquals('TESTTAG', $group[0]['tag']);
    }

    /**
    * Tests the Data.php::sanitizeInput method
    */
    public function testAddTag_invalidInput() : void
    {
        //create a bad tag
        $badTag = "123-45-6789";
        self::$client->postEncodedForm('?a=group/13/tag', array('tag' => $badTag));
        $group = self::$client->get('?a=group/tag&tag='.$badTag);
        
        //test to make sure it is masked
        $this->assertEquals('###-##-####', $group[0]['tag']);
    }
    
    /**
     * Tests the `group/search` endpoint.
     */
    public function testSearchTag() : void
    {
        self::$client->postEncodedForm('?a=group/13/tag', array('tag' => "TESTTAG"));

        $group = self::$client->get('?a=group/search&tag=TESTTAG');

        $this->assertEquals('13', $group[0]['groupID']);
    }

    /**
     * Tests the `group/[digit]/tag` endpoint for deletion.
     */
    public function testDeleteTag() : void
    {
        //create a tag and check to make sure the it was successfully made
        self::$client->postEncodedForm('?a=group/13/tag', array('tag' => "TESTTAG"));
        $group = self::$client->get('?a=group/tag&tag=TESTTAG');
        $this->assertNotEquals(0, count($group));
        $this->assertEquals('TESTTAG', $group[0]['tag']);

        //delete tag
        self::$client->delete('group/13/tag&tag=TESTTAG');

        $group = self::$client->get('?a=group/tag&tag=TESTTAG');
        $this->assertEquals(0, count($group));
    }

    /**
     * Tests the `group/[digit]` endpoint for deletion.
     */
    public function testDeleteGroup() : void
    {
        $group = self::$client->get('?a=group/14');
        // group with id 14 does not exist, so it's title will be false
        $this->assertFalse($group['title']);

        $newGroup = array(
            'title' => "NEWTESTGROUPTITLE<script lang='javascript'>alert('hi')</script>",
        );

        self::$client->postEncodedForm('?a=group', $newGroup);

        $group = self::$client->get('group/14');

        $this->assertNotNull($group['title']);
        $this->assertEquals('NEWTESTGROUPTITLEalert(&#039;hi&#039;)', $group['title']);

        self::$client->delete('?a=group/14');
        
        // group with id 14 has been deleted, so it's title will be false
        $group = self::$client->get('?a=group/14');
        $this->assertFalse($group['title']);
    }

    /**
     * Tests the `group/[digit]/employee/[digit]` endpoint for deletion.
     */
    public function testRemoveEmployee() : void
    {
        //Checks to make sure employee exists
        $results = self::$client->get('?a=group/1/employees/detailed');
        $users = $results['users'];
        $this->assertNotNull($users[0]);
        
        self::$client->delete('group/1/employee/1');

        //Checks to make sure employee is deleted
        $results = self::$client->get('?a=group/1/employees/detailed');
        $users = $results['users'];
        $this->assertEquals(0, count($users));
    }

    /**
     * Tests the `group/[digit]/positions/[digit]` endpoint for deletion.
     */
    public function testRemovePosition() : void
    {
        $results = self::$client->get('group/1/positions');
        $this->assertNotNull($results[0]);
        $this->assertNotNull($results[1]);
        //Checks to make sure positions exist
        $nextPosition = $results[1];
        $this->assertNotNull($nextPosition);
        //Stores what was in the next position and makes sure it exists

        self::$client->delete('group/1/position/1');

        $results = self::$client->get('group/1/positions');
        $this->assertEquals($nextPosition["positionID"], $results[0]["positionID"]);
        $this->assertEquals($nextPosition["groupID"], $results[0]["groupID"]);
        $this->assertEquals($nextPosition["parentID"], $results[0]["parentID"]);
        $this->assertEquals($nextPosition["positionTitle"], $results[0]["positionTitle"]);
        $this->assertEquals($nextPosition["phoneticPositionTitle"], $results[0]["phoneticPositionTitle"]);
        $this->assertEquals($nextPosition["numberFTE"], $results[0]["numberFTE"]);
        //Checks to make sure position is deleted and replaced with next position
    }

    /**
     * Tests the `group/[digit]/positions` endpoint.
     */
    public function testListGroupsPositions() : void
    {
        $results = self::$client->get('group/1/positions');
        $this->assertNotNull($results[0]);
        $this->assertEquals("1", $results[0]["positionID"]);
        $this->assertEquals("1", $results[0]["groupID"]);
        $this->assertEquals('0', $results[0]["parentID"]);
        $this->assertEquals('Medical Center Director', $results[0]["positionTitle"]);
        $this->assertEquals('MTKLSNTRTRKTR', $results[0]["phoneticPositionTitle"]);
        $this->assertEquals("1", $results[0]["numberFTE"]);
        $this->assertNotNull($results[1]);
        $this->assertEquals("2", $results[1]["positionID"]);
        $this->assertEquals("1", $results[1]["groupID"]);
        $this->assertEquals('0', $results[1]["parentID"]);
        $this->assertEquals('Test Position Title Super', $results[1]["positionTitle"]);
        $this->assertEquals('TPTS', $results[1]["phoneticPositionTitle"]);
        $this->assertEquals("1", $results[1]["numberFTE"]);
    }

    /**
     * Tests the `group/[digit]/employees` endpoint.
     */
    public function testListGroupsEmployees() : void
    {
        $results = self::$client->get('group/1/employees');
        $this->assertNotNull($results[0]);
        $this->assertEquals("1", $results[0]["empUID"]);
        $this->assertEquals("tester", $results[0]["userName"]);
        $this->assertEquals('tester', $results[0]["lastName"]);
        $this->assertEquals('tester', $results[0]["firstName"]);
        $this->assertEquals('tester', $results[0]["middleName"]);
        $this->assertEquals("tester", $results[0]["phoneticFirstName"]);
        $this->assertEquals('tester', $results[0]["phoneticLastName"]);
        $this->assertEquals('', $results[0]["domain"]);
        $this->assertEquals("0", $results[0]["deleted"]);
        $this->assertEquals("0", $results[0]["lastUpdated"]);
    }

    /**
     * Tests the `group/[digit]/employees/detailed` endpoint.
     */
    public function testListGroupEmployeesDetailed() : void
    {
        $results = self::$client->get('?a=group/1/employees/detailed');
        $this->assertNotNull($results['users']);
        $this->assertEquals("1", $results['users'][0]["empUID"]);
        $this->assertEquals("1", $results['users'][0]["groupID"]);
        $this->assertNull($results['users'][0]["positionID"]);
        $this->assertNull($results['users'][0]["isActing"]);
        $this->assertEquals("tester", $results['users'][0]["userName"]);
        $this->assertEquals('tester', $results['users'][0]["lastName"]);
        $this->assertEquals('tester', $results['users'][0]["firstName"]);
        $this->assertEquals('tester', $results['users'][0]["middleName"]);
        $this->assertEquals("tester", $results['users'][0]["phoneticFirstName"]);
        $this->assertEquals('tester', $results['users'][0]["phoneticLastName"]);
        $this->assertEquals('', $results['users'][0]["domain"]);
        $this->assertEquals("0", $results['users'][0]["deleted"]);
        $this->assertEquals("0", $results['users'][0]["lastUpdated"]);
    }
}
