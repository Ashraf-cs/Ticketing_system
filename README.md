<h2>Ticketing_system</h2>
<h4><i>Technical support ticketing system</i></h4>


<p>Enables you to manage your orgnization technicial support tasks, let users (employees) create support tickets and follow up the their advance, and let technicians to follow up their tickets and solve them.

<br><br>
<h3>Highlights</h3>

<ul>
  <li>User can creates tickets and follow up their advance with all tickets which who own are listed</li>
  <li>Technician can follow up all tickets which who own and solve them </li>
  <li>System admin can follow up all tickets and reassign a ticket to another technician manually</li>
  <li>System admin can solve any ticket</li>
  <li>System admin can manage departments, employees, technicians</li>
</ul>

<br><br>
<h3>Installation</h3>
<p>Make sure you have Node.js and MySQL server installed</p>

<ol>
  <li>Clone the repository to directory you desired</li>
  <br>
  <li>In the terminal:</li>
  <ul>
    <li>Change directory to frontend folder and type <code>npm install</code></li>
    <li>Change directory to backend folder and type <code>npm install</code></li>
  </ul>
  <br>
  <li>Edit <b>.env</b> file with your secret key and database settings (user and password)</li>
  <br>
  <li>Open MySQL Shell and type <code>\. full_system_directory/Ticketing_system/backend/db_init.txt</code> to create the databse and related tables and content
  <div>
    <i><b>* Note:</b> make sure the database user has the rights to create database and you are in 'SQL processing mode' in the Shell</i>
  </div>
  <br>
  <li>Go to backend and frontend folders, type in the terminal <code>npm start</code> one for each</li>
  <br>
  <li>Now, in the browser go to <code>localhost:3000</code> and login with default super system admin '<b>sysmin</b>' with password '<b>sysmin123</b>'
  <div>
    <i>* You can change the password manually and save it as hashed string using bcrypt package in Node.js REPL session (command line)</i>
  </div>

