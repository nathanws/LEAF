<?php

declare(strict_types = 1);

use LEAFTest\LEAFClient;

/**
 * Tests the LEAF_Nexus/api/employee API
 */
class EmployeeControllerTest extends DatabaseTest
{
    private static $client = null;

    protected function setUp()
    {
        $this->resetDatabase();
        self::$client = LEAFClient::createNexusClient();
    }
    /**
     * Tests the 'employee/new' endpoint, the 'employee/[digit]' endpoint,
     * and the 'employee/[digit]' endpoint for deletion
     */
    public function testCreateAndDeleteEmployee() : void
    {
        //create new employee
        $newEmployee = array('firstName' => 'new', 
                             'lastName' => 'guy', 
                             'middleName' => '', 
                             'userName' => 'newguy123');
        self::$client->postEncodedForm('employee/new', $newEmployee);

        //initial value
        $employee = self::$client->get('employee/2');
        $this->assertEquals('0', $employee['employee']['deleted']);

        //disable employee
        self::$client->delete('employee/2');

        //new value, when deleted, value is the time of deletion
        $employee = self::$client->get('employee/2');
        $this->assertEquals(time(), $employee['employee']['deleted']);

        //reactivates employee
        self::$client->postEncodedForm('employee/2/activate', array());

        //checks to see if change was successful
        $employee = self::$client->get('employee/2');
        $this->assertEquals('0', $employee['employee']['deleted']);
    }
    /**
     * Tests the 'employee/[digit]/backup' endpoint, the 'employee/[digit]/backupFor' endpoint,
     * the 'employee/[digit]/backup/[digit]' endpoint for deletion
     */
    public function testEmployeeBackup() : void
    {
        //create new employee
        $newEmployee = array('firstName' => 'new', 'lastName' => 'guy', 'middleName' => '', 'userName' => 'newguy123');
        self::$client->postEncodedForm('employee/new', $newEmployee);

        //initial value
        $employee = self::$client->get('employee/2');
        $this->assertNotNull($employee);

        //create backup of tester
        self::$client->postEncodedForm('employee/2/backup', array('backupEmpUID' => '2'));

        //checks if backup successful
        $backup = self::$client->get('employee/2/backup');
        $this->assertEquals('2', $backup[0]['empUID']);
        $this->assertEquals('2', $backup[0]['backupEmpUID']);

        //checks other get backup endpoint
        $backup = self::$client->get('employee/2/backupFor');
        $this->assertEquals('2', $backup[0]['empUID']);
        $this->assertEquals('2', $backup[0]['backupEmpUID']);

        //deletes backup
        self::$client->delete('employee/2/backup/2');

        //checks if backup removal successful
        $backup = self::$client->get('employee/2/backup');
        $this->assertEquals(0, count($backup));
    }
}
