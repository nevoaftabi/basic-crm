# CRM Backend

* Users can make an account. Details such as the name and email can be modified with API calls
* Users can create customers which are tied to their account
* Customer details can be modified with API calls
* Handles broken JSON requests
* Handles bad input like invalid PUT requests with Zod

# Technologies Used
* PostgreSQL - the database for storing the users and customers
* Prisma - the ORM for interfacing with the database
* Express.js - used for the server 
* JSON Web Token - used for authentication