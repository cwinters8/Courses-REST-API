
# REST API Project
A REST API for managing a database of courses.

Ninth project in the [Team Treehouse](http://referrals.trhou.se/clarkwinters) Full Stack JavaScript Techdegree.

## Getting Started

To get up and running with this project, run the following commands from the root of the folder that contains this README file.

First, install the project's dependencies using `npm`.

```
npm install
```

Second, ensure that you have MongoDB installed globally on your system.

* Open a `Command Prompt` (on Windows) or `Terminal` (on Mac OS X) instance and run the command `mongod` (or `sudo mongod`) to start the MongoDB daemon.
* If that command failed then you’ll need to install MongoDB.
* [How to Install MongoDB on Windows](http://treehouse.github.io/installation-guides/windows/mongo-windows.html)
* [How to Install MongoDB on a Mac](http://treehouse.github.io/installation-guides/mac/mongo-mac.html)

Third, seed your MongoDB database with data.

```
npm run seed
```

And lastly, start the application.

```
npm start
```

To test the Express server, browse to the URL [http://localhost:5000/](http://localhost:5000/).

## API Routes
| Type   | Route             | Description                              | Auth Required | Request body fields                                    |
| ------ | ----------------- | ---------------------------------------- | ------------- | ------------------------------------------------------ |
| POST   | /api/users        | Creates a new user                       | False         | firstName, lastName, emailAddress, password            |
| GET    | /api/users        | Returns the currently authenticated user | True          | N/A                                                    |
| GET    | /api/courses      | Returns a full list of courses           | False         | N/A                                                    |
| GET    | /api/courses/{id} | Returns a specific course                | False         | N/A                                                    |
| POST   | /api/courses      | Creates a new course                     | True          | title, description, [estimatedTime], [materialsNeeded] |
| PUT    | /api/courses/{id} | Updates a course                         | True          | title, description, [estimatedTime], [materialsNeeded] |
| DELETE | /api/courses/{id} | Deletes a course                         | True          | N/A                                                    |

## Technologies Used
JavaScript  
Node.js  
Express  
MongoDB  
Mongoose  
Encryption  