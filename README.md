# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["This is the registration page"](https://github.com/Chulainn1/tinyapp/raw/master/docs/signup.png)
!["This shows the home page with all the urls"](https://github.com/Chulainn1/tinyapp/raw/master/docs/urls.png)
!["this shows the page where you create urls"](https://github.com/Chulainn1/tinyapp/raw/master/docs/create.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

1. Install all dependencies (using the `npm install` command).
2. Run the development web server using the `node express_server.js` command.
3. Make sure to use `localhost:8080` in your browser. 


### How To Guide

#### Sign Up/Login

Before you can create your first short url, you must create an account. After account creation you will have access to edit and delete functionality. 

Create your account by clicking the top right `Sign Up` button, enter your email and password accordingly. 

#### New Links

Now that you have an account you can click the `Create New URL` button on the navigation bar. Enter the URL you want to shorten and hit submit. 

#### Edit/Delete Links

You can see your links by clicking `My URLs` on the  navigation bar. You now have the option to edit and delete your links. 

Clicking edit will prompt you to enter your new URL associated with that short url. 

Simply press delete to remove the link. 

#### Use It 

Within the Edit page you have the option to click the short URL which will redirect you to the long url.

Otherwise, the path for the short url is /u/:shortURL. 

Example:

localhost:8080/u/:alkAf
